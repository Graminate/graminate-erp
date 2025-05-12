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

const AnimalHusbandry = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserIdString = Array.isArray(user_id) ? user_id[0] : user_id;
  const numericUserId = parsedUserIdString
    ? parseInt(parsedUserIdString, 10)
    : undefined;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !numericUserId) return;

    const fetcAnimalHusbandry = async () => {
      setIsLoading(true);
      try {
        await axiosInstance.get(`/animal_husbandry/${numericUserId}`);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "An unknown error occurred while fetching animal husbandry data.";
        console.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetcAnimalHusbandry();
  }, [router.isReady, numericUserId]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Animal Management</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-lg font-semibold dark:text-white">
              Animal Management
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        <div>
          {numericUserId && !isNaN(numericUserId) ? (
            <TaskAdder userId={numericUserId} projectType="Husbandry" />
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

export default AnimalHusbandry;
