import { useState, useEffect, useCallback } from "react";
import { Coordinates } from "@/types/card-props";
import { fetchCityName } from "@/lib/utils/loadWeather";
import axios from "axios";
import Loader from "@/components/ui/Loader";

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

  const convertToFahrenheit = useCallback((celsius: number): number => {
    return Math.round((celsius * 9) / 5 + 32);
  }, []);

  const formatTemperature = useCallback(
    (value: number | null, showUnit: boolean = true): string => {
      if (value === null) return "N/A";
      const temp = fahrenheit ? convertToFahrenheit(value) : value;
      return showUnit ? `${temp}°${fahrenheit ? "F" : "C"}` : `${temp}°`;
    },
    [fahrenheit, convertToFahrenheit]
  );

  const fetchWeather = useCallback(
    async (latitude: number, longitude: number) => {
      const getHourlyWeatherIcon = (
        rain?: number,
        snowfall?: number,
        cloudCover?: number,
        isDayHour?: number
      ): string => {
        if (snowfall && snowfall > 0) return "❄️";
        if (rain && rain > 0) return "🌧";
        if (cloudCover && cloudCover > 50) return "☁️";
        return isDayHour === 1 ? "☀️" : "🌙";
      };

      try {
        const response = await axios.get("/api/weather", {
          params: { lat: latitude, lon: longitude },
        });

        const data = response.data;

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
            else if (data.daily.cloudCover?.[index] > 50) icon = "☁️";

            return {
              day,
              maxTemp: Math.round(data.daily.temperature2mMax[index]),
              minTemp: Math.round(data.daily.temperature2mMin[index]),
              icon,
            };
          })
          .filter((_: unknown, index: number) => index < 7);

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
              data.hourly.cloudCover?.[index],
              data.hourly.isDay?.[index]
            ),
          })
        );

        const now = new Date(data.current.time);
        const endOfForecast = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const filteredHourlyData = hourlyData.filter((hour) => {
          const hourDate = new Date(`${hour.date}T${hour.time}:00:00`);
          return hourDate >= now && hourDate < endOfForecast;
        });

        const filteredDailyData = dailyData
          .filter((dayData, index) => {
            const dayDate = new Date(data.daily.time[index]);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dayDate.setHours(0, 0, 0, 0);
            return dayDate > today;
          })
          .slice(0, 6);

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
          dailyForecast: filteredDailyData,
        };
      } catch (err: unknown) {
        throw new Error("Failed to fetch weather data");
      }
    },
    []
  );

  const getHourlyWeatherIcon = useCallback(
    (
      rain?: number,
      snowfall?: number,
      cloudCover?: number,
      isDayHour?: number
    ): string => {
      if (snowfall && snowfall > 0) return "❄️";
      if (rain && rain > 0) return "🌧";
      if (cloudCover && cloudCover > 50) return "☁️";

      return isDayHour === 1 ? "☀️" : "🌙";
    },
    []
  );

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
          setError(null);
        })
        .catch((err: unknown) => {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error occurred";
          setError(errorMessage);
        });
    } else {
      setError("Latitude and Longitude are required to fetch weather data.");
    }
  }, [lat, lon, fetchWeather]);

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
              className="w-full text-left text-sm px-4 py-2 hover:bg-gray-400 hover:rounded-t-lg dark:hover:bg-gray-800 cursor-pointer"
              type="button"
              onClick={() => {
                setDisplayMode("Small");
                setDropdownOpen(false);
              }}
            >
              Small
            </button>
            <button
              className="w-full text-left text-sm px-4 py-2 hover:bg-gray-400  dark:hover:bg-gray-800 cursor-pointer"
              type="button"
              onClick={() => {
                setDisplayMode("Medium");
                setDropdownOpen(false);
              }}
            >
              Medium
            </button>
            <button
              className="w-full text-left text-sm px-4 py-2 hover:bg-gray-400 hover:rounded-b-lg dark:hover:bg-gray-800 cursor-pointer"
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
        <p className="text-red-500 text-center py-10">{error}</p>
      ) : temperature !== null ? (
        <>
          <div className={`w-full ${displayMode === "Small" ? "pb-8" : ""}`}>
            {(displayMode === "Small" ||
              displayMode === "Medium" ||
              displayMode === "Large") && (
              <div className="flex justify-between w-full items-start">
                <div className="text-left">
                  <p className="text-lg font-semibold">{locationName}</p>
                  <p className="text-4xl font-bold mt-1">
                    {formatTemperature(temperature)}
                  </p>
                  <p className="mt-1 text-sm">
                    Feels like: {formatTemperature(apparentTemperature)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-5xl">
                    {getHourlyWeatherIcon(
                      rain ?? undefined,
                      snowfall ?? undefined,
                      cloudCover ?? undefined,
                      isDay ?? undefined
                    )}
                  </p>
                  <p className="mt-2 text-sm">
                    H: {formatTemperature(maxTemp)} L:{" "}
                    {formatTemperature(minTemp)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {(displayMode === "Medium" || displayMode === "Large") && (
            <>
              <hr className="my-4 w-full border-white/50" />
              <div className="w-full overflow-x-auto">
                <div className="flex space-x-4 pb-2">
                  {hourlyForecast.map((hour, index) => (
                    <div key={index} className="text-center flex-shrink-0 w-14">
                      <p className="text-sm">{hour.time}:00</p>
                      <p className="text-3xl my-1">{hour.icon}</p>
                      <p className="text-md font-medium">
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
              <hr className="my-3 w-full border-white/50" />
              <div className="w-full flex flex-col items-center space-y-1">
                {dailyForecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center w-full px-2"
                  >
                    <p className="text-md font-medium w-1/4 text-left">
                      {day.day}
                    </p>
                    <p className="text-2xl w-1/4 text-center">{day.icon}</p>

                    <div className="w-1/2 flex justify-end space-x-3">
                      <p className="text-md font-medium">
                        {formatTemperature(day.minTemp, false)}
                      </p>

                      <p className="text-md font-medium opacity-70">
                        {formatTemperature(day.maxTemp, false)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-center py-10">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default TemperatureCard;
