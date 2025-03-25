import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";

import { Coordinates } from "@/types/card-props";
import { fetchCityName } from "@/lib/utils/loadWeather";
import axios from "axios";

const SunCard = ({ lat, lon }: Coordinates) => {
  const [sunriseTime, setSunriseTime] = useState<string | null>(null);
  const [sunsetTime, setSunsetTime] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"Small" | "Large">("Small");
  const [sunTimesArray, setSunTimesArray] = useState<
    { date: string; sunrise: string; sunset: string }[]
  >([]);
  const [dailySunData, setDailySunData] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [xSun, setXSun] = useState<number>(0);
  const [ySun, setYSun] = useState<number>(0);
  const [displayedSunsetTime, setDisplayedSunsetTime] = useState<string | null>(
    null
  );
  const [sunsetLabel, setSunsetLabel] = useState<string>("");

  function parseTimeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  function formatTimeFromMinutes(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hrs}:${mins.toString().padStart(2, "0")}`;
  }

  function formatDuration(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  }

  async function fetchSunData(latitude: number, longitude: number) {
    try {
      const response = await axios.get("/api/weather", {
        params: {
          lat: latitude,
          lon: longitude,
        },
      });

      return response.data.daily;
    } catch (err: any) {
      console.error(
        err.response?.data?.message || err.message || "Unknown error occurred"
      );
      throw new Error("Failed to fetch sun data");
    }
  }

  function calculateSunriseSunset(daylightSeconds: number) {
    const daylightHours = daylightSeconds / 3600;
    const halfDaylight = daylightHours / 2;
    const solarNoon = 12 * 60;
    const sunriseMinutes = solarNoon - halfDaylight * 60;
    const sunsetMinutes = solarNoon + halfDaylight * 60;

    function formatTime(minutes: number) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours}:${mins.toString().padStart(2, "0")}`;
    }

    return {
      sunrise: formatTime(sunriseMinutes),
      sunset: formatTime(sunsetMinutes),
    };
  }

  useEffect(() => {
    if (lat !== undefined && lon !== undefined) {
      Promise.all([fetchSunData(lat, lon), fetchCityName(lat, lon)])
        .then(([dailyData, city]) => {
          setDailySunData(dailyData);
          setLocationName(city);
        })
        .catch((err: any) => {
          setError(err.message);
        });
    } else {
      setError("Latitude and Longitude are required.");
    }
  }, [lat, lon]);

  useEffect(() => {
    if (dailySunData && displayMode === "Small") {
      const today = new Date().toISOString().split("T")[0];
      let startIndex = dailySunData.time.findIndex(
        (date: string) => date >= today
      );
      if (startIndex === -1) {
        startIndex = 0;
      }
      const { sunrise, sunset } = calculateSunriseSunset(
        dailySunData.daylightDuration[startIndex]
      );
      setSunriseTime(sunrise);
      setSunsetTime(sunset);
      setError(null);
    }
  }, [dailySunData, displayMode]);

  useEffect(() => {
    if (sunriseTime && sunsetTime) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const sunriseMins = parseTimeToMinutes(sunriseTime);
      const sunsetMins = parseTimeToMinutes(sunsetTime);
      if (displayMode === "Small") {
        let t = (currentMinutes - sunriseMins) / (sunsetMins - sunriseMins);
        t = Math.max(0, Math.min(1, t));
        setXSun(160 * t);
        setYSun(50 * Math.pow(1 - t, 2) + 50 * Math.pow(t, 2));
      } else {
        let fraction =
          (currentMinutes - sunriseMins) / (sunsetMins - sunriseMins);
        if (isNaN(fraction)) fraction = 0;
        fraction = Math.max(0, Math.min(1, fraction));
        setXSun(100 * fraction);
        setYSun(25 * (Math.pow(1 - fraction, 2) + Math.pow(fraction, 2)));
      }
    }
  }, [sunriseTime, sunsetTime, displayMode]);

  useEffect(() => {
    if (dailySunData && displayMode === "Large") {
      const arr: { date: string; sunrise: string; sunset: string }[] = [];
      const today = new Date().toISOString().split("T")[0];
      let startIndex = dailySunData.time.findIndex(
        (date: string) => date >= today
      );
      if (startIndex === -1) {
        startIndex = 0;
      }
      for (let i = startIndex; i < startIndex + 7; i++) {
        if (
          dailySunData.daylightDuration[i] !== undefined &&
          dailySunData.time[i] !== undefined
        ) {
          const { sunrise, sunset } = calculateSunriseSunset(
            dailySunData.daylightDuration[i]
          );
          arr.push({
            date: dailySunData.time[i],
            sunrise,
            sunset,
          });
        }
      }
      setSunTimesArray(arr);
      setError(null);
    }
  }, [dailySunData, displayMode]);

  useEffect(() => {
    if (displayMode === "Large" && sunTimesArray.length > 1) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const todaysSunriseMinutes = parseTimeToMinutes(sunTimesArray[0].sunrise);
      const todaysSunsetMinutes = parseTimeToMinutes(sunTimesArray[0].sunset);
      if (
        currentMinutes >= todaysSunriseMinutes &&
        currentMinutes < todaysSunsetMinutes
      ) {
        setDisplayedSunsetTime(sunTimesArray[0].sunset);
        setSunsetLabel("Sunset Today");
      } else {
        setDisplayedSunsetTime(sunTimesArray[1].sunset);
        setSunsetLabel("Sunset Tomorrow");
      }
    }
  }, [displayMode, sunTimesArray]);

  return (
    <div className="p-4 rounded-lg shadow-md max-w-sm mx-auto flex flex-col items-center relative dark:bg-gray-700 bg-gray-500">
      <div className="absolute top-2 right-2 z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 cursor-pointer text-dark dark:text-light"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setDropdownOpen(!dropdownOpen);
              e.preventDefault();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Toggle dropdown"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 12a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM12.75 12a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM18.75 12a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"
          />
        </svg>
        {dropdownOpen && (
          <div className="absolute top-8 right-0 bg-white dark:bg-gray-600 dark:text-light text-black rounded-lg shadow-lg z-20 w-32">
            <button
              className="w-full text-left text-sm px-4 py-2 hover:bg-gray-500 dark:hover:bg-blue-100 cursor-pointer"
              type="button"
              onClick={() => {
                setDisplayMode("Small");
                setDropdownOpen(false);
              }}
            >
              Small
            </button>
            <button
              className="w-full text-left text-sm px-4 py-2 hover:bg-gray-500 dark:hover:bg-blue-100 cursor-pointer"
              type="button"
              onClick={() => {
                setDisplayMode("Large");
                setDropdownOpen(false);
              }}
            >
              Large
            </button>
          </div>
        )}
      </div>
      {error ? (
        <p className="text-red-500 text-center">Error: {error}</p>
      ) : sunriseTime !== null && sunsetTime !== null ? (
        displayMode === "Small" ? (
          <div className="flex flex-col items-center w-full text-center rounded-md">
            <div className="w-full flex flex-row items-center justify-center mb-2 gap-2">
              <FontAwesomeIcon
                icon={faSun}
                className="w-4 h-4 text-yellow-200"
              />
              <p className="text-sm uppercase tracking-wide text-gray-200 dark:text-light">
                Sun Time
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="text-md tracking-wide text-gray-200 dark:text-light">
                Sunset: <span className="font-semibold">{sunsetTime}</span>
              </div>
              <div className="text-md tracking-wide text-gray-200 dark:text-light">
                Sunrise: <span className="font-semibold">{sunriseTime}</span>
              </div>
            </div>
            <div className="relative">
              <svg
                viewBox="0 0 160 60"
                className="w-full h-full overflow-visible"
              >
                <path
                  d="M0,50 Q80,0 160,50 L160,45 L0,45 Z"
                  className="fill-gray-500 dark:fill-gray-600"
                />
                <path
                  d="M0,50 Q80,0 160,50"
                  className="stroke-dark dark:stroke-gray-300"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="2,2"
                />
                <line
                  x1="0"
                  y1="45"
                  x2="160"
                  y2="45"
                  className="stroke-dark dark:stroke-gray-300"
                  strokeWidth="1"
                />
                <g>
                  <circle
                    cx={xSun}
                    cy={ySun}
                    r="5"
                    className={
                      ySun > 45
                        ? "fill-gray-200 dark:fill-dark"
                        : "fill-yellow-200"
                    }
                  />
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i * 45 * Math.PI) / 180;
                    return (
                      <line
                        key={i}
                        x1={xSun + Math.cos(angle) * 7}
                        y1={ySun + Math.sin(angle) * 7}
                        x2={xSun + Math.cos(angle) * 10}
                        y2={ySun + Math.sin(angle) * 10}
                        className={
                          ySun > 45
                            ? "fill-gray-200 dark:fill-dark"
                            : "fill-yellow-200 stroke-yellow-200 dark:stroke-gray-400"
                        }
                        strokeWidth="1"
                      />
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>
        ) : displayMode === "Large" ? (
          sunTimesArray.length > 1 && displayedSunsetTime ? (
            <div className="flex flex-col">
              <div className="text-sm text-center text-dark dark:text-light">
                {sunsetLabel}
              </div>
              <div className="text-center text-3xl font-semibold text-gray-200 dark:text-light">
                {displayedSunsetTime}
              </div>
            </div>
          ) : null
        ) : null
      ) : null}
      {!error &&
        displayMode === "Large" &&
        sunriseTime !== null &&
        sunsetTime !== null &&
        sunTimesArray.length > 0 &&
        sunTimesArray[0] !== undefined && (
          <div className="mt-1 w-full max-w-2xl">
            <div className="flex flex-row justify-between border-b border-gray-300 py-2">
              <div className="text-sm text-dark dark:text-light">
                First Light
              </div>
              <div className="text-right text-dark dark:text-light">
                {formatTimeFromMinutes(
                  Math.max(parseTimeToMinutes(sunTimesArray[0].sunrise) - 30, 0)
                )}
              </div>
            </div>
            <div className="flex flex-row justify-between border-b border-gray-300 py-2">
              <div className="text-sm text-dark dark:text-light">
                Sunrise Today
              </div>
              <div className="text-right text-dark dark:text-light">
                {sunTimesArray[0].sunrise}
              </div>
            </div>
            <div className="flex flex-row justify-between border-b border-gray-300 py-2">
              <div className="text-sm text-dark dark:text-light">
                Sunset Today
              </div>
              <div className="text-right text-dark dark:text-light">
                {sunTimesArray[0].sunset}
              </div>
            </div>
            <div className="flex flex-row justify-between border-b border-gray-300 py-2">
              <div className="text-sm text-dark dark:text-light">
                Last Light
              </div>
              <div className="text-right text-dark dark:text-light">
                {formatTimeFromMinutes(
                  Math.min(
                    parseTimeToMinutes(sunTimesArray[0].sunset) + 30,
                    1440
                  )
                )}
              </div>
            </div>
            <div className="flex flex-row justify-between border-b border-gray-300 py-2">
              <div className="text-sm text-dark dark:text-light">
                Total Daylight Duration
              </div>
              <div className="text-right text-dark dark:text-light">
                {formatDuration(
                  parseTimeToMinutes(sunTimesArray[0].sunset) -
                    parseTimeToMinutes(sunTimesArray[0].sunrise)
                )}
              </div>
            </div>
            <p className="my-4 text-sm text-dark dark:text-light">
              Sunrise &amp; Sunset for the upcoming days
            </p>
            <div className="overflow-y-auto" style={{ maxHeight: "150px" }}>
              <div className="text-center px-2 flex flex-col items-center w-full">
                {sunTimesArray.map((sunData, idx) => (
                  <div
                    key={idx}
                    className="mx-2 border-b border-gray-300 p-2 my-1 flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-2xl"
                  >
                    {/* Week day */}
                    <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                      <p className="text-sm font-semibold text-dark dark:text-light w-12 text-center">
                        {new Date(sunData.date).toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </p>
                    </div>
                    {/* Sunrise Time */}
                    <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                      <p className="text-sm text-dark dark:text-light text-center w-16">
                        {sunData.sunrise}
                      </p>
                    </div>
                    {/* Bars */}
                    <div className="relative h-1 bg-gray-300 dark:bg-gray-100 w-full sm:w-32 rounded-full">
                      <div
                        className="h-full bg-blue-200 absolute rounded-full"
                        style={{
                          left: `${
                            (parseTimeToMinutes(sunData.sunrise) / 1440) * 100
                          }%`,
                          width: `${
                            ((parseTimeToMinutes(sunData.sunset) -
                              parseTimeToMinutes(sunData.sunrise)) /
                              1440) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    {/* Sunset Time */}
                    <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                      <p className="text-sm text-dark dark:text-light text-center w-16">
                        {sunData.sunset}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default SunCard;
