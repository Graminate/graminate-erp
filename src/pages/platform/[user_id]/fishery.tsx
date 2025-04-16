import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import axios from "axios";

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

type View = "fishery";

const Fishery = () => {
  const router = useRouter();
  const { user_id, view: queryView } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const view: View =
    typeof queryView === "string" ? (queryView as View) : "fishery";

  const [itemRecords, setItemRecords] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);

  const dismissAlert = (id: number) => {
    setActiveAlerts((current) => current.filter((alert) => alert.id !== id));
  };

  const getAlertStyle = (type: string): string => {
    switch (type) {
      case "Critical":
        return "bg-red-300 border-red-500 text-red-100 dark:bg-red-300 dark:border-red-600 dark:text-red-800";
      case "Warning":
        return "bg-yellow-200 border-yellow-500 text-yellow-700 dark:bg-yellow-200 dark:border-yellow-600 dark:text-yellow-800";
      case "Info":
        return "bg-blue-300 border-blue-500 text-blue-100 dark:bg-blue-300 dark:border-blue-600 dark:text-blue-800";
      default:
        return "bg-gray-300 border-gray-500 text-gray-700 dark:bg-gray-200 dark:border-gray-600 dark:text-gray-800";
    }
  };

  useEffect(() => {
    if (!router.isReady || !parsedUserId) return;

    const fetchFishery = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/fishery/${parsedUserId}`
        );

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
        <title>Graminate | Fishery Dashboard</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4 space-y-6">
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border-l-4 p-3 rounded-md flex justify-between items-center ${getAlertStyle(
                  alert.type
                )}`}
                role="alert"
              >
                <div>
                  <p className="font-bold">{alert.type}</p>
                  <p className="text-sm">{alert.message}</p>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-xl font-semibold hover:opacity-75"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <h1 className="text-lg font-semibold dark:text-white">
            Fishery Management
          </h1>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default Fishery;
