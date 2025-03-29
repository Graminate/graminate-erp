import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import DataForm from "@/components/form/DataForm";
import Table from "@/components/tables/Table";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import axios from "axios";
import { PAGINATION_ITEMS } from "@/constants/options";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type View = "inventory";

const getBarColor = (quantity: number, max: number) => {
  const ratio = quantity / max;
  if (ratio < 0.25) return "red";
  if (ratio < 0.5) return "orange";
  if (ratio < 0.75) return "yellow";
  return "green";
};

const Inventory = () => {
  const router = useRouter();
  const { user_id, view: queryView } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const view: View =
    typeof queryView === "string" ? (queryView as View) : "inventory";

  const [itemRecords, setItemRecords] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!router.isReady || !parsedUserId) return;

    const fetchInventory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/inventory/${parsedUserId}`
        );

        console.log("Fetched Inventory Data:", response.data);
        setItemRecords(response.data.items || []);
      } catch (error: any) {
        console.error(
          "Error fetching inventory data:",
          error.response?.data?.error || error.message
        );
      }
    };

    fetchInventory();
  }, [router.isReady, parsedUserId]);

  const tableData = useMemo(() => {
    if (view === "inventory" && itemRecords.length > 0) {
      return {
        columns: [
          "ID",
          "Item Name",
          "Item Group",
          "Units",
          "Quantity",
          "Status",
        ],
        rows: itemRecords.map((item) => [
          item.inventory_id,
          item.item_name,
          item.item_group,
          item.units,
          item.quantity,
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

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Inventory Management</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-lg font-semibold dark:text-white">
              Inventory Management
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
        <div className="mb-6 bg-white dark:bg-gray-900 p-4 rounded-md shadow">
          <Bar data={chartData} options={chartOptions} />
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm dark:text-gray-300 text-gray-700">
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

        {/* Table displaying the inventory data */}
        <Table
          data={{ ...tableData, rows: tableData.rows }}
          filteredRows={tableData.rows}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          paginationItems={PAGINATION_ITEMS}
          searchQuery={searchQuery}
          totalRecordCount={tableData.rows.length}
          onRowClick={(row) => {
            const itemId = row[0];
            const item = itemRecords.find(
              (item) => item.inventory_id === itemId
            );
            if (item) {
              router.push({
                pathname: `/platform/${parsedUserId}/inventory/${itemId}`,
                query: { data: JSON.stringify(item) },
              });
            }
          }}
          view={view}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          setSearchQuery={setSearchQuery}
        />

        {isSidebarOpen && (
          <DataForm
            view={view}
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

export default Inventory;
