// rafce
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const MapView = ({ center, slots }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) return <p className="p-4">Loading Map...</p>;

  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <GoogleMap
        center={center}
        zoom={14}
        mapContainerStyle={{ width: "100%", height: "100%" }}
      >
        {slots.map((s) => (
          <Marker
            key={s.id}
            position={{ lat: Number(s.latitude), lng: Number(s.longitude) }}
            title={`${s.name} (${s.type})`}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default MapView;
