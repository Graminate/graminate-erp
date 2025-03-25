import React, { useState, useEffect } from "react";
import SunCard from "@/components/cards/weather/SunCard";
import UVCard from "@/components/cards/weather/UVCard";
import TemperatureCard from "@/components/cards/weather/TemperatureCard";
import PrecipitationCard from "@/components/cards/weather/PrecipitationCard";
import PlatformLayout from "@/layout/PlatformLayout";
import Loader from "@/components/ui/Loader";
import { useTemperatureScale } from "@/lib/context/TemperatureScaleContext";
import { getCurrentLocation } from "@/lib/utils/loadLocation";
import Head from "next/head";

const Weather = () => {
  const { temperatureScale } = useTemperatureScale();
  const fahrenheit = temperatureScale === "Fahrenheit";

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation()
      .then((coords) => setLocation(coords))
      .catch((err) => setError(err));
  }, []);

  return (
    <>
      <Head>
        <title>Graminate | Weather</title>
      </Head>
      <PlatformLayout>
        <main className="min-h-screen text-white px-4 sm:px-6 md:px-8 py-4">
          <header className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-dark dark:text-light">
              Weather
            </h1>
          </header>
          <hr className="mt-4 border-gray-300" />

          {error ? (
            <p className="flex items-center justify-center text-red-500 mt-6">
              {error}
            </p>
          ) : !location ? (
            <div className="flex items-center justify-center min-h-screen">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
        </main>
      </PlatformLayout>
    </>
  );
};

export default Weather;
