import { useEffect, useState, FormEvent, useCallback } from "react";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import { Bar } from "react-chartjs-2";
import { useRouter } from "next/router";
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

import VeterinaryCard from "@/components/cards/poultry/VeterinaryCard";
import EnvironmentCard from "@/components/cards/poultry/EnvironmentCard";
import PoultryFeedCard from "@/components/cards/poultry/PoultryFeedCard";
import PoultryOverviewCard from "@/components/cards/poultry/PoultryOverviewCard";
import PoultryEggCard from "@/components/cards/poultry/PoultryEggCard";
import Button from "@/components/ui/Button";
import AddPoultryDataModal from "@/components/modals/AddPoultryDataModal";
import axiosInstance from "@/lib/utils/axiosInstance";
import ActiveProducts from "@/components/cards/ActiveProducts";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import TaskAdder from "@/components/cards/TaskAdder";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const salesChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  datasets: [
    {
      label: "Monthly Egg Sales Value (₹)",
      data: [65000, 59000, 80000, 81000, 56000, 55000, 40000, 70000],
      backgroundColor: "rgba(54, 162, 235, 0.6)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1,
    },
  ],
};

const salesChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, title: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: number | string) {
          if (typeof value === "number") {
            return "₹" + value / 1000 + "k";
          }
          return value;
        },
      },
    },
    x: { grid: { display: false } },
  },
};

const eggGradingPieData = {
  labels: ["Small", "Medium", "Large", "Extra Large", "Jumbo", "Broken"],
  datasets: [
    {
      label: "Egg Count",
      data: [120, 300, 250, 150, 100, 30],
      backgroundColor: [
        "rgba(255, 206, 86, 0.7)",
        "rgba(75, 192, 192, 0.7)",
        "rgba(54, 162, 235, 0.7)",
        "rgba(54, 102, 205, 0.7)",
        "rgba(153, 102, 255, 0.7)",
        "rgba(255, 99, 132, 0.7)",
      ],
      borderColor: [
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(54, 102, 205, 0.7)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 99, 132, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

type Priority = "High" | "Medium" | "Low";

const tasks: {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
}[] = [
  { id: 1, text: "Check water lines", completed: false, priority: "High" },
  { id: 2, text: "Record feed levels", completed: true, priority: "Medium" },
  { id: 3, text: "Schedule vet visit", completed: false, priority: "Medium" },
  { id: 4, text: "Clean House B", completed: false, priority: "Low" },
  { id: 5, text: "Order new feed batch", completed: false, priority: "High" },
];

type VaccineStatus = "Vaccinated" | "Unvaccinated" | "N/A";

type PoultryFormData = {
  totalChicks: number;
  flockId: string;
  breedType: string;
  flockAgeDays: number;
  expectedMarketDate: string;
  mortalityRate: number | null;
  vaccineStatus: VaccineStatus;
  nextVisit: string;
  totalEggsStock: number;
  dailyFeedConsumption: number;
  feedInventoryDays: number;
};

type Alert = {
  id: number;
  message: string;
  type: "Critical" | "Warning" | "Info" | "Default";
};

type HealthRecord = {
  date: string;
  mortality_rate: number | null;
  vaccines?: string[];
};

const Poultry = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const [salesPeriod, setSalesPeriod] = useState("This Month");
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [lightHours, setLightHours] = useState<number | null>(null);
  const [totalEggsStock, setTotalEggsStock] = useState(85200);
  const [totalChicks, setTotalChicks] = useState(850);
  const [dailyFeedConsumption, setDailyFeedConsumption] = useState(150);
  const [flockAgeDays, setFlockAgeDays] = useState(42);
  const [breedType, setBreedType] = useState("Broiler");
  const [flockId, setFlockId] = useState("1");
  const [expectedMarketDate, setExpectedMarketDate] = useState("2025-04-13");
  const [feedInventoryDays, setFeedInventoryDays] = useState(2);
  const [mortalityRate, setMortalityRate] = useState<number | null>(null);
  const [vaccineStatus, setVaccineStatus] = useState<VaccineStatus>("N/A");
  const [nextVisit, setNextVisit] = useState("2025-05-12");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sensorUrl, setSensorUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<PoultryFormData>({
    totalChicks,
    flockId,
    breedType,
    flockAgeDays,
    expectedMarketDate,
    mortalityRate,
    vaccineStatus,
    nextVisit,
    totalEggsStock,
    dailyFeedConsumption,
    feedInventoryDays,
  });
  const [items, setItems] = useState([
    "Broiler Chicken",
    "Hen Layers",
    "Broiler Duck",
    "Duck Layers",
  ]);

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

  // Fetch health records and calculate next visit and mortality rate
  useEffect(() => {
    const fetchHealthRecordsAndSetNextVisit = async () => {
      if (!parsedUserId) return;

      try {
        const response = await axiosInstance.get<{ health: HealthRecord[] }>(
          `/poultry_health/${parsedUserId}`
        );

        const healthRecords = response.data.health || [];

        const visitDates = healthRecords
          .map((record: HealthRecord) => new Date(record.date))
          .filter((d: Date) => !isNaN(d.getTime()));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingDates = visitDates
          .filter((d: Date) => d.getTime() >= today.getTime())
          .sort((a: Date, b: Date) => a.getTime() - b.getTime());
        if (upcomingDates.length > 0) {
          setNextVisit(upcomingDates[0].toLocaleDateString("en-CA")); // Format YYYY-MM-DD
        } else {
          setNextVisit("N/A");
        }

        // Mortality Rate: average from the last 3 records
        if (healthRecords.length > 0) {
          const sortedRecords = [...healthRecords].sort(
            (a: HealthRecord, b: HealthRecord) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          const recentRecords: HealthRecord[] = sortedRecords.slice(0, 3);
          const mortalitySum = recentRecords.reduce(
            (sum: number, record: HealthRecord) =>
              sum + (record.mortality_rate || 0),
            0
          );
          const averageMortality =
            recentRecords.length > 0
              ? mortalitySum / recentRecords.length
              : null;
          setMortalityRate(averageMortality);

          // Set vaccine status from latest record
          const latestRecord = sortedRecords[0];
          const vaccines = latestRecord?.vaccines;
          const isVaccinated = Array.isArray(vaccines) && vaccines.length > 0;
          setVaccineStatus(isVaccinated ? "Vaccinated" : "Unvaccinated");
        } else {
          setMortalityRate(null);
          setVaccineStatus("N/A");
        }
      } catch (err) {
        console.error("Failed to fetch poultry health data", err);
        setNextVisit("N/A");
        setMortalityRate(null);
        setVaccineStatus("N/A");
      }
    };

    fetchHealthRecordsAndSetNextVisit();
  }, [parsedUserId]);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      const endpoint = sensorUrl || "/api/weather";
      try {
        const response = await axios.get(endpoint, {
          params: sensorUrl ? undefined : { lat, lon },
        });
        const newWeatherData = {
          temperature: Math.round(response.data.current.temperature2m),
          humidity: Math.round(response.data.current.relativeHumidity2m),
          lightHours:
            typeof response.data.daily.daylightDuration?.[0] === "number"
              ? response.data.daily.daylightDuration[0] / 3600
              : null,
          timestamp: Date.now(),
        };
        localStorage.setItem("weatherData", JSON.stringify(newWeatherData));
        setTemperature(newWeatherData.temperature);
        setHumidity(newWeatherData.humidity);
        setLightHours(newWeatherData.lightHours);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to fetch weather", error.message);
        } else {
          console.error("An unknown error occurred while fetching weather");
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

    const cached = localStorage.getItem("weatherData");
    if (cached) {
      const parsed = JSON.parse(cached);
      const isValid = Date.now() - parsed.timestamp < 2 * 60 * 1000; // Cache for 2 minutes
      if (isValid) {
        setTemperature(parsed.temperature);
        setHumidity(parsed.humidity);
        setLightHours(parsed.lightHours);
        return;
      }
    }
    getLocationAndFetch();
  }, [sensorUrl]);

  useEffect(() => {
    const dynamicAlerts: Alert[] = [];
    let alertIdCounter = 1;
    if (temperature !== null && temperature >= 35) {
      dynamicAlerts.push({
        id: alertIdCounter++,
        type: "Critical",
        message: `High Temperature Alert (${formatTemperature(temperature)})`,
      });
    } else if (temperature !== null && temperature <= 15) {
      dynamicAlerts.push({
        id: alertIdCounter++,
        type: "Warning",
        message: `Low Temperature Alert (${formatTemperature(temperature)})`,
      });
    }
    if (feedInventoryDays < 3) {
      dynamicAlerts.push({
        id: alertIdCounter++,
        type: "Warning",
        message: `Feed Inventory Low (${feedInventoryDays} day${
          feedInventoryDays !== 1 ? "s" : ""
        } remaining)`,
      });
    }
    if (nextVisit && nextVisit !== "N/A") {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const visitDate = new Date(nextVisit);
        visitDate.setHours(0, 0, 0, 0);
        const diffInTime = visitDate.getTime() - today.getTime();
        const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

        if (diffInDays <= 7 && diffInDays >= 0) {
          dynamicAlerts.push({
            id: alertIdCounter++,
            type: "Info",
            message: `Upcoming Veterinary visit in ${diffInDays} day${
              diffInDays !== 1 ? "s" : ""
            } (on ${new Date(nextVisit).toLocaleDateString()}).`,
          });
        }
      } catch (e) {
        console.error("Error parsing nextVisit date for alert:", e);
      }
    }
    setActiveAlerts(dynamicAlerts);
  }, [temperature, feedInventoryDays, nextVisit, formatTemperature]); // formatTemperature is already a dependency

  const dismissAlert = (id: number) => {
    setActiveAlerts((current) => current.filter((alert) => alert.id !== id));
  };

  const getAlertStyle = (type: Alert["type"]): string => {
    switch (type) {
      case "Critical":
        return "bg-red-300 border-red-500 text-red-100 dark:bg-red-300 dark:border-red-600 dark:text-red-800";
      case "Warning":
        return "bg-yellow-200 border-yellow-500 text-yellow-700 dark:bg-yellow-200 dark:border-yellow-600 dark:text-yellow-800";
      case "Info":
        return "bg-blue-300 border-blue-500 text-blue-100 dark:bg-blue-300 dark:border-blue-600 dark:text-blue-800";
      default:
        return "bg-gray-300 border-gray-500 text-gray-700 dark:bg-gray-200 dark:border-gray-600 dark:text-gray-800";
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "vaccineStatus") {
      const statusValue = value as VaccineStatus;
      setFormData((prev) => ({ ...prev, [name]: statusValue }));
    } else {
      const processedValue =
        type === "number" ? (value === "" ? "" : Number(value)) : value;
      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newTotalChicks = Number(formData.totalChicks) || 0;
    const newFlockAgeDays = Number(formData.flockAgeDays) || 0;
    const newMortalityRate =
      formData.mortalityRate === null ? null : Number(formData.mortalityRate);
    const newTotalEggsStock = Number(formData.totalEggsStock) || 0;
    const newDailyFeedConsumption = Number(formData.dailyFeedConsumption) || 0;
    const newFeedInventoryDays = Number(formData.feedInventoryDays) || 0;

    setTotalChicks(newTotalChicks);
    setFlockId(formData.flockId);
    setBreedType(formData.breedType);
    setFlockAgeDays(newFlockAgeDays);
    setExpectedMarketDate(formData.expectedMarketDate);
    setMortalityRate(newMortalityRate);
    setVaccineStatus(formData.vaccineStatus);
    setNextVisit(formData.nextVisit);
    setTotalEggsStock(newTotalEggsStock);
    setDailyFeedConsumption(newDailyFeedConsumption);
    setFeedInventoryDays(newFeedInventoryDays);

    setIsModalOpen(false);
  };

  const flockAgeWeeks = (flockAgeDays / 7).toFixed(1);

  const getFeedLevelColor = (days: number) => {
    if (days < 2) return "text-red-500 dark:text-red-400";
    if (days < 5) return "text-yellow-500 dark:text-yellow-400";
    return "text-green-500 dark:text-green-400";
  };

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Poultry Dashboard</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4 space-y-6">
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border-l-4 p-3 rounded-md flex justify-between items-center ${getAlertStyle(
                  alert.type
                )}`}
                role="alert"
              >
                <div>
                  <p className="font-bold">{alert.type}</p>
                  <p className="text-sm">{alert.message}</p>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-xl font-semibold hover:opacity-75"
                  aria-label="Dismiss alert"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <h1 className="text-lg font-semibold dark:text-white">
            Poultry Management
          </h1>
          <Button
            add
            text="Add / Edit Data"
            style="primary"
            onClick={() => {
              setFormData({
                totalChicks,
                flockId,
                breedType,
                flockAgeDays,
                expectedMarketDate,
                mortalityRate,
                vaccineStatus,
                nextVisit,
                totalEggsStock,
                dailyFeedConsumption,
                feedInventoryDays,
              });
              setIsModalOpen(true);
            }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PoultryOverviewCard
            totalChicks={totalChicks}
            flockId={flockId}
            breedType={breedType}
            flockAgeDays={flockAgeDays}
            flockAgeWeeks={flockAgeWeeks}
            expectedMarketDate={expectedMarketDate}
          />
          <VeterinaryCard
            mortalityRate={mortalityRate}
            vaccineStatus={vaccineStatus}
            nextVisit={nextVisit}
            userId={parsedUserId || ""}
          />
          <EnvironmentCard
            temperature={temperature}
            humidity={humidity}
            lightHours={lightHours}
            formatTemperature={formatTemperature}
            onCustomUrlSubmit={(url) => setSensorUrl(url)}
          />
          <PoultryEggCard
            totalEggsStock={totalEggsStock}
            totalChicks={totalChicks}
            eggGradingPieData={eggGradingPieData}
            eggGradingPieOptions={salesChartOptions}
          />
          <PoultryFeedCard
            dailyFeedConsumption={dailyFeedConsumption}
            feedInventoryDays={feedInventoryDays}
            getFeedLevelColor={getFeedLevelColor}
          />
          <ActiveProducts
            headerTitle="My Flocks"
            items={items}
            onReorder={setItems}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-dark p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-dark dark:text-gray-300">
                📈 Sales Performance
              </h2>
              <select
                value={salesPeriod}
                onChange={(e) => setSalesPeriod(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="relative h-56">
              <Bar data={salesChartData} options={salesChartOptions} />
            </div>
          </div>
        </div>
        <TaskAdder userId={Number(parsedUserId)} projectType="Poultry" />
      </div>
      {isModalOpen && (
        <AddPoultryDataModal
          formData={formData}
          onClose={() => setIsModalOpen(false)}
          onChange={handleInputChange}
          onSubmit={handleFormSubmit}
          userId={parsedUserId || ""}
          refreshHealthRecords={async () => {
            return Promise.resolve();
          }}
        />
      )}
    </PlatformLayout>
  );
};

export default Poultry;
