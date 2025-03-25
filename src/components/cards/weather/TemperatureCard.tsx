import { useState, useEffect } from "react";
import { Coordinates } from "@/types/card-props";
import { fetchCityName } from "@/lib/utils/loadWeather";
import axios from "axios";

type HourlyForecast = {
  time: string;
  temperature: number;
  date: string;
  icon: string;
};

type DailyForecast = {
  day: string;
  maxTemp: number;
  minTemp: number;
  icon: string;
};

const TemperatureCard = ({ lat, lon, fahrenheit }: Coordinates) => {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [apparentTemperature, setApparentTemperature] = useState<number | null>(
    null
  );
  const [maxTemp, setMaxTemp] = useState<number | null>(null);
  const [minTemp, setMinTemp] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isDay, setIsDay] = useState<number | null>(null);
  const [rain, setRain] = useState<number | null>(null);
  const [snowfall, setSnowfall] = useState<number | null>(null);
  const [cloudCover, setCloudCover] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<"Small" | "Medium" | "Large">(
    "Small"
  );

  function convertToFahrenheit(celsius: number): number {
    return Math.round((celsius * 9) / 5 + 32);
  }

  function formatTemperature(
    value: number | null,
    showUnit: boolean = true
  ): string {
    if (value === null) return "N/A";
    const temp = fahrenheit ? convertToFahrenheit(value) : value;
    return showUnit ? `${temp}°${fahrenheit ? "F" : "C"}` : `${temp}°`;
  }

  async function fetchWeather(latitude: number, longitude: number) {
    try {
      const response = await axios.get("/api/weather", {
        params: { lat: latitude, lon: longitude },
      });

      const data = response.data;
      const todayDate = new Date(data.current.time).toISOString().split("T")[0];

      const dailyData: DailyForecast[] = data.daily.time
        .map((date: string, index: number): DailyForecast => {
          const day = new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
          });

          let icon = "☀️";
          if (data.daily.snowfallSum[index] > 0) icon = "❄️";
          else if (data.daily.rainSum[index] > 0) icon = "🌧";
          else if (data.daily.showersSum[index] > 0) icon = "🌦";
          else if (data.daily.precipitationSum[index] > 0) icon = "🌧";
          else if (data.daily.cloudCover?.[index] > 0) icon = "☁️";

          return {
            day,
            maxTemp: Math.round(data.daily.temperature2mMax[index]),
            minTemp: Math.round(data.daily.temperature2mMin[index]),
            icon,
          };
        })
        .filter((_: any, index: number) => data.daily.time[index] > todayDate);

      const hourlyTime = data.hourly.time;
      const hourlyTemperature = Object.values(data.hourly.temperature2m);
      const hourlyData: HourlyForecast[] = hourlyTime.map(
        (time: string, index: number) => ({
          time: time.split("T")[1].split(":")[0],
          date: time.split("T")[0],
          temperature: Math.round(hourlyTemperature[index] as number),
          icon: getHourlyWeatherIcon(
            data.hourly.rain?.[index],
            data.hourly.snowfall?.[index],
            data.hourly.cloudCover?.[index]
          ),
        })
      );

      const filteredHourlyData = hourlyData.filter(
        (hour) =>
          new Date(`${hour.date}T${hour.time}:00Z`) >=
            new Date(data.current.time) &&
          new Date(`${hour.date}T${hour.time}:00Z`) <
            new Date(
              new Date(data.current.time).getTime() + 24 * 60 * 60 * 1000
            )
      );

      return {
        temperature: Math.round(data.current.temperature2m),
        apparentTemperature: Math.round(data.current.apparentTemperature),
        isDay: data.current.isDay,
        rain: data.current.rain,
        snowfall: data.current.snowfall,
        cloudCover: data.current.cloudCover,
        maxTemp: Math.round(data.daily.temperature2mMax[0]),
        minTemp: Math.round(data.daily.temperature2mMin[0]),
        hourlyForecast: filteredHourlyData,
        dailyForecast: dailyData,
      };
    } catch (err: any) {
      console.error(err.message);
      throw new Error("Failed to fetch weather data");
    }
  }

  function getHourlyWeatherIcon(
    rain?: number,
    snowfall?: number,
    cloudCover?: number
  ): string {
    if (rain && rain > 0) return "🌧";
    if (snowfall && snowfall > 0) return "❄️";
    if (cloudCover && cloudCover > 0) return "☁️";
    return "☀️";
  }

  useEffect(() => {
    if (lat !== undefined && lon !== undefined) {
      Promise.all([fetchWeather(lat, lon), fetchCityName(lat, lon)])
        .then(([weather, city]) => {
          setTemperature(weather.temperature);
          setApparentTemperature(weather.apparentTemperature);
          setIsDay(weather.isDay);
          setRain(weather.rain);
          setSnowfall(weather.snowfall);
          setCloudCover(weather.cloudCover);
          setMaxTemp(weather.maxTemp);
          setMinTemp(weather.minTemp);
          setHourlyForecast(weather.hourlyForecast);
          setDailyForecast(weather.dailyForecast);
          setLocationName(city);
        })
        .catch((err: any) => {
          setError(err.message);
        });
    } else {
      setError("Latitude and Longitude are required to fetch weather data.");
    }
  }, [lat, lon, fahrenheit]);

  return (
    <div
      className={`p-4 rounded-lg shadow-md max-w-sm mx-auto flex flex-col items-center relative ${
        isDay === 1
          ? "bg-gradient-to-t from-blue-300 to-blue-200 text-white"
          : "bg-gradient-to-t from-blue-950 to-blue-100 text-white"
      }`}
    >
      <div className="absolute top-2 right-2 z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 cursor-pointer"
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
                setDisplayMode("Medium");
                setDropdownOpen(false);
              }}
            >
              Medium
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
      ) : temperature !== null ? (
        <>
          {(displayMode === "Small" ||
            displayMode === "Medium" ||
            displayMode === "Large") && (
            <div className="flex justify-between w-full">
              <div className="text-center">
                <p className="text-lg font-bold">{locationName}</p>
                <p className="text-4xl font-bold">
                  {formatTemperature(temperature)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-5xl">
                  {getHourlyWeatherIcon(
                    rain ?? undefined,
                    snowfall ?? undefined,
                    cloudCover ?? undefined
                  )}
                </p>
                <p className="mt-2 text-sm">
                  H: {formatTemperature(maxTemp)} L:{" "}
                  {formatTemperature(minTemp)}
                </p>
                <p className="mt-1 text-sm">
                  Feels like: {formatTemperature(apparentTemperature)}
                </p>
              </div>
            </div>
          )}
          {(displayMode === "Medium" || displayMode === "Large") && (
            <>
              <hr className="my-4 w-full" />
              <div className="w-full overflow-x-auto">
                <div className="flex space-x-4">
                  {hourlyForecast.map((hour, index) => (
                    <div key={index} className="text-center flex-shrink-0">
                      <p className="text-sm">{hour.time}:00</p>
                      <p className="text-3xl">{hour.icon}</p>
                      <p className="text-md">
                        {formatTemperature(hour.temperature, false)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {displayMode === "Large" && (
            <>
              <hr className="my-3 w-full" />
              <div className="w-full flex flex-col items-center">
                {dailyForecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center w-full"
                  >
                    <p className="text-lg font-semibold w-1/3 text-center">
                      {day.day}
                    </p>
                    <p className="text-3xl w-1/3 text-center">{day.icon}</p>
                    <p className="text-lg w-1/3 text-center">
                      {formatTemperature(day.minTemp, false)}
                    </p>
                    <p className="text-lg w-1/3 text-center">
                      {formatTemperature(day.maxTemp, false)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : null}
    </div>
  );
};

export default TemperatureCard;
