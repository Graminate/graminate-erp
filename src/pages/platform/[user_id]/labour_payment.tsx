import { useEffect } from "react";
import { useRouter } from "next/router";

import PlatformLayout from "@/layout/PlatformLayout";

import Head from "next/head";

const LabourPayment = () => {
  const router = useRouter();
  const { user_id, view: queryView } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;

  useEffect(() => {
    if (!router.isReady || !parsedUserId) return;
  }, [router.isReady, parsedUserId]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Employee Database</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-lg font-semibold dark:text-white">
              Payment Details
            </h1>
          </div>
          <div className="flex gap-2"></div>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default LabourPayment;
