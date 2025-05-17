import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import Table from "@/components/tables/Table";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
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
import WarehouseForm from "@/components/form/WarehouseForm";
import axiosInstance from "@/lib/utils/axiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWarehouse,
  faMapMarkerAlt,
  faUserTie,
  faPhone,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type ItemRecord = {
  inventory_id: number;
  user_id: number;
  item_name: string;
  item_group: string;
  units: string;
  quantity: number;
  created_at: string;
  price_per_unit: number;
  warehouse_id: number | null;
  status?: string;
};

type WarehouseDetails = {
  warehouse_id: number;
  user_id?: number;
  name: string;
  type: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  contact_person: string | null;
  phone: string | null;
  storage_capacity: number | string | null;
};

const generateColors = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => `hsl(${(i * 360) / count}, 70%, 60%)`
  );

const WarehouseInventoryPage = () => {
  const router = useRouter();
  const {
    user_id: queryUserId,
    warehouse_id: queryWarehouseId,
    warehouseName: queryWarehouseName,
  } = router.query;

  const parsedUserId = Array.isArray(queryUserId)
    ? queryUserId[0]
    : queryUserId;
  const parsedWarehouseId = Array.isArray(queryWarehouseId)
    ? queryWarehouseId[0]
    : queryWarehouseId;
  const warehouseNameFromQuery = queryWarehouseName
    ? decodeURIComponent(
        Array.isArray(queryWarehouseName)
          ? queryWarehouseName[0]
          : queryWarehouseName
      )
    : "Warehouse";

  const [inventoryForWarehouse, setInventoryForWarehouse] = useState<
    ItemRecord[]
  >([]);
  const [currentWarehouseDetails, setCurrentWarehouseDetails] =
    useState<WarehouseDetails | null>(null);
  const [isInventoryFormOpen, setIsInventoryFormOpen] = useState(false);
  const [isWarehouseFormOpen, setIsWarehouseFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingWarehouseDetails, setLoadingWarehouseDetails] = useState(true);

  const [chartThemeColors, setChartThemeColors] = useState({
    textColor: "#333",
    gridColor: "#DDD",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setChartThemeColors({
        textColor: isDarkMode ? "#CCC" : "#333",
        gridColor: isDarkMode ? "#444" : "#DDD",
      });
    }
  }, []);

  useEffect(() => {
    if (!router.isReady || !parsedUserId || !parsedWarehouseId) {
      if (router.isReady && parsedUserId && !parsedWarehouseId) {
        setInventoryForWarehouse([]);
        setLoadingInventory(false);
        setCurrentWarehouseDetails(null);
        setLoadingWarehouseDetails(false);
      }
      return;
    }

    const fetchWarehouseData = async () => {
      setLoadingInventory(true);
      setLoadingWarehouseDetails(true);
      try {
        const [inventoryResponse, warehouseDetailsResponse] = await Promise.all(
          [
            axiosInstance.get(`/inventory/${parsedUserId}`, {
              params: { warehouse_id: parsedWarehouseId },
            }),
            axiosInstance.get(`/warehouse/user/${parsedUserId}`),
          ]
        );

        setInventoryForWarehouse(inventoryResponse.data.items || []);

        const warehouses = warehouseDetailsResponse.data.warehouses || [];
        const foundWarehouse = warehouses.find(
          (wh: WarehouseDetails) =>
            wh.warehouse_id === parseInt(parsedWarehouseId as string, 10)
        );
        setCurrentWarehouseDetails(foundWarehouse || null);
      } catch (error) {
        console.error("Error fetching warehouse-specific data:", error);
        setInventoryForWarehouse([]);
        setCurrentWarehouseDetails(null);
      } finally {
        setLoadingInventory(false);
        setLoadingWarehouseDetails(false);
      }
    };

    fetchWarehouseData();
  }, [router.isReady, parsedUserId, parsedWarehouseId]);

  const searchedInventory = useMemo(() => {
    if (!searchQuery) {
      return inventoryForWarehouse;
    }
    return inventoryForWarehouse.filter(
      (item) =>
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item_group.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventoryForWarehouse, searchQuery]);

  const tableData = useMemo(() => {
    return {
      columns: [
        "#",
        "Commodity",
        "Category",
        "Units",
        "Quantity",
        "Price / Unit (₹)",
        "Status",
      ],
      rows: searchedInventory.map((item) => [
        item.inventory_id,
        item.item_name,
        item.item_group,
        item.units,
        item.quantity,
        item.price_per_unit,
        item.status || "",
      ]),
    };
  }, [searchedInventory]);

  const groups = Array.from(
    new Set(inventoryForWarehouse.map((item) => item.item_group))
  );
  const pieColors = generateColors(inventoryForWarehouse.length);

  const chartData = useMemo(
    () => ({
      labels: groups,
      datasets: inventoryForWarehouse.map((item) => ({
        label: item.item_name,
        data: groups.map((group) =>
          group === item.item_group ? item.quantity : null
        ),
        backgroundColor: "#04ad79", // Consistent green color for all bars
      })),
    }),
    [groups, inventoryForWarehouse]
  );

  const dynamicWarehouseName =
    currentWarehouseDetails?.name || warehouseNameFromQuery;

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Item Quantities in ${dynamicWarehouseName} by Category`,
          color: chartThemeColors.textColor,
        },
      },
      scales: {
        x: {
          stacked: false,
          barPercentage: 1.0,
          categoryPercentage: 1.0,
          ticks: { color: chartThemeColors.textColor },
          grid: { color: chartThemeColors.gridColor },
        },
        y: {
          stacked: false,
          ticks: { color: chartThemeColors.textColor },
          grid: { color: chartThemeColors.gridColor },
        },
      },
    }),
    [dynamicWarehouseName, chartThemeColors]
  );

  const totalAssetValue = inventoryForWarehouse.reduce(
    (acc, item) =>
      acc + Number(item.price_per_unit || 0) * (item.quantity || 0),
    0
  );

  const cumulativeAddress = useMemo(() => {
    if (!currentWarehouseDetails) return "";
    return [
      currentWarehouseDetails.address_line_1,
      currentWarehouseDetails.address_line_2,
      currentWarehouseDetails.city,
      currentWarehouseDetails.state,
      currentWarehouseDetails.postal_code,
      currentWarehouseDetails.country,
    ]
      .filter(Boolean)
      .join(", ");
  }, [currentWarehouseDetails]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | {dynamicWarehouseName} - Inventory</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Inventory for{" "}
                <span className="text-primary">{dynamicWarehouseName}</span>
              </h1>
              <p className="text-sm text-gray-300 mt-1">
                {loadingInventory
                  ? "Loading items..."
                  : `${searchedInventory.length} Item(s) in this Warehouse ${
                      searchQuery ? "(filtered)" : ""
                    }`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {parsedWarehouseId && currentWarehouseDetails && (
                <Button
                  text="Edit Warehouse"
                  style="secondary"
                  onClick={() => setIsWarehouseFormOpen(true)}
                  isDisabled={loadingWarehouseDetails}
                />
              )}
              <Button
                text="All Warehouses"
                style="secondary"
                onClick={() => router.push(`/platform/${parsedUserId}/storage`)}
              />
              <Button
                text="Add Item"
                style="primary"
                add
                onClick={() => setIsInventoryFormOpen(true)}
                isDisabled={!parsedWarehouseId}
              />
            </div>
          </div>

          {!loadingWarehouseDetails && currentWarehouseDetails && (
            <div className="mt-4 pt-4 border-t border-gray-400 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faWarehouse}
                    className="mr-3 w-4 h-4 text-blue-200"
                  />
                  <div>
                    <span className="font-semibold block">Type</span>
                    {currentWarehouseDetails.type}
                  </div>
                </div>
                {currentWarehouseDetails.storage_capacity != null && (
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faBoxOpen}
                      className="mr-3 w-4 h-4 text-blue-200"
                    />
                    <div>
                      <span className="font-semibold block">Capacity</span>
                      {currentWarehouseDetails.storage_capacity}
                    </div>
                  </div>
                )}
                {currentWarehouseDetails.contact_person && (
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faUserTie}
                      className="mr-3 w-4 h-4 text-blue-200"
                    />
                    <div>
                      <span className="font-semibold block">
                        Contact Person
                      </span>
                      {currentWarehouseDetails.contact_person}
                    </div>
                  </div>
                )}
                {currentWarehouseDetails.phone && (
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="mr-3 w-4 h-4 text-blue-200"
                    />
                    <div>
                      <span className="font-semibold block">Phone</span>
                      {currentWarehouseDetails.phone}
                    </div>
                  </div>
                )}
                {cumulativeAddress && (
                  <div className="flex items-center md:col-span-2 lg:col-span-1">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="mr-3 w-4 h-4 text-blue-200"
                    />
                    <div>
                      <span className="font-semibold block">Address</span>
                      {cumulativeAddress}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {inventoryForWarehouse.length > 0 && !loadingInventory && (
          <div className="mb-6 dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex flex-col lg:flex-row gap-6 justify-between">
              <div className="flex-1">
                <Bar data={chartData} options={chartOptions} />
              </div>
              <div className="flex flex-col gap-4 lg:w-1/3">
                <div className="p-4 bg-gray-500 dark:bg-gray-700 rounded-xl shadow text-center">
                  <p className="text-lg font-medium text-gray-700 dark:text-light">
                    Total Asset Value
                  </p>
                  <p className="text-3xl font-bold text-dark dark:text-light mt-2">
                    ₹{totalAssetValue.toFixed(2)}
                  </p>
                </div>
                <div className="p-4">
                  <h2 className="text-sm font-semibold text-center text-dark dark:text-light mb-2">
                    Inventory Share by Quantity
                  </h2>
                  <div className="w-full max-w-[250px] mx-auto">
                    <Pie
                      data={{
                        labels: inventoryForWarehouse.map(
                          (item) => item.item_name
                        ),
                        datasets: [
                          {
                            label: "Share by Quantity",
                            data: inventoryForWarehouse.map(
                              (item) => item.quantity
                            ),
                            backgroundColor: pieColors,
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Table
          data={tableData}
          filteredRows={tableData.rows}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          paginationItems={PAGINATION_ITEMS}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalRecordCount={searchedInventory.length}
          view="inventory"
          loading={loadingInventory}
          reset={false}
          hideChecks={false}
          download={true}
        />

        {isInventoryFormOpen && parsedWarehouseId && (
          <InventoryForm
            onClose={() => setIsInventoryFormOpen(false)}
            formTitle={`Add Item to ${dynamicWarehouseName}`}
            warehouseId={parseInt(parsedWarehouseId, 10)}
          />
        )}
        {isWarehouseFormOpen &&
          parsedWarehouseId &&
          currentWarehouseDetails && (
            <WarehouseForm
              onClose={() => setIsWarehouseFormOpen(false)}
              formTitle={`Edit ${currentWarehouseDetails.name}`}
              warehouseId={parseInt(parsedWarehouseId, 10)}
              initialData={{
                name: currentWarehouseDetails.name,
                type: currentWarehouseDetails.type,
                address_line_1: currentWarehouseDetails.address_line_1 || "",
                address_line_2: currentWarehouseDetails.address_line_2 || "",
                city: currentWarehouseDetails.city || "",
                state: currentWarehouseDetails.state || "",
                postal_code: currentWarehouseDetails.postal_code || "",
                country: currentWarehouseDetails.country || "",
                contact_person: currentWarehouseDetails.contact_person || "",
                phone: currentWarehouseDetails.phone || "",
                storage_capacity:
                  currentWarehouseDetails.storage_capacity?.toString() || "",
              }}
            />
          )}
      </div>
    </PlatformLayout>
  );
};

export default WarehouseInventoryPage;
