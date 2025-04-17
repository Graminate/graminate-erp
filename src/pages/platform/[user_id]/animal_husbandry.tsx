import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import Table from "@/components/tables/Table";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import axios from "axios";
import { PAGINATION_ITEMS } from "@/constants/options";

import { Bar, Pie } from "react-chartjs-2";
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
import InventoryForm from "@/components/form/InventoryForm";
import { API_BASE_URL } from "@/constants/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type View = "animal_husbandry";

const getBarColor = (quantity: number, max: number) => {
  const ratio = quantity / max;
  if (ratio < 0.25) return "#e53e3e";
  if (ratio < 0.5) return "orange";
  if (ratio < 0.75) return "#facd1d";
  return "#04ad79";
};

const AnimalHusbandry = () => {
  const router = useRouter();
  const { user_id, view: queryView } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const view: View =
    typeof queryView === "string" ? (queryView as View) : "animal_husbandry";

  const [itemRecords, setItemRecords] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!router.isReady || !parsedUserId) return;

    const fetchAnimalHusbandry = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/inventory/${parsedUserId}`
        );

        setItemRecords(response.data.items || []);
      } catch (error: any) {
        console.error(
          "Error fetching animal_husbandry data:",
          error.response?.data?.error || error.message
        );
      }
    };

    fetchAnimalHusbandry();
  }, [router.isReady, parsedUserId]);

  const tableData = useMemo(() => {
    if (view === "animal_husbandry" && itemRecords.length > 0) {
      return {
        columns: [
          // "#",
          "Item Name",
          "Item Group",
          "Units",
          "Quantity",
          "Price / Unit (₹)",
          "Status",
        ],
        rows: itemRecords.map((item) => [
          // item.animal_husbandry_id,
          item.item_name,
          item.item_group,
          item.units,
          item.quantity,
          item.price_per_unit,
          item.status,
        ]),
      };
    }
    return { columns: [], rows: [] };
  }, [itemRecords, view]);

  const maxQuantity = Math.max(...itemRecords.map((item) => item.quantity));
  const groups = Array.from(
    new Set(itemRecords.map((item) => item.item_group))
  );

  const generateColors = (count: number) =>
    Array.from(
      { length: count },
      (_, i) => `hsl(${(i * 360) / count}, 70%, 60%)`
    );

  const pieColors = generateColors(itemRecords.length);

  const chartData = {
    labels: groups,
    datasets: itemRecords.map((item) => ({
      label: item.item_name,
      data: groups.map((group) =>
        group === item.item_group ? item.quantity : null
      ),
      backgroundColor: getBarColor(item.quantity, maxQuantity),
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Item Quantities by Group",
      },
    },
    scales: {
      x: {
        stacked: false,
        barPercentage: 1.0,
        categoryPercentage: 1.0,
      },
      y: {
        stacked: false,
      },
    },
  };

  const totalAssetValue = itemRecords.reduce(
    (acc, item) => acc + Number(item.price_per_unit) * item.quantity,
    0
  );

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Animal Husbandry</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-lg font-semibold dark:text-white">
              Animal Husbandry
            </h1>
            <p className="text-xs text-dark dark:text-light">
              {itemRecords.length} Record(s)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              text="Add Item"
              style="primary"
              add
              onClick={() => setIsSidebarOpen(true)}
            />
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="mb-6  dark:bg-gray-800">
          <div className="flex flex-col lg:flex-row gap-6 justify-between">
            {/* Bar Chart (Left) */}
            <div className="flex-1">
              <Bar data={chartData} options={chartOptions} />
            </div>

            {/* Right Panel: Total Asset + Pie Chart */}
            <div className="flex flex-col">
              {/* Total Asset Card */}
              <div className="p-4 bg-gray-500 dark:bg-gray-800 rounded-xl shadow text-center">
                <p className="text-lg font-medium text-gray-700 dark:text-light">
                  Total Asset (₹)
                </p>
                <p className="text-3xl font-bold text-dark dark:text-light mt-2">
                  ₹{totalAssetValue.toFixed(2)}
                </p>
              </div>

              {/* Pie Chart */}
              <div className="p-4  dark:bg-gray-800 rounded-xl">
                <h2 className="text-sm font-semibold text-center text-dark dark:text-light  mb-2">
                  Animal Husbandry Share
                </h2>
                <div className="w-full max-w-[300px] mx-auto">
                  <Pie
                    data={{
                      labels: itemRecords.map((item) => item.item_name),
                      datasets: [
                        {
                          label: "Share by Quantity",
                          data: itemRecords.map((item) => item.quantity),
                          backgroundColor: pieColors,
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                          position: "bottom",
                          labels: {
                            color: "#666",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm dark:text-gray-300 text-gray-700">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-red-500 rounded-sm" />{" "}
              {"< 25%"} of Max
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-orange-400 rounded-sm" />{" "}
              {"< 50%"} of Max
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-yellow-200 rounded-sm" />{" "}
              {"< 75%"} of Max
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-green-200 rounded-sm" />{" "}
              {"≥ 75%"} of Max
            </div>
          </div>
        </div>

        <Table
          data={{ ...tableData, rows: tableData.rows }}
          filteredRows={tableData.rows}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          paginationItems={PAGINATION_ITEMS}
          searchQuery={searchQuery}
          totalRecordCount={tableData.rows.length}
          view={view}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          setSearchQuery={setSearchQuery}
        />

        {isSidebarOpen && (
          <InventoryForm
            view="poultry"
            onClose={() => setIsSidebarOpen(false)}
            onSubmit={(values: Record<string, string>) => {
              console.log("Form submitted:", values);
              setIsSidebarOpen(false);
            }}
            formTitle="Add Item"
          />
        )}
      </div>
    </PlatformLayout>
  );
};

export default AnimalHusbandry;
