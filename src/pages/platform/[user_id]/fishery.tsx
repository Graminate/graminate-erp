import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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

type View = "fishery";

const Fishery = () => {
  const router = useRouter();
  const { user_id, view: queryView } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const view: View =
    typeof queryView === "string" ? (queryView as View) : "fishery";

  const [itemRecords, setItemRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!router.isReady || !parsedUserId) return;

    const fetchFishery = async () => {
      try {
        const response = await axiosInstance.get(`/fishery/${parsedUserId}`);

        setItemRecords(response.data.items || []);
      } catch (error: any) {
        console.error(
          "Error fetching fishery data:",
          error.response?.data?.error || error.message
        );
      }
    };

    fetchFishery();
  }, [router.isReady, parsedUserId]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Fishery Management</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-lg font-semibold dark:text-white">
              Fishery Management
            </h1>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default Fishery;
