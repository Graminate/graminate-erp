import { useEffect, useState, FormEvent } from "react";
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
import PoultryTaskCard from "@/components/cards/poultry/PoultryTaskCard";
import PoultryFeedCard from "@/components/cards/poultry/PoultryFeedCard";
import PoultryOverviewCard from "@/components/cards/poultry/PoultryOverviewCard";
import PoultryEggCard from "@/components/cards/poultry/PoultryEggCard";
import Button from "@/components/ui/Button";
import AddPoultryDataModal from "@/components/modals/AddPoultryDataModal";

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

interface PoultryFormData {
  totalChicks: number;
  flockId: string;
  breedType: string;
  flockAgeDays: number;
  expectedMarketDate: string;
  mortalityRate24h: number;
  vaccineStatus: string;
  nextVisit: string;
  totalEggsStock: number;
  dailyFeedConsumption: number;
  feedInventoryDays: number;
}

const Poultry = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const [salesPeriod, setSalesPeriod] = useState("This Month");
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [lightHours, setLightHours] = useState<number | null>(null);
  const fahrenheit = false;
  const [totalEggsStock, setTotalEggsStock] = useState(85200);
  const [totalChicks, setTotalChicks] = useState(850);
  const [dailyFeedConsumption, setDailyFeedConsumption] = useState(150);
  const [flockAgeDays, setFlockAgeDays] = useState(42);
  const [breedType, setBreedType] = useState("Broiler");
  const [flockId, setFlockId] = useState("1");
  const [expectedMarketDate, setExpectedMarketDate] = useState("2025-04-13");
  const [feedInventoryDays, setFeedInventoryDays] = useState(2);
  const [mortalityRate24h, setMortalityRate24h] = useState(0.2);
  const [vaccineStatus, setVaccineStatus] = useState<
    "Vaccinated" | "Pending" | "Over Due"
  >("Vaccinated");
  const [nextVisit, setNextVisit] = useState("2025-05-12");
  const [latestHealthDate, setLatestHealthDate] = useState<string>("—");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportStatus, setReportStatus] = useState("Pending");

  const [formData, setFormData] = useState<PoultryFormData>({
    totalChicks,
    flockId,
    breedType,
    flockAgeDays,
    expectedMarketDate,
    mortalityRate24h,
    vaccineStatus,
    nextVisit,
    totalEggsStock,
    dailyFeedConsumption,
    feedInventoryDays,
  });

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
    const fetchHealthRecordsAndSetNextVisit = async () => {
      if (!parsedUserId) return;

      try {
        const response = await axios.get(
          `http://localhost:3001/api/poultry_health/${parsedUserId}`
        );

        const healthRecords = response.data.health || [];

        const visitDates = healthRecords
          .map((record: any) => new Date(record.date))
          .filter((d: Date) => !isNaN(d.getTime()));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingDates = visitDates
          .filter((d: Date) => d.getTime() >= today.getTime())
          .sort((a: Date, b: Date) => a.getTime() - b.getTime());

        if (upcomingDates.length > 0) {
          setNextVisit(upcomingDates[0].toISOString().split("T")[0]); // e.g., "2025-05-15"
        } else {
          setNextVisit("N/A");
        }
      } catch (err) {
        console.error("Failed to fetch poultry health data", err);
        setNextVisit("N/A");
      }
    };

    fetchHealthRecordsAndSetNextVisit();
  }, [parsedUserId]);

  useEffect(() => {
    const fetchNextVisit = async () => {
      if (!parsedUserId) return;
      try {
        const response = await axios.get(
          `http://localhost:3001/api/poultry_health/${parsedUserId}`
        );
        const records = response.data.health || [];

        // Extract all visit dates as Date objects
        const visitDates = records
          .map((rec: any) => new Date(rec.date))
          .filter((d: Date) => !isNaN(d.getTime())); // valid dates only

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find the earliest visit date in the future
        const upcoming = visitDates
          .filter((d: Date) => d.getTime() >= today.getTime())
          .sort((a: Date, b: Date) => a.getTime() - b.getTime());

        if (upcoming.length > 0) {
          setNextVisit(upcoming[0].toISOString().split("T")[0]); // e.g., "2025-05-23"
        } else {
          setNextVisit("N/A");
        }
      } catch (error) {
        console.error("Error fetching poultry health records:", error);
        setNextVisit("N/A");
      }
    };

    fetchNextVisit();
  }, [parsedUserId]);
  // Health visit status
  useEffect(() => {
    const fetchLatestHealthVisit = async () => {
      if (!parsedUserId) return;

      try {
        const response = await axios.get(
          `http://localhost:3001/api/poultry_health/${parsedUserId}`
        );
        const records = response.data.health;

        if (Array.isArray(records) && records.length > 0) {
          const sorted = [...records].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          const latest = sorted[0];
          const latestDate = new Date(latest.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          latestDate.setHours(0, 0, 0, 0);

          setLatestHealthDate(latestDate.toLocaleDateString());

          const diffInDays =
            (today.getTime() - latestDate.getTime()) / (1000 * 3600 * 24);

          if (diffInDays === 0) {
            setReportStatus("Done");
          } else if (diffInDays <= 3 && diffInDays > 0) {
            setReportStatus("Pending");
          } else if (diffInDays > 3) {
            setReportStatus("Over Due");
          }

          // Check for upcoming visit
          const nextVisit = formData.nextVisit;
          if (nextVisit) {
            const visitDate = new Date(nextVisit);
            visitDate.setHours(0, 0, 0, 0);
            const daysUntilVisit =
              (visitDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

            if (daysUntilVisit <= 7 && daysUntilVisit >= 0) {
              setReportStatus("Upcoming");
            }
          }
        } else {
          setLatestHealthDate("N/A"); // ✅ when no record
          setReportStatus("N/A"); // ✅ when no record
        }
      } catch (error) {
        console.error("Failed to fetch latest health visit:", error);
      }
    };

    fetchLatestHealthVisit();
  }, [parsedUserId, formData.nextVisit]); // also depend on visit date

  useEffect(() => {
    const fetchLatestHealthVisit = async () => {
      if (!parsedUserId) return;

      try {
        const response = await axios.get(
          `http://localhost:3001/api/poultry_health/${parsedUserId}`
        );
        const records = response.data.health;

        if (Array.isArray(records) && records.length > 0) {
          // Sort by date descending
          const sorted = [...records].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          const latestDate = new Date(sorted[0].date).toLocaleDateString();
          setLatestHealthDate(latestDate);
        }
      } catch (error) {
        console.error("Failed to fetch latest health visit:", error);
      }
    };

    fetchLatestHealthVisit();
  }, [parsedUserId]);

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
          setLightHours(daylightSeconds / 3600);
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

  useEffect(() => {
    const dynamicAlerts = [];
    let alertIdCounter = 1;

    if (temperature !== null && temperature >= 35) {
      dynamicAlerts.push({
        id: alertIdCounter++,
        type: "Critical",
        message: `High Temperature Alert (${formatTemperature(temperature)})`, // Use formatter
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

    if (nextVisit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const visitDate = new Date(nextVisit);
      visitDate.setHours(0, 0, 0, 0);
      const diffInTime = visitDate.getTime() - today.getTime();
      const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

      if (diffInDays <= 7 && diffInDays >= 0) {
        // Alert if within 7 days or today
        dynamicAlerts.push({
          id: alertIdCounter++,
          type: "Info",
          message: `Upcoming Veterinary visit in ${diffInDays} day${
            diffInDays !== 1 ? "s" : ""
          } (on ${new Date(nextVisit).toLocaleDateString()}).`,
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const processedValue =
      type === "number" ? (value === "" ? "" : Number(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  // --- Form Submit Handler ---
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    setTotalChicks(formData.totalChicks);
    setFlockId(formData.flockId);
    setBreedType(formData.breedType);
    setFlockAgeDays(formData.flockAgeDays);
    setExpectedMarketDate(formData.expectedMarketDate);
    setMortalityRate24h(formData.mortalityRate24h);
    setVaccineStatus(
      formData.vaccineStatus as "Vaccinated" | "Pending" | "Over Due"
    );
    setNextVisit(formData.nextVisit);
    setTotalEggsStock(formData.totalEggsStock);
    setDailyFeedConsumption(formData.dailyFeedConsumption);
    setFeedInventoryDays(formData.feedInventoryDays);

    // Close the modal
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
                mortalityRate24h,
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
            mortalityRate24h={mortalityRate24h}
            vaccineStatus={vaccineStatus}
            nextVisit={nextVisit}
            reportStatus={reportStatus}
            userId={typeof user_id === "string" ? user_id : ""}
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

      {isModalOpen && (
        <AddPoultryDataModal
          formData={formData}
          onClose={() => setIsModalOpen(false)}
          onChange={handleInputChange}
          onSubmit={handleFormSubmit}
          userId={parsedUserId || ""}
          refreshHealthRecords={async () => {
            console.log("Refreshing health records...");
            // Add logic to refresh health records if needed
            return Promise.resolve();
          }}
        />
      )}
    </PlatformLayout>
  );
};

export default Poultry;
