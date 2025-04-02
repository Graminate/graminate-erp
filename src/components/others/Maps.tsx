import React, { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/utils/loadLocation";

export interface MarkerData {
  id: string;
  position: google.maps.LatLngLiteral;
  title?: string;
}

interface MapsProps {
  apiKey: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  markers?: MarkerData[];
  onStateChange?: (state: {
    center: google.maps.LatLngLiteral;
    zoom: number;
  }) => void;
}

const DEFAULT_CENTER = { lat: 51.1657, lng: 10.4515 }; 
const DEFAULT_ZOOM = 6;

const Maps = ({
  apiKey,
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
  markers = [],
  onStateChange,
}: MapsProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const markerInstancesRef = useRef<Map<string, google.maps.Marker>>(new Map());

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        await loadGoogleMaps(apiKey);
        if (!isMounted) return;

        const newMap = new google.maps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
        });

        newMap.addListener("idle", () => {
          if (onStateChange && isMounted) {
            const center = newMap.getCenter();
            const zoom = newMap.getZoom();
            if (center && zoom !== undefined) {
              onStateChange({
                center: center.toJSON(),
                zoom: zoom,
              });
            }
          }
        });

        setMap(newMap);
      } catch (error) {
        console.error("Error loading or initializing Google Maps:", error);

        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML =
            '<p class="text-red-500 text-center p-4">Could not load map.</p>';
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
    };
  }, [apiKey, initialCenter, initialZoom, onStateChange]);

  useEffect(() => {
    if (!map) return;

    const currentMarkerInstances = markerInstancesRef.current;
    const newMarkerInstances = new Map<string, google.maps.Marker>();
    const incomingMarkerIds = new Set(markers.map((m) => m.id));

    markers.forEach((markerData) => {
      if (currentMarkerInstances.has(markerData.id)) {
      
        const existingMarker = currentMarkerInstances.get(markerData.id)!;

        newMarkerInstances.set(markerData.id, existingMarker);
        currentMarkerInstances.delete(markerData.id); 
      } else {
 
        const newMarker = new google.maps.Marker({
          position: markerData.position,
          map: map,
          title: markerData.title,
      
        });
        newMarkerInstances.set(markerData.id, newMarker);
      }
    });

    
    currentMarkerInstances.forEach((markerToRemove) => {
      markerToRemove.setMap(null); 
    });

    markerInstancesRef.current = newMarkerInstances;

    return () => {};
  }, [map, markers]);

  useEffect(() => {
    return () => {
      if (markerInstancesRef.current) {
        markerInstancesRef.current.forEach((marker) => {
          marker.setMap(null);
        });
        markerInstancesRef.current.clear();
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      id="map"
      className="w-full h-full"
      style={{ minHeight: "300px" }}
    />
  );
};

export default Maps;
