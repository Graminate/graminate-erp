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
import InventoryForm from "@/components/form/InventoryForm";
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

type View = "animal_husbandry";

const AnimalHusbandry = () => {
  const router = useRouter();
  const { user_id, view: queryView } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const view: View =
    typeof queryView === "string" ? (queryView as View) : "animal_husbandry";

  const [itemRecords, setItemRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!router.isReady || !parsedUserId) return;

    const fetchAnimalHusbandry = async () => {
      try {
        const response = await axiosInstance.get(
          `/animal_husbandry/${parsedUserId}`
        );

        setItemRecords(response.data.items || []);
      } catch (error: any) {
        console.error(
          "Error fetching animal_husbandry data:",
          error.response?.data?.error || error.message
        );
      }
    };

    fetchAnimalHusbandry();
  }, [router.isReady, parsedUserId]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Animal Husbandry</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-lg font-semibold dark:text-white">
              Animal Husbandry
            </h1>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default AnimalHusbandry;
