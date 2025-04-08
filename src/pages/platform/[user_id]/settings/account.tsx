import React, { useState } from "react";
import Head from "next/head";
import PlatformLayout from "@/layout/PlatformLayout";
import SettingsBar from "@/components/layout/SettingsBar";
import { useRouter } from "next/router";
import axios from "axios";

const AccountPage = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const { user_id } = router.query;

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed || !user_id) return;

    try {
      const response = await axios.delete(
        `http://localhost:3001/api/user/delete/${user_id}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        router.push("/");
      }
    } catch (err: any) {
      console.error("Failed to delete account", err);
      setSuccessMessage("Something went wrong. Could not delete account.");
    }
  };

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <PlatformLayout>
        <div className="flex min-h-screen">
          <SettingsBar />

          <main className="flex-1 px-12">
            <section className="py-6">
              <div className="pb-4 font-bold text-lg text-dark dark:text-light">
                Account Settings
              </div>
              <div>
                <div className="rounded-lg py-4">
                  <h2 className="text-lg font-semibold mb-4 dark:text-light">
                    Danger Zone
                  </h2>
                </div>

                <div className="rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-dark dark:text-light">
                        Delete Account
                      </p>
                      <p className="text-sm text-dark dark:text-light">
                        Once you delete your account, you will loose all access
                        and data. Please be certain
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="p-2 text-sm shadow-sm text-red-200 border rounded-lg hover:bg-red-100 hover:text-white transition"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>

                {successMessage && (
                  <p className="text-green-500 mt-2">{successMessage}</p>
                )}
              </div>
            </section>
          </main>
        </div>
      </PlatformLayout>
    </>
  );
};

export default AccountPage;
