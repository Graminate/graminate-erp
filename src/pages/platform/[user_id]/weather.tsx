"use client";

import React, { useState, useEffect } from "react";
import SunCard from "@/components/cards/weather/SunCard";
import UVCard from "@/components/cards/weather/UVCard";
import TemperatureCard from "@/components/cards/weather/TemperatureCard";
import PrecipitationCard from "@/components/cards/weather/PrecipitationCard";
import Loader from "@/components/ui/Loader";
import { useTemperatureScale } from "@/lib/context/TemperatureScaleContext";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";

const WeatherPage = () => {
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

  async function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
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
  }

  return (
    <>
      <Head>
        <title>Graminate | Weather</title>
      </Head>
      <PlatformLayout>
        <main className="min-h-screen text-white px-4 sm:px-6 md:px-8 py-4">
          <header className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-dark dark:text-light">
              Weather
            </h1>
            <hr className="mt-4 border-gray-600" />
          </header>

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
                <UVCard lat={location.lat} lon={location.lon} />
              </div>
              <div className="w-full">
                <SunCard lat={location.lat} lon={location.lon} />
              </div>
              <div className="w-full">
                <PrecipitationCard lat={location.lat} lon={location.lon} />
              </div>
            </div>
          )}
        </main>
      </PlatformLayout>
    </>
  );
};

export default WeatherPage;
