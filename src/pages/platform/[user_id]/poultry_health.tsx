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
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Table from "@/components/tables/Table";
import { PAGINATION_ITEMS } from "@/constants/options";
import Button from "@/components/ui/Button";
import axiosInstance from "@/lib/utils/axiosInstance";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface HealthRecord {
  poultry_health_id: string;
  date: string;
  veterinary_name: string;
  bird_type: string;
  purpose: string;
  vaccines: string[];
  mortality_rate?: number;
}

const PoultryHealth = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);

  const fetchHealthRecords = useCallback(async () => {
    if (!parsedUserId) return;
    try {
      const response = await axiosInstance.get(
        `/poultry_health/${encodeURIComponent(parsedUserId)}`
      );
      setHealthRecords(response.data.health || []);
    } catch (error: unknown) {
      console.error(
        "Error fetching poultry health data:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }, [parsedUserId]);

  useEffect(() => {
    if (router.isReady && parsedUserId) {
      fetchHealthRecords();
    }
  }, [router.isReady, parsedUserId, fetchHealthRecords]);

  const tableData = useMemo(() => {
    if (healthRecords.length > 0) {
      return {
        columns: [
          "#",
          "Appointment",
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
          item.vaccines.join(", "),
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
