import React from "react";

function GPSdataTable({ gpsData }) {
  // fuknce na prevedeni formatu cas
  function formatGPXTime(gpxTime) {
    if (!gpxTime || gpxTime.length < 19) return gpxTime;

    const year = gpxTime.slice(0, 4);
    const month = gpxTime.slice(5, 7);
    const day = gpxTime.slice(8, 10);
    const hour = gpxTime.slice(11, 13);
    const minute = gpxTime.slice(14, 16);

    return `${day}.${month}.${year} ${hour}:${minute}`;
  }
  return (
    <>
      <p className="text-center">GPS data</p>
      <table className="table">
        <thead>
          <tr>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Altitude</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {gpsData.map((point, index) => (
            <tr key={index}>
              <td>{point.latitude}</td>
              <td>{point.longitude}</td>
              <td>{point.elevation}</td>
              <td>{formatGPXTime(point.time)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
export default GPSdataTable;
