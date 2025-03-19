import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import FinderBar from "@/components/layout/Finderbar";
import NavPanel from "@/components/layout/NavPanel";
import Maps from "@/components/others/Maps";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";

type View = "distributor" | "exporter" | "factories";

interface Button {
  name: string;
  view: View;
}

const buttons: Button[] = [
  { name: "Distributor", view: "distributor" },
  { name: "Exporter", view: "exporter" },
  { name: "Factories", view: "factories" },
];

const FinderPage: React.FC = () => {
  // Grab the user_id param from the URL (if needed)
  const router = useRouter();
  const { user_id } = router.query;

  // Manage the active view state
  const [activeView, setActiveView] = useState<View>("distributor");

  // Manage the map state
  const [mapState, setMapState] = useState<{
    center: { lat: number; lng: number };
    zoom: number;
  }>({
    center: { lat: 51.1657, lng: 10.4515 },
    zoom: 6,
  });
  const [error, setError] = useState<string | null>(null);

  // Retrieve the API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Handle navigation events from NavPanel
  const handleNavigation = (newView: View) => {
    setActiveView(newView);
  };

  // Helper function to get the current geolocation
  const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          reject("Unable to fetch location. Please enable location services.");
        }
      );
    });
  };

  // On mount, try to get the user's current location
  useEffect(() => {
    (async () => {
      try {
        const location = await getCurrentLocation();
        setMapState({
          center: { lat: location.lat, lng: location.lon },
          zoom: 12,
        });
      } catch (err) {
        setError(err as string);
      }
    })();
  }, []);

  const handleMapStateChange = (state: {
    center: google.maps.LatLngLiteral;
    zoom: number;
  }) => {
    setMapState(state);
    console.log("Updated map state:", state);
  };

  return (
    <PlatformLayout>
      <Head>
        <title>Finder | Graminate</title>
      </Head>
      <div className="relative h-screen">
        {/* Map Content */}
        <div className="absolute inset-0">
          {error ? (
            <p className="text-red-500 text-center mt-4">{error}</p>
          ) : (
            <Maps
              apiKey={apiKey!}
              initialCenter={mapState.center}
              initialZoom={mapState.zoom}
              onStateChange={handleMapStateChange}
            />
          )}
        </div>

        {/* Finderbar (visible on larger screens) */}
        <div className="absolute top-12 left-0 h-[calc(100%-4rem)] w-64 z-30 hidden lg:block">
          <FinderBar activeView={activeView} />
        </div>

        {/* NavPanel (responsive) */}
        <div className="absolute top-2 left-2 w-72 sm:w-96 z-40">
          <NavPanel
            buttons={buttons}
            activeView={activeView}
            onNavigate={(view: string) => handleNavigation(view as View)}
          />
        </div>
      </div>
    </PlatformLayout>
  );
};

export default FinderPage;
