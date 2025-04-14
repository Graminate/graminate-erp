import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
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
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Table from "@/components/tables/Table";
import { PAGINATION_ITEMS } from "@/constants/options";
import Button from "@/components/ui/Button";
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

const PoultryHealth = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [mortalityRate24h, setMortalityRate24h] = useState<number | null>(null);
  const [vaccineStatus, setVaccineStatus] = useState("Pending");
  const [nextVisit, setNextVisit] = useState("N/A");

  useEffect(() => {
    if (!healthRecords || healthRecords.length === 0) {
      setMortalityRate24h(null);
      return;
    }
    const sortedByDate = [...healthRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    // Set vaccine status based on the latest record’s vaccines
    const latestVaccines = sortedByDate[0]?.vaccines || [];
    setVaccineStatus(
      Array.isArray(latestVaccines) && latestVaccines.length > 0
        ? "Vaccinated"
        : "Pending"
    );
    // Next Visit: choose the next future date
    const futureDates = healthRecords
      .map((item) => new Date(item.date))
      .filter((d) => d > new Date())
      .sort((a, b) => a.getTime() - b.getTime());
    setNextVisit(futureDates[0] ? futureDates[0].toLocaleDateString() : "N/A");

    // Mortality Rate: average from the last 3 records
    const recentRecords = sortedByDate.slice(0, 3);
    const mortalitySum = recentRecords.reduce(
      (sum: number, record: any) => sum + (record.mortality_rate || 0),
      0
    );
    const averageMortality =
      recentRecords.length > 0 ? mortalitySum / recentRecords.length : null;
    setMortalityRate24h(averageMortality);
  }, [healthRecords]);

  useEffect(() => {
    if (router.isReady && parsedUserId) {
      fetchHealthRecords();
    }
  }, [router.isReady, parsedUserId]);

  const fetchHealthRecords = async () => {
    if (!parsedUserId) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/poultry_health/${encodeURIComponent(parsedUserId)}`
      );
      setHealthRecords(response.data.health || []);
    } catch (error: any) {
      console.error(
        "Error fetching poultry health data:",
        error.response?.data?.error || error.message
      );
    }
  };

  const tableData = useMemo(() => {
    if (healthRecords.length > 0) {
      return {
        columns: [
          "#",
          "Next Appointment",
          "Veterinary Name",
          "Bird Type",
          "Purpose",
          "Vaccines",
        ],
        rows: healthRecords.map((item) => [
          item.poultry_health_id,
          new Date(item.date).toLocaleDateString(),
          item.veterinary_name,
          item.bird_type,
          item.purpose,
          Array.isArray(item.vaccines)
            ? item.vaccines.join(", ")
            : item.vaccines,
        ]),
      };
    }
    return { columns: [], rows: [] };
  }, [healthRecords]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Poultry Dashboard</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4 space-y-6">
        <div className="flex gap-1 items-center dark:bg-dark relative mb-4">
          <Button
            text=""
            arrow="left"
            style="ghost"
            onClick={() => router.push(`/platform/${parsedUserId}/poultry`)}
            aria-label="Go back"
          />
          <div>
            <h1 className="text-lg font-semibold dark:text-white">
              Poultry Health Records
            </h1>
            <p className="text-xs text-dark dark:text-light">
              {healthRecords.length} Record(s)
            </p>
          </div>
        </div>
        <Table
          data={tableData}
          filteredRows={tableData.rows}
          currentPage={1}
          itemsPerPage={25}
          paginationItems={PAGINATION_ITEMS}
          searchQuery={""}
          totalRecordCount={tableData.rows.length}
          onRowClick={(row) => {
            const healthId = row[0];
            const healthReport = healthRecords.find(
              (item) => item.poultry_health_id === healthId
            );
            if (healthReport) {
              router.push({
                pathname: `/platform/${parsedUserId}/poultry_health/${healthId}`,
                query: { data: JSON.stringify(healthReport) },
              });
            }
          }}
          view={"poultry_health"}
          setCurrentPage={() => {}}
          setItemsPerPage={() => {}}
          setSearchQuery={() => {}}
          download={false}
        />
      </div>
    </PlatformLayout>
  );
};

export default PoultryHealth;
