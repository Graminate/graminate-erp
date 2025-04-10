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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type View = "poultry_health";

const PoultryHealth = () => {
  const router = useRouter();
  const { user_id, view: queryView } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const view: View =
    typeof queryView === "string" ? (queryView as View) : "poultry_health";
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHealthRecords = async () => {
    if (!parsedUserId) return;
    try {
      const response = await axios.get(
        `http://localhost:3001/api/poultry_health/${encodeURIComponent(
          parsedUserId
        )}`
      );
      setHealthRecords(response.data.health || []);
    } catch (error: any) {
      console.error(
        "Error fetching poultry health data:",
        error.response?.data?.error || error.message
      );
    }
  };

  useEffect(() => {
    if (router.isReady && parsedUserId) {
      fetchHealthRecords();
    }
  }, [router.isReady, parsedUserId]);

  const tableData = useMemo(() => {
    if (view === "poultry_health" && healthRecords.length > 0) {
      return {
        columns: [
          "#",
          "Date",
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
  }, [healthRecords, view]);

  const goBack = () => {
    router.push(`/platform/${parsedUserId}/poultry`);
  };

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
            onClick={goBack}
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
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          paginationItems={PAGINATION_ITEMS}
          searchQuery={searchQuery}
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
          view={view}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          setSearchQuery={setSearchQuery}
          download={false}
        />
      </div>
    </PlatformLayout>
  );
};

export default PoultryHealth;
