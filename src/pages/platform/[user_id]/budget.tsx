import ProgressCard from "@/components/cards/ProgressCard";
import StatusCard from "@/components/cards/StatusCard";
import Button from "@/components/ui/Button";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import router from "next/router";
import { useState } from "react";

const Budget = () => {
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

  const goBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Budget | Graminate</title>
        <meta name="description" content="Budget" />
      </Head>
      <PlatformLayout>
        <main className="min-h-screen text-white px-4 sm:px-6 md:px-8 py-4">
          <header className="flex text-center md:text-left mb-4 -ml-8">
            <div className="flex items-center gap-2 pt-4">
              <Button text="" style="ghost" arrow="left" onClick={goBack} />
              <h1 className="text-2xl font-bold text-dark dark:text-light">
                Finance Tracker
              </h1>
            </div>
          </header>
          <hr className="mt-4 border-gray-300" />

          {error ? (
            <p className="flex items-center justify-center text-red-500 mt-6">
              {error}
            </p>
          ) : (
            <>
              <div className="mt-6">
                <ProgressCard
                  steps={steps}
                  currentStep={currentStep}
                  onStepChange={handleStepChange}
                />
              </div>

              <div className="flex flex-col mx-auto">
                <StatusCard steps={steps} currentStep={currentStep} />
              </div>
            </>
          )}
        </main>
      </PlatformLayout>
    </>
  );
};

export default Budget;
