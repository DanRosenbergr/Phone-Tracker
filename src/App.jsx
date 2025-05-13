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
  const [activeSource, setActiveSource] = useState("bts"); // nebo 'gps'

  // zpracovani CSV souboru a ziskani BTS dat
  const handleFileUploadBTS = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const csv = e.target.result;
      const rows = csv.split("\n");

      const uniqueCells = new Set([]); // pole unikatnich hodnot
      const processedBTSData = [];

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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(e.target.result, "text/xml");

      const trackPoints = xmlDoc.getElementsByTagName("trkpt");
      const data = [];

      for (let i = 0; i < trackPoints.length; i++) {
        const trkpt = trackPoints[i];
        const latitude = trkpt.getAttribute("lat");
        const longitude = trkpt.getAttribute("lon");
        const elevation = trkpt.getElementsByTagName("ele")[0]?.textContent;
        const time = trkpt.getElementsByTagName("time")[0]?.textContent;

        const seconds = new Date(time).getSeconds();
        if (seconds % 10 === 0) {
          data.push({
            latitude,
            longitude,
            elevation,
            time,
          });
        }
      }
      setGpsData(data);
    };
    reader.readAsText(file);
  };
  // funkce na poslani BTS dat backendu
  const sendBTSData = () => {
    if (!btsData || btsData === 0) {
      console.error("Neco spatne s BTS daty");
      return;
    }
    axios
      .post("http://localhost/phone-tracker/btsdata", { data: btsData })
      .then((response) => {
        console.log("Data spesne odeslana:", response.data);
      })
      .catch((error) => {
        console.error("Chyba pri odesilani dat:", error);
      });
  };
  // funkce na poslani GPS dat backendu
  const sendGPSData = () => {
    if (!gpsData || gpsData === 0) {
      console.error("Neco spatne s GPS daty");
      return;
    }
    axios
      .post("http://localhost/phone-tracker/btsdata", { data: gpsData })
      .then((response) => {
        console.log("Data spesne odeslana:", response.data);
      })
      .catch((error) => {
        console.error("Chyba pri odesilani dat:", error);
      });
  };
  return (
    <>
      <div className="container">
        {/*Header*/}
        {/* <div className="sourceData d-flex justify-content-center align-items-center text-center"></div> */}
        {/*main window */}
        <div className="mainWindow">
          <div className="BTSupload ">
            <p>Upload BTS data in CSV format</p>
            <div>
              <label htmlFor="btsFile" className="btn btn-primary">
                upload BTS data here...{" "}
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
            <button className="btn btn-warning">Load</button>
          </div>
          <div className="BTSdata">{<BTSdataTable btsData={btsData} />}</div>
          <div className="sourceSwitch">
            <button
              className="btn btn-success"
              onClick={() => setActiveSource("bts")}
            >
              Show BTS towers data
            </button>
            <button
              className="btn btn-success"
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
            <p>Upload GPS data inGPX format</p>
            <div>
              <label htmlFor="gpsFile" className="btn btn-primary">
                upload GPS data here...{" "}
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
            <button className="btn btn-warning">Load</button>
          </div>
          <div className="GPSdata">{<GPSdataTable gpsData={gpsData} />}</div>
        </div>
      </div>
    </>
  );
}
export default App;
