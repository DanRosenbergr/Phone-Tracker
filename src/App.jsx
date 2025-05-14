import { useState } from "react";
import axios from "axios";
import "./App.css";
import BTSdataTable from "./components/BTSdataTable.jsx";
import GPSdataTable from "./components/GPSdataTable.jsx";
import MapShow from "./components/MapShow.jsx";
import "leaflet/dist/leaflet.css";

function App() {
  const [btsData, setBtsData] = useState([]);
  const [gpsData, setGpsData] = useState([]);
  const [activeSource, setActiveSource] = useState("bts");
  const [savedRecordsBTS, setSavedRecordsBTS] = useState([]);
  const [savedRecordsGPS, setSavedRecordsGPS] = useState([]);
  const [showListBTS, setShowListBTS] = useState(false);
  const [showListGPS, setShowListGPS] = useState(false);

  // zpracovani CSV souboru a ziskani BTS dat
  const handleFileUploadBTS = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const csv = e.target.result;
      const rows = csv.split("\n");

      const uniqueCells = new Set([]); // pole unikatnich hodnot
      const processedBTSData = [];

      //smycka pro vyhledani unikatnich BTS vezi a nasledne ulozeni adekvatnich dat do pole
      rows.slice(1).forEach((row) => {
        const columns = row.split(";");
        const cid = columns[21];
        if (!cid || uniqueCells.has(cid)) return;

        uniqueCells.add(cid);

        processedBTSData.push({
          sys_time: columns[1], // systémový čas
          cid: cid, // ID buňky
          rssi: columns[23], // síla signálu
          tech: columns[16], // technologie
          arfcn: columns[32], // číslo kanálu
          lat: columns[29],
          long: columns[30],
        });
      });
      setBtsData(processedBTSData);
    };
    reader.readAsText(file);
  };
  // zpracovani GPX souboru a ziskani GPS dat
  const handleFileUploadGPS = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(e.target.result, "text/xml");

      const trackPoints = xmlDoc.getElementsByTagName("trkpt");
      const processedGPSdata = [];

      for (let i = 0; i < trackPoints.length; i++) {
        const trkpt = trackPoints[i];
        const latitude = trkpt.getAttribute("lat");
        const longitude = trkpt.getAttribute("lon");
        const elevation = trkpt.getElementsByTagName("ele")[0]?.textContent;
        const time = trkpt.getElementsByTagName("time")[0]?.textContent;

        //do dat se uklada kazda 10 sekunda
        if (time.slice(-2, -1) === "0") {
          processedGPSdata.push({
            latitude,
            longitude,
            elevation,
            time,
          });
        }
      }
      setGpsData(processedGPSdata);
    };
    reader.readAsText(file);
  };

  // funkce na poslani BTS dat backendu
  const sendBTSData = () => {
    if (!btsData.length) {
      console.error("Neco spatne s BTS daty");
      return;
    }
    const nameBts = prompt("Zadejte nazev zaznamu:");
    axios
      .post("https://localhost/phone-tracker/btsdata/index.php", {
        data: btsData,
        nameBts,
      })
      .then((response) => {
        console.log("Data uspesne odeslana:", response.data);
      })
      .catch((error) => {
        console.error("Chyba pri odesilani dat:", error);
      });
  };
  // funkce na poslani GPS dat backendu
  const sendGPSData = () => {
    if (!gpsData.length) {
      console.error("Neco spatne s GPS daty");
      return;
    }
    const nameGps = prompt("Zadejte nazev zaznamu:");
    axios
      .post("http://localhost/phone-tracker/gpsdata/index.php", {
        data: gpsData,
        nameGps,
      })
      .then((response) => {
        console.log("Data spesne odeslana:", response.data);
      })
      .catch((error) => {
        console.error("Chyba pri odesilani dat:", error);
      });
  };

  // Nacteni zaznamu BTS z backendu
  const loadBtsRecords = () => {
    axios
      .get("http://localhost/phone-tracker/records?source=bts")
      .then((response) => {
        setSavedRecordsBTS(response.data);
        setShowListBTS(true);
      })
      .catch((error) => {
        console.error("chyba nacitani zaznamu BTS:", error);
      });
  };
  //Nacteni zaznamu GPS z backendu
  const loadGpsRecords = () => {
    axios
      .get("http://localhost/phone-tracker/records?source=gps")
      .then((response) => {
        setSavedRecordsGPS(response.data);
        setShowListGPS(true);
      })
      .catch((error) => {
        console.error("chyba nacitani zaznamu GPS:", error);
      });
  };

  // Nacteni konretniho zaznamu BTS
  const loadBtsData = (recordIdBTS) => {
    axios
      .get(`http://localhost/phone-tracker/recordsBTS/${recordIdBTS}`)
      .then((response) => {
        setBtsData(response.data);
        setShowListBTS(false);
      })
      .catch((error) => {
        console.error("chyba pri nacitani jednoho zaznamu BTS:", error);
      });
  };

  // Nacteni konretniho zaznamu GPS
  const loadGpsData = (recordIdGPS) => {
    axios
      .get(`http://localhost/phone-tracker/recordsGPS/${recordIdGPS}`)
      .then((response) => {
        setGpsData(response.data);
        setShowListGPS(false);
      })
      .catch((error) => {
        console.error("chyba pri nacitani jednoho zaznamu GPS", error);
      });
  };

  return (
    <>
      <div className="container">
        <div className="mainWindow">
          <div className="BTSupload ">
            <p>Upload BTS data in CSV format</p>
            <div>
              <label htmlFor="btsFile" className="btn btn-primary">
                upload BTS data here...
              </label>
              <input
                type="file"
                id="btsFile"
                accept=".csv"
                onChange={handleFileUploadBTS}
                style={{ display: "none" }}
              />
            </div>
          </div>
          <div className="BTSdataHandle">
            <button className="btn btn-success" onClick={sendBTSData}>
              Save
            </button>
            <button className="btn btn-warning" onClick={loadBtsRecords}>
              Load
            </button>
          </div>
          <div className="BTSwindow">
            {showListBTS ? (
              <div className="BTSRecords">
                <p>Saved BTS Records</p>
                <ul>
                  {savedRecordsBTS.map((record) => (
                    <li
                      key={record.id}
                      onClick={() => loadBtsData(record.id)}
                      className="BTSrecordItem"
                    >
                      {record.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="BTSdata">
                {<BTSdataTable btsData={btsData} />}
              </div>
            )}
          </div>
          <div className="sourceSwitch">
            <button
              className="btn btn-success btnSwitch"
              onClick={() => setActiveSource("bts")}
            >
              Show BTS towers data
            </button>
            <button
              className="btn btn-success btnSwitch"
              onClick={() => setActiveSource("gps")}
            >
              Show GPS track polyline
            </button>
          </div>
          <div className="MapShow">
            <MapShow
              data={activeSource === "bts" ? btsData : gpsData}
              sourceType={activeSource}
            />
          </div>
          <div className="GPSupload">
            <p>Upload GPS data in GPX format</p>
            <div>
              <label htmlFor="gpsFile" className="btn btn-primary">
                upload GPS data here...
              </label>
              <input
                type="file"
                id="gpsFile"
                accept=".gpx"
                onChange={handleFileUploadGPS}
                style={{ display: "none" }}
              />
            </div>
          </div>
          <div className="GPSdataHandle">
            <button className="btn btn-success" onClick={sendGPSData}>
              Save
            </button>
            <button className="btn btn-warning" onClick={loadGpsRecords}>
              Load
            </button>
          </div>
          <div className="GPSwindow">
            {showListGPS ? (
              <div className="GPSRecords">
                <p>Saved GPS Records</p>
                <ul>
                  {savedRecordsGPS.map((record) => (
                    <li
                      key={record.id}
                      onClick={() => loadGpsData(record.id)}
                      className="GPSrecordItem"
                    >
                      {record.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="GPSdata">
                {<GPSdataTable gpsData={gpsData} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
export default App;
