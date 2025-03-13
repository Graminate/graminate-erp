import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import Chart from "chart.js/auto";
import type { ChartConfiguration, Chart as ChartJS } from "chart.js";
import UVScale from "./UVScale";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

import { Coordinates } from "@/types/card-props";

type UVHourly = { time: Date; uv: number };

const UVCard = ({ lat, lon }: Coordinates) => {
  const [lowestRiskLevel, setLowestRiskLevel] = useState<string>("");
  const [highestRiskLevel, setHighestRiskLevel] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"Small" | "Large">("Small");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [uvIndexToday, setUvIndexToday] = useState<number | null>(null);
  const [hourlyUVDataByDay, setHourlyUVDataByDay] = useState<
    { day: Date; uvHours: UVHourly[] }[]
  >([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHourlyData, setSelectedHourlyData] = useState<
    { day: Date; uvHours: UVHourly[] } | undefined
  >(undefined);
  const [hoveredTime, setHoveredTime] = useState<string>("");
  const [hoveredUV, setHoveredUV] = useState<number>(0);
  const [hoveredRisk, setHoveredRisk] = useState<string>("");

  const chartCanvas = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS | null>(null);

  function parseTimeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  function calculateSunriseSunset(daylightSeconds: number): {
    sunrise: string;
    sunset: string;
  } {
    const daylightHours = daylightSeconds / 3600;
    const halfDaylight = daylightHours / 2;
    const solarNoon = 12 * 60;
    const sunriseMinutes = solarNoon - halfDaylight * 60;
    const sunsetMinutes = solarNoon + halfDaylight * 60;
    const formatTime = (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours}:${mins.toString().padStart(2, "0")}`;
    };
    return {
      sunrise: formatTime(sunriseMinutes),
      sunset: formatTime(sunsetMinutes),
    };
  }

  async function fetchUVData(latitude: number, longitude: number) {
    try {
      const response = await fetch(
        `/api/weather?lat=${latitude}&lon=${longitude}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching UV data: ${response.statusText}`);
      }
      const data = await response.json();
      return { daily: data.daily, hourly: data.hourly };
    } catch (err: any) {
      console.error(err.message);
      throw new Error("Failed to fetch UV data");
    }
  }

  async function fetchCityName(latitude: number, longitude: number) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${KEY}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching location data: ${response.statusText}`);
      }
      const data = await response.json();
      const cityComponent = data.results[0]?.address_components.find(
        (component: any) => component.types.includes("locality")
      );
      return cityComponent?.long_name || "Your Location";
    } catch (err: any) {
      console.error(err.message);
      return "Unknown city";
    }
  }

  function getUVRiskLevel(uv: number): { label: string; color: string } {
    const roundedUV = Math.round(uv);
    if (roundedUV <= 2) return { label: "Low", color: "green" };
    if (roundedUV >= 3 && roundedUV <= 5)
      return { label: "Moderate", color: "yellow" };
    if (roundedUV >= 6 && roundedUV <= 7)
      return { label: "High", color: "orange" };
    if (roundedUV >= 8 && roundedUV <= 10)
      return { label: "Very High", color: "red" };
    return { label: "Extreme", color: "purple" };
  }

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: new Date(d),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      day: d.toLocaleDateString(undefined, { day: "numeric" }),
    };
  });

  useEffect(() => {
    if (lat !== undefined && lon !== undefined) {
      Promise.all([fetchUVData(lat, lon), fetchCityName(lat, lon)])
        .then(([fetchedData, _city]) => {
          fetchedData.daily.time = fetchedData.daily.time.map(
            (d: string) => new Date(d)
          );
          fetchedData.hourly.time = fetchedData.hourly.time.map(
            (d: string) => new Date(d)
          );
          setWeatherData(fetchedData);
        })
        .catch((err: any) => {
          setError(err.message);
        });
    } else {
      setError("Latitude and Longitude are required to fetch UV data.");
    }
  }, [lat, lon]);

  useEffect(() => {
    if (weatherData && displayMode === "Small") {
      const today = new Date().toISOString().split("T")[0];
      let startIndex = weatherData.daily.time.findIndex(
        (d: Date) => d.toISOString().split("T")[0] >= today
      );
      if (startIndex === -1 || startIndex === undefined) startIndex = 0;
      const maxUV = weatherData.daily.uvIndexMax?.[startIndex] ?? 0;
      const minUV = weatherData.daily.uvIndexMin?.[startIndex] ?? maxUV;
      const daylightSeconds =
        weatherData.daily.daylightDuration?.[startIndex] ?? 0;
      const { sunrise, sunset } = calculateSunriseSunset(daylightSeconds);
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const sunriseMins = parseTimeToMinutes(sunrise);
      const sunsetMins = parseTimeToMinutes(sunset);
      let currentUV = 0;
      if (nowMinutes >= sunriseMins && nowMinutes <= sunsetMins) {
        const fraction =
          (nowMinutes - sunriseMins) / (sunsetMins - sunriseMins);
        currentUV = maxUV * Math.sin(Math.PI * fraction);
      }
      setUvIndexToday(currentUV);
      setError(null);
      setLowestRiskLevel(getUVRiskLevel(minUV).label);
      setHighestRiskLevel(getUVRiskLevel(maxUV).label);
    }
  }, [weatherData, displayMode]);

  useEffect(() => {
    if (weatherData) {
      const uvData = weatherData.daily.time.map((day: Date, i: number) => {
        const daylightSeconds = weatherData.daily.daylightDuration[i];
        const { sunrise, sunset } = calculateSunriseSunset(daylightSeconds);
        const sunriseMins = parseTimeToMinutes(sunrise);
        const sunsetMins = parseTimeToMinutes(sunset);
        const uvHours: UVHourly[] = weatherData.hourly.time
          .map((hour: Date, idx: number) => {
            if (hour.toDateString() === day.toDateString()) {
              const hMins = hour.getHours() * 60 + hour.getMinutes();
              if (hMins >= sunriseMins && hMins <= sunsetMins) {
                return {
                  time: hour,
                  uv: weatherData.hourly.uvIndexHourly[idx],
                };
              }
            }
            return null;
          })
          .filter((x: UVHourly | null): x is UVHourly => x !== null);
        return { day, uvHours };
      });
      setHourlyUVDataByDay(uvData);
    }
  }, [weatherData]);

  useEffect(() => {
    if (weatherData && displayMode === "Large" && !selectedDate) {
      setSelectedDate(weatherData.daily.time[0] ?? new Date());
    }
  }, [weatherData, displayMode, selectedDate]);

  useEffect(() => {
    if (selectedDate && hourlyUVDataByDay.length > 0) {
      const sel = hourlyUVDataByDay.find(
        (dayData) => dayData.day.toDateString() === selectedDate.toDateString()
      );
      setSelectedHourlyData(sel || { day: new Date(), uvHours: [] });
    }
  }, [selectedDate, hourlyUVDataByDay]);

  useEffect(() => {
    if (selectedHourlyData && selectedHourlyData.uvHours.length > 0) {
      const uvValues = selectedHourlyData.uvHours.map((pt) => pt.uv);
      const minUV = Math.min(...uvValues);
      const maxUV = Math.max(...uvValues);
      setLowestRiskLevel(getUVRiskLevel(minUV).label);
      setHighestRiskLevel(getUVRiskLevel(maxUV).label);
    }
  }, [selectedHourlyData]);

  useEffect(() => {
    if (displayMode === "Large" && selectedHourlyData && chartCanvas.current) {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      const labels = selectedHourlyData.uvHours.map((pt) =>
        pt.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      const dataValues = selectedHourlyData.uvHours.map((pt) => pt.uv);
      const verticalLinePlugin = {
        id: "verticalLinePlugin",
        afterDatasetsDraw: (chart: ChartJS) => {
          const activeElements = chart.tooltip?.getActiveElements();
          if (activeElements && activeElements.length > 0) {
            const activePoint = activeElements[0];
            if (activePoint) {
              const ctx = chart.ctx;
              const x = activePoint.element.x;
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(x, chart.chartArea.top);
              ctx.lineTo(x, chart.chartArea.bottom);
              ctx.lineWidth = 1;
              ctx.strokeStyle = "red";
              ctx.setLineDash([2, 2]);
              ctx.stroke();
              ctx.restore();
            }
          }
        },
      };

      const chartConfig: ChartConfiguration<"line"> = {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              data: dataValues,
              borderColor: "#04AD79",
              borderWidth: 2,
              fill: false,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              enabled: true,
              mode: "index",
              intersect: false,
              callbacks: {
                label: function (context) {
                  const uv = context.parsed.y;
                  setHoveredUV(uv);
                  setHoveredTime(context.label);
                  setHoveredRisk(getUVRiskLevel(uv).label);
                  return "";
                },
              },
            },
            legend: {
              display: false,
            },
          },
          hover: {
            mode: "index",
            intersect: false,
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { display: false },
              border: { color: "gray" },
            },
            y: {
              beginAtZero: true,
              min: 0,
              max: 11,
              grid: { display: false, drawTicks: false },
              ticks: {
                stepSize: 1,
                callback: function (tickValue: string | number) {
                  if (typeof tickValue === "number") {
                    return tickValue === 0 ? "" : tickValue;
                  }
                  return ""; // Ensures no type mismatch
                },
              },
              border: { color: "gray" },
            },
          },
          elements: {
            line: { borderWidth: 0 },
          },
        },
        plugins: [verticalLinePlugin],
      };
      chartRef.current = new Chart(chartCanvas.current, chartConfig);
    }
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [displayMode, selectedHourlyData]);

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
      ) : uvIndexToday !== null ? (
        displayMode === "Small" ? (
          <div className="flex flex-col items-left w-full p-1 text-center rounded-md">
            <div className="w-full flex flex-row items-center gap-2">
              <FontAwesomeIcon
                icon={faSun}
                className="w-4 h-4 text-yellow-200"
              />
              <p className="text-sm uppercase tracking-wide text-gray-200 dark:text-light">
                UV Index
              </p>
            </div>
            <p className="text-2xl py-2 text-left text-dark dark:text-gray-300">
              {Math.round(uvIndexToday)}
            </p>
            <p className="text-sm dark:text-light text-dark text-left">
              {getUVRiskLevel(Math.round(uvIndexToday)).label}
            </p>
            <UVScale uvIndex={uvIndexToday} />
            {lowestRiskLevel === highestRiskLevel ? (
              <p className="text-xs text-dark dark:text-light mt-1">
                UV index {lowestRiskLevel} today
              </p>
            ) : (
              <p className="text-xs text-dark dark:text-light mt-1">
                UV index {lowestRiskLevel} to {highestRiskLevel} today
              </p>
            )}
          </div>
        ) : displayMode === "Large" ? (
          <div className="w-full">
            {/* Top Label */}
            <div className="flex flex-row justify-center items-center gap-2">
              <FontAwesomeIcon
                icon={faSun}
                className="w-5 h-5 text-yellow-200"
              />
              <p className="text-sm uppercase tracking-wide text-gray-200 dark:text-light">
                UV Index
              </p>
            </div>
            {/* Calendar */}
            <div className="text-center text-gray-200 dark:text-light my-2 pt-2 flex justify-center">
              {weekDates.map((dateItem, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-sm font-bold">{dateItem.weekday}</span>
                  <button
                    type="button"
                    className={`mx-3 flex flex-col items-center cursor-pointer px-2 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                      selectedDate &&
                      dateItem.date.toDateString() ===
                        selectedDate.toDateString()
                        ? "bg-green-200 text-white"
                        : ""
                    }`}
                    onClick={() => setSelectedDate(dateItem.date)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedDate(dateItem.date);
                      }
                    }}
                    tabIndex={0}
                    aria-label={`Select UV data for ${dateItem.weekday}, ${dateItem.day}`}
                  >
                    <span className="text-xs">{dateItem.day}</span>
                  </button>
                </div>
              ))}
            </div>
            {selectedHourlyData && selectedHourlyData.uvHours.length > 0 && (
              <div className="flex flex-row mx-auto justify-center gap-2">
                <p className="text-center text-gray-200 dark:text-light text-lg">
                  {Math.round(hoveredUV)}
                </p>
                <p className="text-center text-gray-200 dark:text-light text-lg">
                  {hoveredRisk}
                </p>
              </div>
            )}
            <div className="w-full max-w-[300px] h-[150px] mx-auto">
              <canvas ref={chartCanvas} className="w-full h-full"></canvas>
            </div>
            {selectedHourlyData && selectedHourlyData.uvHours.length > 0 && (
              <p className="text-xs font-semibold text-gray-200 dark:text-light mt-4">
                {selectedDate?.toDateString() === new Date().toDateString()
                  ? "Today"
                  : selectedDate?.toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                    })}
                ,{" "}
                {hoveredTime
                  ? hoveredTime
                  : selectedHourlyData.uvHours[0].time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
              </p>
            )}
            <div>
              {lowestRiskLevel === highestRiskLevel ? (
                <p className="text-sm text-dark dark:text-light">
                  UV index {lowestRiskLevel} on this day
                </p>
              ) : (
                <p className="text-sm text-dark dark:text-light">
                  UV index {lowestRiskLevel} to {highestRiskLevel} on this day
                </p>
              )}
            </div>
            <div className="border-t border-gray-300 my-2 pt-2">
              <p className="text-md font-semibold text-dark dark:text-light">
                About the UV Index
              </p>
              <p className="text-sm text-dark dark:text-light">
                The World Health Organization's UV index (UVI) measures
                ultraviolet radiation. The higher the UVi, the greater the
                potential for damage and the faster harm can occur. The UVI can
                help you decide when to protect yourself from the sun and when
                to avoid being outside.
              </p>
            </div>
          </div>
        ) : null
      ) : null}
    </div>
  );
};

export default UVCard;
