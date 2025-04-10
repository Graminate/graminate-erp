import { useEffect, useState } from "react";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import { Bar } from "react-chartjs-2";
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
import PoultryTaskCard from "@/components/cards/poultry/PoultryTaskCard";
import PoultryFeedCard from "@/components/cards/poultry/PoultryFeedCard";
import PoultryOverviewCard from "@/components/cards/poultry/PoultryOverviewCard";
import PoultryEggCard from "@/components/cards/poultry/PoultryEggCard";

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

const eggGradingPieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom" as const,
      labels: { padding: 10, boxWidth: 12 },
    },
    title: { display: false },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          let label = context.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed !== null) {
            label += context.parsed + "%";
          }
          return label;
        },
      },
    },
  },
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

const Poultry = () => {
  const [salesPeriod, setSalesPeriod] = useState("This Month");
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [lightHours, setLightHours] = useState<number | null>(null);
  const fahrenheit = false;

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

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await axios.get("/api/weather", {
          params: { lat, lon },
        });

        setTemperature(Math.round(response.data.current.temperature2m));
        setHumidity(Math.round(response.data.current.relativeHumidity2m));

        const daylightSeconds = response.data.daily.daylightDuration?.[0];
        if (typeof daylightSeconds === "number") {
          setLightHours(daylightSeconds / 3600); // convert to hours
        }
      } catch (err: any) {
        console.error("Failed to fetch weather", err.message);
      }
    };

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
  }, []);

  const feedInventoryDays = 2;
  useEffect(() => {
    const dynamicAlerts = [];

    if (temperature !== null && temperature >= 39) {
      dynamicAlerts.push({
        id: 1,
        type: "Critical",
        message: `High Temperature Alert in House A (${temperature}°C)`,
      });
    }

    if (feedInventoryDays < 2) {
      dynamicAlerts.push({
        id: 2,
        type: "Warning",
        message: "Feed Inventory Low (< 2 days remaining)",
      });
    }

    if (expectedMarketDate) {
      const today = new Date();
      const vetVisitDate = new Date(expectedMarketDate);
      const diffInTime = vetVisitDate.getTime() - today.getTime();
      const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

      if (diffInDays === 7) {
        dynamicAlerts.push({
          id: 3,
          type: "Info",
          message: `Veterinary visit scheduled in 7 days (on ${expectedMarketDate}).`,
        });
      }
    }

    setActiveAlerts(dynamicAlerts);
  }, [temperature, feedInventoryDays]);

  const dismissAlert = (id: number) => {
    setActiveAlerts((current) => current.filter((alert) => alert.id !== id));
  };

  const getAlertStyle = (type: string): string => {
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

  // --- Dummy Data Values ---
  const totalEggsStock = 85200;
  const totalChicks = 850;
  const dailyFeedConsumption = 150;
  const flockAgeDays = 42;
  const flockAgeWeeks = (flockAgeDays / 7).toFixed(1);
  const breedType = "Broiler";
  const flockId = "1";
  const expectedMarketDate = "2025-04-13";

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
        {/* Alerts Banner */}
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
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold dark:text-white">
            Poultry Management
          </h1>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Flock Overview Panel */}
          <PoultryOverviewCard
            totalChicks={totalChicks}
            flockId={flockId}
            breedType={breedType}
            flockAgeDays={flockAgeDays}
            flockAgeWeeks={flockAgeWeeks}
            expectedMarketDate={expectedMarketDate}
          />
          {/* Veterniary Card */}
          <VeterinaryCard
            mortalityRate24h={0.2}
            vaccineStatus="Vaccinated"
            nextVisit={"2025-05-12"}
          />

          {/* Environmental Conditions */}
          <EnvironmentCard
            temperature={temperature}
            humidity={humidity}
            lightHours={lightHours}
            formatTemperature={formatTemperature}
          />

          {/* Egg Production */}
          <PoultryEggCard
            totalEggsStock={totalEggsStock}
            totalChicks={totalChicks}
            eggGradingPieData={eggGradingPieData}
            eggGradingPieOptions={eggGradingPieOptions}
          />

          <PoultryFeedCard
            dailyFeedConsumption={dailyFeedConsumption}
            feedInventoryDays={feedInventoryDays}
            getFeedLevelColor={getFeedLevelColor}
          />
        </div>

        {/* Row 2: Feed, Sales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sales */}
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

        {/* Row 3: Tasks */}
        <PoultryTaskCard initialTasks={tasks} />
      </div>
    </PlatformLayout>
  );
};

export default Poultry;
