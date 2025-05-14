import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import MapSetter from "./MapSetter";

const customIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapShow({ data, sourceType }) {
  // console.log("Data:", data);
  // console.log("sourceType", sourceType);

  //vychozi stred a zoom
  const defaultCenter = [50.0755, 14.4378]; // Praha
  const defaultZoom = 12;

  // prirazeni souradnic dle zdroje, BTS pouze pro vycentrovani mapy
  // GPS data pouzivaji dlouhy zapis
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

  // Nastaveni stredu mapy na zaklade zdroje
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

  // souradnice GPS dat pro vykresleni
  const polylineCoordinates = validData.map((item) => [
    parseFloat(item.latitude),
    parseFloat(item.longitude),
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
            <Marker key={index} position={[lat, lng]} icon={customIcon}>
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
