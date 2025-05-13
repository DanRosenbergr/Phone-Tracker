import { useEffect } from "react";
import { useMap } from "react-leaflet";

function MapSetter({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default MapSetter;
