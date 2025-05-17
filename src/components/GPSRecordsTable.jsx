import React from "react";
import "./RecordsTable.css";

function BTSRecordsTable({ gpsRecords, loadGpsData, handleDelete }) {
  return (
    <>
      <p className="text-center fw-bold p-2">Saved GPS Records</p>
      {gpsRecords.map((item) => {
        return (
          <div className=" ms-3 me-3" key={item.id}>
            <div className=" datarow  d-flex justify-content-between">
              <span>{item.name}</span>
              <div>
                <button
                  onClick={() => loadGpsData(item.id)}
                  className="btn btn-outline-success btnDel"
                >
                  Load
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-outline-danger btnDel"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
export default BTSRecordsTable;
