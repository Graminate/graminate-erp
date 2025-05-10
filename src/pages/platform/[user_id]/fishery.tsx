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
import TaskAdder from "@/components/cards/TaskAdder";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type FisheryItem = {
  id: string | number;
  name: string;
};

const Fishery = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserIdString = Array.isArray(user_id) ? user_id[0] : user_id;
  const numericUserId = parsedUserIdString
    ? parseInt(parsedUserIdString, 10)
    : undefined;

  const [itemRecords, setItemRecords] = useState<FisheryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !numericUserId) return;

    const fetchFishery = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const response = await axiosInstance.get<{ items: FisheryItem[] }>(
          `/fishery/${numericUserId}`
        );
        setItemRecords(response.data.items || []);
      } catch (error: unknown) {
        let message = "An unknown error occurred while fetching fishery data.";
        setErrorMsg(message);
        setItemRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFishery();
  }, [router.isReady, numericUserId]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Fishery Management</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-lg font-semibold dark:text-white">
              Fishery Management
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        <div>
          {numericUserId && !isNaN(numericUserId) ? (
            <TaskAdder userId={numericUserId} projectType="Fishery" />
          ) : (
            !isLoading && (
              <p className="dark:text-gray-400">
                User ID not available or invalid for tasks.
              </p>
            )
          )}
        </div>
      </div>
    </PlatformLayout>
  );
};

export default Fishery;
