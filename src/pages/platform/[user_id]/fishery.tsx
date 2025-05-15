import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import QualityCard from "@/components/cards/fishery/QualityCard";
import ConditionCard from "@/components/cards/fishery/ConditionCard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import axios from "axios";
import axiosInstance from "@/lib/utils/axiosInstance";
import TaskManager from "@/components/cards/TaskManager";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type FisheryItem = {
  id: string | number;
  name: string;
};

type WeatherData = {
  temperature: number;
  humidity: number;
  lightHours: number | null;
  rainfall: number | null;
  surfacePressure: number | null; // Added surfacePressure
  timestamp: number;
};

const Fishery = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserIdString = Array.isArray(user_id) ? user_id[0] : user_id;
  const numericUserId = parsedUserIdString
    ? parseInt(parsedUserIdString, 10)
    : undefined;

  const [, setItemRecords] = useState<FisheryItem[]>([]);
  const [isLoadingFisheryData, setIsLoadingFisheryData] = useState(true);
  const [, setErrorMsg] = useState<string | null>(null);

  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [lightHours, setLightHours] = useState<number | null>(null);
  const [rainfall, setRainfall] = useState<number | null>(null);
  const [surfacePressure, setSurfacePressure] = useState<number | null>(null); // Added state for surface pressure
  const [sensorUrl, setSensorUrl] = useState<string | null>(null);

  const { temperatureScale } = useUserPreferences();

  const convertToFahrenheit = useCallback((celsius: number): number => {
    return Math.round(celsius * (9 / 5) + 32);
  }, []);

  const formatTemperature = useCallback(
    (celsiusValue: number | null, showUnit: boolean = true): string => {
      if (celsiusValue === null) return "N/A";
      let displayTemp = celsiusValue;
      let unit = "°C";
      if (temperatureScale === "Fahrenheit") {
        displayTemp = convertToFahrenheit(celsiusValue);
        unit = "°F";
      }
      const roundedTemp = Math.round(displayTemp);
      return showUnit ? `${roundedTemp}${unit}` : `${roundedTemp}°`;
    },
    [temperatureScale, convertToFahrenheit]
  );

  useEffect(() => {
    if (!router.isReady) {
      setIsLoadingFisheryData(true);
      return;
    }
    if (!numericUserId) {
      setIsLoadingFisheryData(false);
      setErrorMsg("User ID not available or invalid for fishery data.");
      setItemRecords([]);
      return;
    }

    const fetchFishery = async () => {
      setIsLoadingFisheryData(true);
      setErrorMsg(null);
      try {
        const response = await axiosInstance.get<{ items: FisheryItem[] }>(
          `/fishery/${numericUserId}`
        );
        setItemRecords(response.data.items || []);
      } catch {
        const message =
          "An unknown error occurred while fetching fishery data.";
        setErrorMsg(message);
        setItemRecords([]);
      } finally {
        setIsLoadingFisheryData(false);
      }
    };

    fetchFishery();
  }, [router.isReady, numericUserId]);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      const endpoint = sensorUrl || "/api/weather";
      try {
        const response = await axios.get(endpoint, {
          params: sensorUrl ? undefined : { lat, lon },
        });

        const newWeatherData: WeatherData = {
          temperature: Math.round(response.data.current.temperature2m),
          humidity: Math.round(response.data.current.relativeHumidity2m),
          lightHours:
            typeof response.data.daily.daylightDuration?.[0] === "number"
              ? response.data.daily.daylightDuration[0] / 3600
              : null,
          rainfall:
            typeof response.data.daily.precipitationSum?.[0] === "number"
              ? response.data.daily.precipitationSum[0]
              : null,
          surfacePressure:
            typeof response.data.current.surfacePressure === "number"
              ? response.data.current.surfacePressure
              : null, // Get surface pressure
          timestamp: Date.now(),
        };
        localStorage.setItem(
          "weatherDataFishery",
          JSON.stringify(newWeatherData)
        );
        setTemperature(newWeatherData.temperature);
        setHumidity(newWeatherData.humidity);
        setLightHours(newWeatherData.lightHours);
        setRainfall(newWeatherData.rainfall);
        setSurfacePressure(newWeatherData.surfacePressure); // Set surface pressure state
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to fetch weather for Fishery", error.message);
        } else {
          console.error(
            "An unknown error occurred while fetching weather for Fishery"
          );
        }
      }
    };

    const getLocationAndFetch = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeather(latitude, longitude);
          },
          (error) => {
            console.error("Geolocation error:", error.message);
          },
          { enableHighAccuracy: true }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    const cached = localStorage.getItem("weatherDataFishery");
    if (cached) {
      const parsed: WeatherData = JSON.parse(cached);
      const isValid = Date.now() - parsed.timestamp < 5 * 60 * 1000;
      if (isValid) {
        setTemperature(parsed.temperature);
        setHumidity(parsed.humidity);
        setLightHours(parsed.lightHours);
        setRainfall(parsed.rainfall);
        setSurfacePressure(parsed.surfacePressure); // Get surface pressure from cache
        return;
      }
    }
    getLocationAndFetch();
  }, [sensorUrl]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Fishery Management</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-lg font-semibold dark:text-white">
              Fishery Management
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <QualityCard />
          </div>
        </div>

        <div>
          {numericUserId && !isNaN(numericUserId) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <TaskManager userId={numericUserId} projectType="Fishery" />
              <ConditionCard
                temperature={temperature}
                humidity={humidity}
                lightHours={lightHours}
                rainfall={rainfall}
                surfacePressure={surfacePressure}
                formatTemperature={formatTemperature}
                onCustomUrlSubmit={(url) => setSensorUrl(url)}
              />
            </div>
          ) : (
            !isLoadingFisheryData && (
              <p className="dark:text-gray-400">
                User ID not available or invalid for tasks.
              </p>
            )
          )}
        </div>
      </div>
    </PlatformLayout>
  );
};

export default Fishery;
