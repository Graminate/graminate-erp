"use client";
import ProgressCard from "@/components/cards/ProgressCard";
import StatusCard from "@/components/cards/StatusCard";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import React, { useState, useEffect } from "react";

const BudgetPage = () => {
  const steps = [
    "Procurement",
    "Preparation",
    "Farming",
    "Recurring Cost",
    "Harvest",
  ];
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleStepChange = (data: { step: number }) => {
    setCurrentStep(data.step);
  };
  return (
    <>
      <Head>
        <title>Budget</title>
        <meta name="description" content="Budget" />
      </Head>
      <PlatformLayout>
        <main className="min-h-screen text-white px-4 sm:px-6 md:px-8 py-4">
          <header className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-dark dark:text-light">
              Budget
            </h1>
            <hr className="mt-4 border-gray-600" />
          </header>

          {error ? (
            <p className="flex items-center justify-center text-red-500 mt-6">
              {error}
            </p>
          ) : (
            <>
              <div className=" mt-6">
                <ProgressCard
                  steps={steps}
                  currentStep={currentStep}
                  onStepChange={handleStepChange}
                />
              </div>

              <div>
                <StatusCard steps={steps} currentStep={currentStep} />
              </div>
            </>
          )}
        </main>
      </PlatformLayout>
    </>
  );
};

export default BudgetPage;
