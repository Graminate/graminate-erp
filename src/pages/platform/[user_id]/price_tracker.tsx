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
  const labels = [
    "2023-03-10",
    "2023-03-11",
    "2023-03-12",
    "2023-03-13",
    "2023-03-14",
    "2023-03-15",
  ];

  const priceData = [1600, 1640, 1655, 1648, 1672, 1692];
  const [selected, setSelected] = useState("Cabbage");
  const items = ["Cabbage", "Wood", "Rice"];
  const [searchQuery, setSearchQuery] = useState("");

  const data: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "ETH-USDT Price",
        data: priceData,
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#4F46E5",
        fill: true,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "ETH-USDT Price Over Time",
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price (USDT)",
        },
        beginAtZero: false,
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

          {/* Labels on top */}
          <div className="flex justify-between items-center mx-auto w-full">
            <div className="text-sm text-dark dark:text-light flex flex-wrap items-center gap-3 my-2">
              <span>
                Mark: <strong>1648.35</strong>
              </span>
              <span>
                Index: <strong>1648.30</strong>
              </span>
              <span>
                Funding: <strong>0.0044%</strong>
              </span>
            </div>

            {/* Search Bar */}
            <div className="ml-auto w-64">
              {/* Adjust width as needed */}
              <SearchBar
                value={searchQuery}
                placeholder="Search"
                mode="type"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Commodities  */}
          <div className="flex items-center space-x-6 mb-2 pb-2">
            {items.map((item) => (
              <button
                key={item}
                className={` text-lg ${
                  selected === item
                    ? "text-green-200 border-b-2 border-green-200"
                    : "text-gray-300 hover:text-green-200 hover:border-green-200 border-transparent"
                }`}
                onClick={() => setSelected(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4 mb-4">
            {["1D", "7D", "1M", "3M", "6M", "1Y", "ALL"].map((tf) => (
              <button
                key={tf}
                className="px-3 py-1 text-gray-600 bg-white rounded hover:bg-blue-50 hover:text-green-200"
              >
                {tf}
              </button>
            ))}
          </div>
          <div className="bg-white rounded p-4">
            <Line data={data} options={options} />
          </div>
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-dark dark:text-light mb-4">
              Open, Pending, Canceled
            </h2>
            <div className="overflow-x-auto bg-white dark:bg-dark ">
              <table className="w-full text-sm text-left text-gray-600 border border-gray-400">
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
          </div>
        </div>
      </main>
    </PlatformLayout>
  );
};

export default PriceTracker;
