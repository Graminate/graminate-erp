import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet } from "@fortawesome/free-solid-svg-icons";
import Chart from "chart.js/auto";
import type { ChartConfiguration, Chart as ChartJS } from "chart.js";

import { Coordinates } from "@/types/card-props";

const PrecipitationCard = ({ lat, lon }: Coordinates) => {
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"Small" | "Large">("Small");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [past6HoursRain, setPast6HoursRain] = useState<number>(0);
  const [next24HoursRain, setNext24HoursRain] = useState<number>(0);

  const [availableDays, setAvailableDays] = useState<
    { date: Date; weekday: string; day: string }[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHourlyData, setSelectedHourlyData] = useState<
    | { day: Date; precipHours: { time: Date; precipitation: number }[] }
    | undefined
  >(undefined);
  const [hourlyPrecipDataByDay, setHourlyPrecipDataByDay] = useState<
    { day: Date; precipHours: { time: Date; precipitation: number }[] }[]
  >([]);

  const chartCanvas = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const [hoveredTime, setHoveredTime] = useState<string>("");
  const [hoveredPrecip, setHoveredPrecip] = useState<number>(0);
  const graphWidth = 300;
  const graphHeight = 150;

  async function fetchPrecipitationData(latitude: number, longitude: number) {
    try {
      const response = await fetch(
        `/api/weather?lat=${latitude}&lon=${longitude}`
      );
      if (!response.ok) {
        throw new Error(
          `Error fetching precipitation data: ${response.statusText}`
        );
      }
      const data = await response.json();
      return data.hourly;
    } catch (err: any) {
      console.error(err.message);
      throw new Error("Failed to fetch precipitation data");
    }
  }

  useEffect(() => {
    if (lat !== undefined && lon !== undefined) {
      fetchPrecipitationData(lat, lon)
        .then((data) => {
          // Convert time strings into Date objects
          data.time = data.time.map((t: string) => new Date(t));
          setWeatherData(data);
        })
        .catch((err: any) => {
          setError(err.message);
        });
    } else {
      setError(
        "Latitude and Longitude are required to fetch precipitation data."
      );
    }
  }, [lat, lon]);

  // Compute rain sums in Small mode
  useEffect(() => {
    if (weatherData && displayMode === "Small") {
      const now = new Date();
      const hoursData = weatherData.time.map((t: Date, index: number) => ({
        time: t,
        precipitation: weatherData.precipitation[index] || 0,
      }));
      const past6 = hoursData
        .filter(
          (entry: { time: Date; precipitation: number }) =>
            entry.time > new Date(now.getTime() - 6 * 60 * 60 * 1000)
        )
        .reduce(
          (sum: number, entry: { time: Date; precipitation: number }) =>
            sum + entry.precipitation,
          0
        );
      const next24 = hoursData
        .filter(
          (entry: { time: Date; precipitation: number }) =>
            entry.time > now &&
            entry.time < new Date(now.getTime() + 24 * 60 * 60 * 1000)
        )
        .reduce(
          (sum: number, entry: { time: Date; precipitation: number }) =>
            sum + entry.precipitation,
          0
        );
      setPast6HoursRain(past6);
      setNext24HoursRain(next24);
    }
  }, [weatherData, displayMode]);

  // Group hourly data by day and determine available days
  useEffect(() => {
    if (weatherData) {
      const groups: {
        [key: string]: {
          day: Date;
          precipHours: { time: Date; precipitation: number }[];
        };
      } = {};
      weatherData.time.forEach((time: Date, index: number) => {
        const key = time.toDateString();
        if (!groups[key]) {
          groups[key] = { day: time, precipHours: [] };
        }
        groups[key].precipHours.push({
          time,
          precipitation: weatherData.precipitation[index] || 0,
        });
      });
      const hourlyDataByDay = Object.values(groups).sort(
        (a, b) => a.day.getTime() - b.day.getTime()
      );
      setHourlyPrecipDataByDay(hourlyDataByDay);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const available = hourlyDataByDay
        .filter((group) => {
          const groupDate = new Date(group.day);
          groupDate.setHours(0, 0, 0, 0);
          return groupDate >= today;
        })
        .slice(0, 7)
        .map((group) => ({
          date: group.day,
          weekday: group.day.toLocaleDateString(undefined, {
            weekday: "short",
          }),
          day: group.day.toLocaleDateString(undefined, { day: "numeric" }),
        }));
      setAvailableDays(available);
      if (!selectedDate && available.length > 0) {
        const todayStr = new Date().toDateString();
        const found = hourlyDataByDay.find(
          (g) => g.day.toDateString() === todayStr
        );
        setSelectedDate(found ? found.day : available[0].date);
      }
    }
  }, [weatherData]);

  useEffect(() => {
    if (selectedDate && hourlyPrecipDataByDay.length > 0) {
      const sel = hourlyPrecipDataByDay.find(
        (group) => group.day.toDateString() === selectedDate.toDateString()
      );
      setSelectedHourlyData(sel);
    }
  }, [selectedDate, hourlyPrecipDataByDay]);

  function getDynamicTicks(max: number): number[] {
    if (max <= 2.5) return [0, 1, 2.5];
    else if (max <= 10) return [0, 2.5, 5];
    else if (max <= 20) return [0, 10, 20];
    else if (max <= 30) return [0, 15, 30];
    else if (max <= 40) return [0, 20, 40];
    else if (max <= 50) return [0, 25, 50];
    else if (max <= 60) return [0, 20, 40, 60];
    else if (max <= 70) return [0, 35, 70];
    else if (max <= 80) return [0, 40, 80];
    else if (max <= 90) return [0, 30, 60, 90];
    else return [0, 25, 50, 70, 100];
  }

  // Create or update chart in Large mode
  useEffect(() => {
    if (displayMode === "Large" && selectedHourlyData && chartCanvas.current) {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      const labels = selectedHourlyData.precipHours.map((pt) =>
        pt.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      const dataValues = selectedHourlyData.precipHours.map(
        (pt) => pt.precipitation
      );
      const maxPrecip = Math.max(...dataValues);
      const dynamicTicks = getDynamicTicks(maxPrecip);
      const chartConfig: ChartConfiguration<"bar"> = {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              data: dataValues,
              backgroundColor: "#1E90FF",
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
                label: function (context: any) {
                  setHoveredPrecip(context.parsed.y);
                  setHoveredTime(context.label);
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
              axis: "x",
              border: { color: "gray" },
            },
            y: {
              beginAtZero: true,
              max: dynamicTicks[dynamicTicks.length - 1],
              ticks: {
                callback: function (value: string | number) {
                  return value + "mm";
                },
              },
              afterBuildTicks: function (scale: any) {
                scale.ticks = dynamicTicks.map((value: number) => ({ value }));
              },
              grid: { display: false, drawTicks: false },
              axis: "y",
              border: { color: "gray" },
            },
          },
        },
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
        <button
          type="button"
          className="w-6 h-6 cursor-pointer text-dark dark:text-light focus:outline-none"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-label="Toggle dropdown"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 12a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM12.75 12a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM18.75 12a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"
            />
          </svg>
        </button>
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
      ) : weatherData && displayMode === "Small" ? (
        <div className="flex flex-col p-2">
          <div className="w-full flex flex-row items-center gap-2">
            <FontAwesomeIcon
              icon={faDroplet}
              className="w-4 h-4 text-blue-200"
            />
            <p className="text-sm uppercase tracking-wide text-gray-200 dark:text-light">
              Precipitation
            </p>
          </div>
          <p className="text-xl font-medium py-2 text-left text-dark dark:text-gray-300">
            {past6HoursRain.toFixed(1)} mm rain in last 6 hours
          </p>
          <p className="text-sm py-2 text-left text-dark dark:text-gray-300">
            {next24HoursRain.toFixed(1)} mm expected in next 24 hours
          </p>
        </div>
      ) : weatherData && displayMode === "Large" ? (
        <div className="w-full">
          {/* Top Label */}
          <div className="flex flex-row justify-center items-center gap-2">
            <FontAwesomeIcon
              icon={faDroplet}
              className="w-5 h-5 text-blue-200"
            />
            <p className="text-sm uppercase tracking-wide text-gray-200 dark:text-light">
              Precipitation
            </p>
          </div>
          <div className="text-center text-gray-200 dark:text-light my-2 py-2 flex justify-center">
            {availableDays.map((dayItem, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-sm font-bold">{dayItem.weekday}</span>
                <button
                  type="button"
                  className={`mx-3 flex flex-col items-center cursor-pointer px-2 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    selectedDate &&
                    dayItem.date.toDateString() === selectedDate.toDateString()
                      ? "bg-green-200 text-white"
                      : ""
                  }`}
                  onClick={() => setSelectedDate(dayItem.date)}
                >
                  <span className="text-xs">{dayItem.day}</span>
                </button>
              </div>
            ))}
          </div>
          {selectedHourlyData && selectedHourlyData.precipHours.length > 0 && (
            <>
              <p className="text-center text-gray-200 dark:text-light text-lg">
                {hoveredTime
                  ? hoveredTime
                  : selectedHourlyData.precipHours[0].time.toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}{" "}
                - {hoveredPrecip.toFixed(1)} mm
              </p>
              <div
                style={{
                  width: graphWidth,
                  height: graphHeight,
                  margin: "auto",
                }}
              >
                <canvas ref={chartCanvas}></canvas>
              </div>
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
                  : selectedHourlyData.precipHours[0].time.toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
              </p>
              <p className="text-sm text-dark dark:text-light">
                Total precipitation:{" "}
                {selectedHourlyData
                  ? selectedHourlyData.precipHours
                      .reduce((sum, pt) => sum + pt.precipitation, 0)
                      .toFixed(1)
                  : "0"}{" "}
                mm
              </p>
              {selectedHourlyData &&
                selectedHourlyData.precipHours.length > 0 && (
                  <p className="text-sm text-dark dark:text-light mt-1">
                    {selectedHourlyData.precipHours.some(
                      (pt) => pt.precipitation >= 10
                    )
                      ? "Rainfall is high on this day."
                      : selectedHourlyData.precipHours.some(
                          (pt) => pt.precipitation >= 5
                        )
                      ? "Rainfall is moderate on this day."
                      : "Rainfall is low on this day."}
                  </p>
                )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default PrecipitationCard;
