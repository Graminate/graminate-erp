import React, { useState, useEffect } from "react";
import Head from "next/head";
import PlatformLayout from "@/layout/PlatformLayout";
import Loader from "@/components/ui/Loader";
import SunCard from "@/components/cards/weather/SunCard";
import UVCard from "@/components/cards/weather/UVCard";
import TemperatureCard from "@/components/cards/weather/TemperatureCard";
import PrecipitationCard from "@/components/cards/weather/PrecipitationCard";
import { useTemperatureScale } from "@/lib/context/TemperatureScaleContext";
import { getCurrentLocation } from "@/lib/utils/loadLocation";

const Weather = () => {
  const { temperatureScale } = useTemperatureScale();
  const fahrenheit = temperatureScale === "Fahrenheit";

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocation(null);
    setError(null);

    getCurrentLocation()
      .then((coords) => setLocation(coords))
      .catch((err) => {
        console.error("Geolocation Error:", err);
        setError(
          err instanceof GeolocationPositionError
            ? `Error getting location: ${err.message}. Please ensure location services are enabled and permission is granted.`
            : "Could not retrieve location. Please try again or enable location services."
        );
      });
  }, []);

  return (
    <>
      <Head>
        <title>Graminate | Weather</title>
        <meta
          name="description"
          content="Check the current weather conditions based on your location."
        />
      </Head>
      <PlatformLayout>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Current Weather
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Displaying weather information based on your current location.
            </p>
          </header>

          <hr className="border-gray-200 dark:border-gray-700 mb-8" />

          <div className="min-h-[400px]">
            {error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-600 dark:text-red-400 text-center px-4 py-10 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm">
                  {error}
                </p>
              </div>
            ) : !location ? (
              <div className="flex items-center justify-center h-full pt-16">
                <Loader />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                <div className="w-full">
                  <TemperatureCard
                    lat={location.lat}
                    lon={location.lon}
                    fahrenheit={fahrenheit}
                  />
                </div>
                <div className="w-full">
                  <UVCard
                    lat={location.lat}
                    lon={location.lon}
                    fahrenheit={false}
                  />
                </div>
                <div className="w-full">
                  <SunCard
                    lat={location.lat}
                    lon={location.lon}
                    fahrenheit={false}
                  />
                </div>
                <div className="w-full">
                  <PrecipitationCard
                    lat={location.lat}
                    lon={location.lon}
                    fahrenheit={false}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </PlatformLayout>
    </>
  );
};

export default Weather;
