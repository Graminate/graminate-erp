import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/utils/loadGoogleMaps";

import type { Maps } from "@/types/card-props";

const Maps = ({
  apiKey,
  initialCenter = { lat: 26.244156, lng: 92.537842 }, // Default center to Assam
  initialZoom = 8,
  onStateChange,
}: Maps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMaps(apiKey);

        const getUserLocation = () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                createMap({ lat: latitude, lng: longitude }, 12);
              },
              () => createMap(initialCenter, initialZoom)
            );
          } else {
            console.warn("Geolocation is not supported by this browser.");
            createMap(initialCenter, initialZoom);
          }
        };

        const createMap = (center: google.maps.LatLngLiteral, zoom: number) => {
          if (mapContainerRef.current) {
            const newMap = new google.maps.Map(mapContainerRef.current, {
              center,
              zoom,
              mapTypeControl: false,
              fullscreenControl: false,
              streetViewControl: false,
            });

            newMap.addListener("idle", () => {
              if (onStateChange) {
                onStateChange({
                  center: newMap.getCenter()?.toJSON() || center,
                  zoom: newMap.getZoom() || zoom,
                });
              }
            });

            setMap(newMap);
          }
        };

        getUserLocation();
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initializeMap();
  }, [apiKey, initialCenter, initialZoom, onStateChange]);

  return <div ref={mapContainerRef} id="map" className="w-full h-screen"></div>;
};

export default Maps;
