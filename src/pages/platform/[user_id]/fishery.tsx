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

interface FisheryItem {
  id: string | number;
  name: string;
}

const Fishery = () => {
  const router = useRouter();

  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;

  const [itemRecords, setItemRecords] = useState<FisheryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !parsedUserId) return;

    const fetchFishery = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const response = await axiosInstance.get<{ items: FisheryItem[] }>(
          `/fishery/${parsedUserId}`
        );
        setItemRecords(response.data.items || []);
      } catch (error: unknown) {
        let message = "An unknown error occurred while fetching fishery data.";

        if (axios.isAxiosError(error)) {
          message =
            error.response?.data?.error ||
            error.message ||
            "Failed to fetch fishery data.";
        } else if (error instanceof Error) {
          message = error.message;
        }
        console.error("Error fetching fishery data:", message, error);
        setErrorMsg(message);
        setItemRecords([]);
      } finally {
        setIsLoading(false);
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
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-lg font-semibold dark:text-white">
              Fishery Management{" "}
              {parsedUserId ? `for User ${parsedUserId}` : ""}
            </h1>
          </div>
        </div>

        <div>
          {isLoading && <p>Loading fishery data...</p>}
          {errorMsg && <p className="text-red-500">Error: {errorMsg}</p>}
          {!isLoading && !errorMsg && (
            <>
              <h2 className="text-md font-medium mb-2 dark:text-white">
                Items
              </h2>
              {itemRecords.length > 0 ? (
                <ul className="list-disc pl-5 dark:text-gray-300">
                  {itemRecords.map((item) => (
                    <li key={item.id}>{item.name} </li>
                  ))}
                </ul>
              ) : (
                <p className="dark:text-gray-400">
                  No fishery items found for this user.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </PlatformLayout>
  );
};

export default Fishery;
