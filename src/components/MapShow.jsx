import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import MapSetter from "./MapSetter";

function MapShow({ data, sourceType }) {
  console.log("Data:", data);
  console.log("sourceType", sourceType);
  //vychozi stred a zoom
  const defaultCenter = [50.0755, 14.4378]; // Praha
  const defaultZoom = 8;

  // první zaznam s GPS souradnicemi z BTS dat
  const validData =
    sourceType === "gps"
      ? data.filter(
          (item) =>
            item.latitude &&
            item.longitude &&
            !isNaN(parseFloat(item.latitude)) &&
            !isNaN(parseFloat(item.longitude))
        )
      : data.filter(
          (item) =>
            item.lat &&
            item.long &&
            !isNaN(parseFloat(item.lat)) &&
            !isNaN(parseFloat(item.long))
        );
  //kontrola vstupnich dat

  // console.log("Calculated Center:", center);

  // Střed mapy se nastaví podle prvního validního bodu, nebo na výchozí hodnoty
  const center =
    validData.length > 0
      ? [
          parseFloat(
            sourceType === "gps" ? validData[0].latitude : validData[0].lat
          ),
          parseFloat(
            sourceType === "gps" ? validData[0].longitude : validData[0].long
          ),
        ]
      : defaultCenter;

  // Připravíme pole souřadnic pro vykreslení čáry !!!!!! ted to bere data z BTS, ne GPS!!!!
  const polylineCoordinates = validData.map((item) => [
    parseFloat(sourceType === "gps" ? item.latitude : item.lat),
    parseFloat(sourceType === "gps" ? item.longitude : item.long),
  ]);

  return (
    <MapContainer
      center={center}
      zoom={defaultZoom}
      style={{ height: "500px", width: "800px" }}
    >
      <MapSetter center={center} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />

      {sourceType === "gps" && (
        <Polyline positions={polylineCoordinates} color="blue" weight={3} />
      )}

      {sourceType === "bts" &&
        validData.map((item, index) => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.long);
          return (
            <Marker key={index} position={[lat, lng]}>
              <Popup>
                <strong>BTS {item.cid}</strong>
                <br />
                Čas: {item.sys_time}
                <br />
                RSSI: {item.rssi}
                <br />
                Technologie: {item.tech}
                <br />
                ARFCN: {item.arfcn}
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}

export default MapShow;
