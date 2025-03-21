import React, { useState } from "react";
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
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import router from "next/router";

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
  midnight.setHours(0, 0, 0, 0);

  const fullLabels = {
    "1D": Array.from({ length: 24 }, (_, i) => {
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      return new Date(midnight.getTime() + i * 60 * 60 * 1000).getTime();
    }),
    "7D": Array.from({ length: 8 * 7 + 1 }, (_, i) => {
      const dayOffset = Math.floor(i / 8);
      const hourOffset = (i % 8) * 3;

      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - 6 + dayOffset);
      timestamp.setHours(hourOffset, 0, 0, 0);

      return timestamp.getTime();
    }),
    "1M": Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }),
    "1Y": Array.from({ length: 365 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (364 - i));
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }),
  };

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

  const [selected, setSelected] =
    useState<keyof typeof commodityData>("Cabbage");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<(keyof typeof commodityData)[]>([
    "Cabbage",
    "Wood",
    "Rice",
  ]);

  const removeItem = (itemToRemove: keyof typeof commodityData) => {
    setItems((prevItems) => prevItems.filter((item) => item !== itemToRemove));
    if (selected === itemToRemove) {
      setSelected(
        (prev) => items.filter((item) => item !== itemToRemove)[0] || ""
      );
    }
  };

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
    useState<keyof typeof timeframes>("1D");
  const labels = fullLabels[selectedTimeframe as keyof typeof fullLabels];
  const priceData =
    selected && commodityData[selected]
      ? commodityData[selected][
          selectedTimeframe as keyof (typeof commodityData)[typeof selected]
        ]
      : [];

  const selectedData =
    selected && commodityData[selected] && selectedTimeframe
      ? commodityData[selected][
          selectedTimeframe as keyof (typeof commodityData)[typeof selected]
        ]
      : [];

  const validData = Array.isArray(selectedData)
    ? selectedData.filter((data): data is number => data !== null)
    : [];

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
      legend: { display: false },
      title: { display: true, text: `${selected} Price Over Time` },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: selectedTimeframe === "1D" ? "hour" : "day",
        },
        ticks: {
          callback: function (value, index, values) {
            const date = new Date(value as number);
            if (selectedTimeframe === "1D") {
              return date.getHours() % 2 === 0 ? date.getHours() + ":00" : "";
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
                  })}`
                : "";
            }
            if (selectedTimeframe === "1Y") {
              return date.getDate() === 1 && date.getMonth() === 0
                ? `${date.getFullYear()}`
                : "";
            }
            return "";
          },
        },
        title: {
          display: true,
          text: selectedTimeframe === "1D" ? "Hour" : "Date",
        },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Price (₹)" },
        beginAtZero: false,
        grid: { color: "rgba(200,200,200,0.3)" },
      },
    },
  };

  const goBack = () => {
    router.back();
  };

  return (
    <PlatformLayout>
      <Head>
        <title>Commodity Price Tracker | Graminate</title>
      </Head>

      <main className="min-h-screen text-white px-4 sm:px-6 md:px-8 py-4">
        <div className="w-full min-h-screen">
          <header className="flex text-center md:text-left mb-4 -ml-8">
            <div className="flex items-center gap-2">
              <Button text="" style="ghost" arrow="left" onClick={goBack} />
              <h1 className="text-2xl font-bold text-dark dark:text-light">
                Commodity Prices
              </h1>
            </div>
          </header>
          <hr className="mb-6 border-gray-300" />

          <div className="flex justify-between items-center mx-auto w-full">
            <div className="text-sm text-dark dark:text-light flex flex-wrap items-center gap-3 my-2">
              <span>
                Lowest: <strong>₹{lowest}</strong>
              </span>
              <span>
                Highest: <strong>₹{highest}</strong>
              </span>
              <span>
                Current: <strong>₹{current}</strong>
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
            <h1 className="text-center text-xl font-semibold text-dark dark:text-light mt-6">
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
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-dark dark:text-light mb-4">
                  More Details
                </h2>
                <div className="overflow-x-auto bg-white dark:bg-dark ">
                  <table className="w-full text-sm text-left text-gray-600 dark:text-light border border-gray-400">
                    <thead className="bg-gray-500 dark:bg-gray-700 text-dark dark:text-light uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Entry Price (₹)</th>
                        <th className="px-4 py-3">Margin (₹)</th>
                        <th className="px-4 py-3">PNL (₹)</th>
                        <th className="px-4 py-3">PNL %</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-400">
                        <td className="px-4 py-3 text-red-500">Short</td>
                        <td className="px-4 py-3">10.0</td>
                        <td className="px-4 py-3">₹2540</td>{" "}
                        {/* Add ₹ symbol */}
                        <td className="px-4 py-3">₹1700.00</td>
                        <td className="px-4 py-3 text-red-500">₹-87</td>
                        <td className="px-4 py-3 text-red-500">-5.12%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-green-500">Long</td>
                        <td className="px-4 py-3">2.0</td>
                        <td className="px-4 py-3">₹2350</td>
                        <td className="px-4 py-3">₹900.00</td>
                        <td className="px-4 py-3 text-green-500">₹+45</td>
                        <td className="px-4 py-3 text-green-500">+5.26%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </PlatformLayout>
  );
};

export default PriceTracker;
