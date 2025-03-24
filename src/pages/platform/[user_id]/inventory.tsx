import React from "react";

import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import Button from "@/components/ui/Button";
import router from "next/router";

const Inventory = () => {
  const goBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Inventory | Graminate </title>
      </Head>
      <PlatformLayout>
        <main className="min-h-screen text-white px-4 sm:px-6 md:px-8 py-4">
          <header className="flex text-center md:text-left mb-4 -ml-8">
            <div className="flex items-center gap-2">
              <Button text="" style="ghost" arrow="left" onClick={goBack} />
              <h1 className="text-2xl font-bold text-dark dark:text-light">
                Inventory
              </h1>
            </div>
          </header>
          <hr className="mt-4 border-gray-300" />
        </main>
      </PlatformLayout>
    </>
  );
};

export default Inventory;
