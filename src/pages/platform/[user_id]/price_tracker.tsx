import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import SearchBar from "@/components/ui/SearchBar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

const PriceTracker = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0); // Set time to 12:00 AM
  const currentHour = now.getHours(); // Get the current hour (0-23)

  const fullLabels = {
    "1D": Array.from({ length: 24 }, (_, i) => {
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0); // Set to 12:00 AM
      return new Date(midnight.getTime() + i * 60 * 60 * 1000).getTime(); // Generate hourly timestamps
    }),
    "7D": Array.from({ length: 8 * 7 + 1 }, (_, i) => {
      const dayOffset = Math.floor(i / 8); // Which day this belongs to (0 to 6)
      const hourOffset = (i % 8) * 3; // Which hour (0, 3, 6, 9, 12, 15, 18, 21)

      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - 6 + dayOffset); // Go back 6 days
      timestamp.setHours(hourOffset, 0, 0, 0); // Set the hour based on offset

      return timestamp.getTime();
    }),
    "1M": Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i)); // Generate last 30 days
      date.setHours(0, 0, 0, 0); // Set time to midnight
      return date.getTime();
    }),
    "1Y": Array.from({ length: 365 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (364 - i)); // Generate last 365 days
      date.setHours(0, 0, 0, 0); // Set time to midnight
      return date.getTime();
    }),
  };

  // Ensure data is only available until the current hour for 1D
  const generateData = (base: number, range: number) =>
    Array.from(
      { length: 24 },
      (_, i) =>
        i <= currentHour ? Math.floor(Math.random() * range) + base : null // Show data only until the current hour
    );

  const generate7DData = (base: number, range: number) =>
    Array.from(
      { length: 8 * 7 + 1 },
      () => Math.floor(Math.random() * range) + base
    );

  const commodityData: {
    [key: string]: {
      "1D": (number | null)[];
      "7D": number[];
      "1M": number[];
      "1Y": number[];
    };
  } = {
    Cabbage: {
      "1D": [
        1800, 1610, 1608, 1622, 1620, 1615, 1630, 1628, 1642, 1650, 1665, 1658,
      ],
      "7D": [1600, 1608, 1595, 1615, 1620, 1640, 1652, 1635],
      "1M": [1600, 1608, 1595, 1615, 1620, 1640, 1652],
      "1Y": [1600, 1608, 1595, 1615, 1620, 1640, 1652, 1635],
    },

    Wood: {
      "1D": [
        805, 812, 810, 820, 830, 825, 815, 832, 835, 840, 850, 860, 870, 875,
        880, 890, 895, 900, 910, 920, 930, 940, 950, 960,
      ],
      "7D": [800, 805, 810, 812, 815, 820, 825, 828],
      "1M": [
        800, 820, 835, 850, 865, 880, 895, 910, 925, 940, 955, 970, 985, 1000,
      ],
      "1Y": [
        800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350,
      ],
    },
    Rice: {
      "1D": [
        805, 812, 810, 820, 830, 825, 815, 832, 835, 840, 850, 860, 870, 875,
        880, 890, 895, 900, 910, 920, 930, 940, 950, 960,
      ],
      "7D": [800, 805, 810, 812, 815, 820, 825, 828],
      "1M": [
        800, 820, 835, 850, 865, 880, 895, 910, 925, 940, 955, 970, 985, 1000,
      ],
      "1Y": [
        800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350,
      ],
    },
  };

  // State for selected commodity, search query, and list of commodities
  const [selected, setSelected] =
    useState<keyof typeof commodityData>("Cabbage");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<(keyof typeof commodityData)[]>([
    "Cabbage",
    "Wood",
    "Rice",
  ]);

  // Remove a commodity from the list; if the removed one was selected, update the selection.
  const removeItem = (itemToRemove: keyof typeof commodityData) => {
    setItems((prevItems) => prevItems.filter((item) => item !== itemToRemove));
    if (selected === itemToRemove) {
      setSelected(
        (prev) => items.filter((item) => item !== itemToRemove)[0] || ""
      );
    }
  };

  // Timeframe settings for x-axis units
  const timeframes: {
    [key: string]:
      | "millisecond"
      | "second"
      | "minute"
      | "hour"
      | "day"
      | "week"
      | "month"
      | "quarter"
      | "year";
  } = {
    "1D": "hour",
    "7D": "day",
    "1M": "day",
    "1Y": "month",
  };

  const [selectedTimeframe, setSelectedTimeframe] =
    useState<keyof typeof timeframes>("1Y");

  // Safely get labels and price data (empty array if no valid selection)
  const labels = fullLabels[selectedTimeframe as keyof typeof fullLabels];
  const priceData =
    selected && commodityData[selected]
      ? commodityData[selected][
          selectedTimeframe as keyof (typeof commodityData)[typeof selected]
        ]
      : [];

  // Ensure a valid dataset is selected based on the selected commodity and timeframe
  const selectedData =
    selected && commodityData[selected] && selectedTimeframe
      ? commodityData[selected][
          selectedTimeframe as keyof (typeof commodityData)[typeof selected]
        ]
      : [];

  // Ensure the selected data exists and filter out any `null` values (for 1D case)
  const validData = Array.isArray(selectedData)
    ? selectedData.filter((data): data is number => data !== null)
    : [];

  // Calculate statistics based on the filtered data
  const lowest = validData.length > 0 ? Math.min(...validData) : 0;
  const highest = validData.length > 0 ? Math.max(...validData) : 0;
  const current = validData.length > 0 ? validData[validData.length - 1] : 0;

  const getLineColor = (data: (number | null)[]) => {
    if (!data || data.length < 2) return "#86efac";

    const validData = data.filter((point): point is number => point !== null);
    if (validData.length < 2) return "#86efac";

    const lastValue = validData[validData.length - 1];
    const secondLastValue = validData[validData.length - 2];

    return lastValue < secondLastValue ? "#f87171" : "#86efac";
  };

  const lineColor = getLineColor(priceData);

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { display: false }, // Hide legend for a cleaner look
      title: { display: true, text: `${selected} Price Over Time` },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: selectedTimeframe === "1D" ? "hour" : "day", // Use "day" for 1Y
        },
        ticks: {
          callback: function (value, index, values) {
            const date = new Date(value as number);
            if (selectedTimeframe === "1D") {
              return date.getHours() % 2 === 0 ? date.getHours() + ":00" : ""; // Show only even hours
            }
            if (selectedTimeframe === "7D") {
              return date.getHours() === 0
                ? `${date.getDate()} ${date.toLocaleString("default", {
                    month: "short",
                  })}`
                : "";
            }
            if (selectedTimeframe === "1M") {
              return date.getDate() % 3 === 0
                ? `${date.getDate()} ${date.toLocaleString("default", {
                    month: "short",
                  })}` // Show "3 Mar", "6 Mar", etc.
                : "";
            }
            if (selectedTimeframe === "1Y") {
              return date.getDate() === 1 && date.getMonth() === 0
                ? `${date.getFullYear()}`
                : ""; // Show only "2023", "2024", etc.
            }
            return "";
          },
        },
        title: {
          display: true,
          text: selectedTimeframe === "1D" ? "Hour" : "Date",
        },
        grid: { display: false }, // Hide x-axis grid lines
      },
      y: {
        title: { display: true, text: "Price (USDT)" },
        beginAtZero: false,
        grid: { color: "rgba(200,200,200,0.3)" }, // Light grid lines
      },
    },
  };

  return (
    <PlatformLayout>
      <Head>
        <title>Commodity Price Tracker | Graminate</title>
      </Head>
      <main className="min-h-screen text-white px-4 sm:px-6 md:px-8 py-4">
        <div className="w-full min-h-screen">
          <header className="text-center md:text-left mb-4">
            <h1 className="text-3xl font-bold text-dark dark:text-light">
              Commodity Prices
            </h1>
            <hr className="mt-4 border-gray-600" />
          </header>

          <div className="flex justify-between items-center mx-auto w-full">
            <div className="text-sm text-dark dark:text-light flex flex-wrap items-center gap-3 my-2">
              <span>
                Lowest: <strong>{lowest}</strong>
              </span>
              <span>
                Highest: <strong>{highest}</strong>
              </span>
              <span>
                Current: <strong>{current}</strong>
              </span>
            </div>

            <div className="ml-auto w-64">
              <SearchBar
                value={searchQuery}
                placeholder="Search Commodity"
                mode="type"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-6 mb-2 pb-2">
            <div className="flex items-center space-x-6 mb-2 pb-2">
              {items.map((item) => (
                <div key={item} className="relative group">
                  <button
                    className={`text-lg ${
                      selected === item
                        ? "text-green-200 border-b-2 border-green-200"
                        : "text-gray-300 hover:text-green-200 hover:border-green-200 border-transparent"
                    }`}
                    onClick={() => setSelected(item)}
                  >
                    {item}
                  </button>

                  {/* Cross Button (Only visible on hover) */}
                  <button
                    onClick={() => removeItem(item)}
                    className="absolute -top-1 -right-3  opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Remove"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      className="size-3 text-red-200 font-bold"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            {Object.keys(timeframes).map((tf) => (
              <button
                key={tf}
                className={`px-3 py-1 rounded ${
                  selectedTimeframe === tf
                    ? "bg-green-200 hover:bg-green-100 text-white"
                    : "text-dark bg-light dark:bg-gray-600 dark:text-light dark:hover:bg-gray-700 hover:bg-blue-50 hover:text-green-200"
                }`}
                onClick={() =>
                  setSelectedTimeframe(tf as keyof typeof timeframes)
                }
              >
                {tf}
              </button>
            ))}
          </div>

          {items.length === 0 || !selected || !commodityData[selected] ? (
            <h1 className="text-center text-xl font-semibold text-gray-500 mt-6">
              Select a Commodity to track prices
            </h1>
          ) : (
            <div className=" rounded p-4">
              <Line
                data={{
                  labels,
                  datasets: [
                    {
                      label: `${selected} Price`,
                      data: priceData,
                      borderColor: lineColor,
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                    },
                  ],
                }}
                options={options}
              />
              {/* <div className="mt-8">
                <h2 className="text-lg font-semibold text-dark dark:text-light mb-4">
                  More Details
                </h2>
                <div className="overflow-x-auto bg-white dark:bg-dark ">
                  <table className="w-full text-sm text-left text-gray-600 dark:text-light border border-gray-400">
                    <thead className="bg-gray-500 dark:bg-gray-700 text-dark dark:text-light uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Entry Price</th>
                        <th className="px-4 py-3">Margin(USDT)</th>
                        <th className="px-4 py-3">PNL</th>
                        <th className="px-4 py-3">PNL %</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-400">
                        <td className="px-4 py-3 text-red-500">Short</td>
                        <td className="px-4 py-3">10.0</td>
                        <td className="px-4 py-3">2540</td>
                        <td className="px-4 py-3">1700.00</td>
                        <td className="px-4 py-3 text-red-500">-87</td>
                        <td className="px-4 py-3 text-red-500">-5.12%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-green-500">Long</td>
                        <td className="px-4 py-3">2.0</td>
                        <td className="px-4 py-3">2350</td>
                        <td className="px-4 py-3">900.00</td>
                        <td className="px-4 py-3 text-green-500">+45</td>
                        <td className="px-4 py-3 text-green-500">+5.26%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div> */}
            </div>
          )}
        </div>
      </main>
    </PlatformLayout>
  );
};

export default dynamic(() => Promise.resolve(PriceTracker), { ssr: false });
