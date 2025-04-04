import React, { useState } from "react";
import Head from "next/head";
import PlatformLayout from "@/layout/PlatformLayout";
import SettingsBar from "@/components/layout/SettingsBar";

const AccountPage = () => {
  const [successMessage, setSuccessMessage] = useState("");

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
              <div>
                <div className="rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4 dark:text-light">
                    Account Settings
                  </h2>
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
