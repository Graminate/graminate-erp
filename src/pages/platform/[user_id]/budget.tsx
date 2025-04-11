import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import PlatformLayout from "@/layout/PlatformLayout";
import Button from "@/components/ui/Button";
import ProgressCard from "@/components/cards/ProgressCard";
import StatusCard from "@/components/cards/StatusCard";
import Loader from "@/components/ui/Loader";

type BudgetItem = {
  id: string;
  name: string;
  description?: string;
  allocated: number;
  spent: number;
};
type BudgetStep = {
  id: string;
  name: string;
  items: BudgetItem[];
};
type BudgetData = BudgetStep[];

const initialBudgetData: BudgetData = [
  {
    id: "procurement",
    name: "Procurement",
    items: [
      {
        id: "seeds",
        name: "Seeds",
        description: "Purchase quality seeds",
        allocated: 5000,
        spent: 3500,
      },
      {
        id: "tools",
        name: "Tools",
        description: "Acquire necessary farming tools",
        allocated: 4000,
        spent: 2000,
      },
      {
        id: "labour_proc",
        name: "Labour",
        description: "Initial labour hiring costs",
        allocated: 7000,
        spent: 6000,
      },
    ],
  },
  {
    id: "preparation",
    name: "Preparation",
    items: [
      {
        id: "clearing",
        name: "Clearing",
        description: "Land clearing activities",
        allocated: 3000,
        spent: 2500,
      },
      {
        id: "ploughing",
        name: "Ploughing",
        description: "Soil ploughing and preparation",
        allocated: 5000,
        spent: 4500,
      },
      {
        id: "manuring",
        name: "Manuring",
        description: "Applying manure/compost",
        allocated: 4000,
        spent: 3000,
      },
    ],
  },
  {
    id: "farming",
    name: "Farming",
    items: [
      {
        id: "sowing",
        name: "Sowing",
        description: "Seed sowing process",
        allocated: 4500,
        spent: 4000,
      },
      {
        id: "grooming",
        name: "Grooming",
        description: "Crop grooming and maintenance",
        allocated: 3500,
        spent: 2000,
      },
    ],
  },
  {
    id: "recurring",
    name: "Recurring Cost",
    items: [
      {
        id: "water",
        name: "Water",
        description: "Irrigation and water supply",
        allocated: 8000,
        spent: 7000,
      },
      {
        id: "pesticide",
        name: "Pesticide",
        description: "Pest control measures",
        allocated: 6000,
        spent: 5000,
      },
      {
        id: "fertiliser",
        name: "Fertiliser",
        description: "Nutrient application",
        allocated: 10000,
        spent: 5000,
      },
    ],
  },
  {
    id: "harvest",
    name: "Harvest",
    items: [
      {
        id: "harvest_labour",
        name: "Harvest Labour",
        description: "Labour for harvesting",
        allocated: 7500,
        spent: 6000,
      },
      {
        id: "process",
        name: "Processing",
        description: "Post-harvest processing",
        allocated: 5000,
        spent: 3500,
      },
      {
        id: "storage",
        name: "Storage",
        description: "Storing the harvested produce",
        allocated: 6000,
        spent: 4500,
      },
    ],
  },
];

const fetchBudgetData = (): Promise<BudgetData> => {
  console.log("Simulating budget data fetch...");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(initialBudgetData)));
      console.log("Budget data fetched.");
    }, 500);
  });
};
const updateBudgetItemSpent = (
  currentData: BudgetData,
  stepId: string,
  itemId: string,
  newSpent: number
): BudgetData => {
  return currentData.map((step) => {
    if (step.id === stepId) {
      return {
        ...step,
        items: step.items.map((item) => {
          if (item.id === itemId) {
            const validatedSpent = Math.max(0, newSpent);
            console.log(
              `Updating ${itemId} in ${stepId} from ${item.spent} to ${validatedSpent}`
            );
            return { ...item, spent: validatedSpent };
          }
          return item;
        }),
      };
    }
    return step;
  });
};

type OverallSummaryProps = {
  budgetData: BudgetData;
  currencySymbol?: string;
};
const IntegratedOverallSummary = ({
  budgetData,
  currencySymbol = "₹",
}: OverallSummaryProps) => {
  const totals = useMemo(() => {
    return budgetData.reduce(
      (acc, step) => {
        step.items.forEach((item) => {
          acc.allocated += item.allocated;
          acc.spent += item.spent;
        });
        return acc;
      },
      { allocated: 0, spent: 0 }
    );
  }, [budgetData]);
  const remaining = totals.allocated - totals.spent;
  const spentPercentage =
    totals.allocated > 0
      ? Math.min(100, (totals.spent / totals.allocated) * 100)
      : 0;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 shadow-lg rounded-lg text-gray-800 dark:text-gray-200 h-full">
      <h2 className="text-lg md:text-xl font-semibold mb-4 text-center text-gray-700 dark:text-gray-300">
        Overall Summary
      </h2>
      <div className="space-y-2 md:space-y-3 text-sm md:text-base">
        <div className="flex justify-between">
          <span className="font-medium text-gray-600 dark:text-gray-400">
            Total Allocated:
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {currencySymbol}
            {totals.allocated.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600 dark:text-gray-400">
            Total Spent:
          </span>
          <span className="font-bold text-red-600 dark:text-red-400">
            {currencySymbol}
            {totals.spent.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
          <span className="font-medium text-gray-600 dark:text-gray-400">
            Remaining:
          </span>
          <span
            className={`font-bold ${
              remaining >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-orange-500 dark:text-orange-400"
            }`}
          >
            {remaining < 0 ? "-" : ""}
            {currencySymbol}
            {Math.abs(remaining).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mt-4 md:mt-6">
        <div className="flex justify-between text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Spending Progress</span>
          <span className="font-medium">{spentPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 md:h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-width duration-500 ease-out ${
              remaining < 0
                ? "bg-orange-500"
                : "bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-400 dark:to-green-400"
            }`}
            style={{ width: `${spentPercentage}%` }}
            role="progressbar"
            aria-valuenow={spentPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall budget spent percentage"
          ></div>
        </div>
        {remaining < 0 && (
          <p className="text-xs text-orange-500 dark:text-orange-400 mt-1 text-right">
            Budget exceeded!
          </p>
        )}
      </div>
    </div>
  );
};

const Budget = () => {
  const router = useRouter();
  const [budgetData, setBudgetData] = useState<BudgetData>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const currencySymbol = "₹";

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchBudgetData()
      .then((data) => {
        setBudgetData(data);
        const savedStepIndex = parseInt(
          localStorage.getItem("budgetCurrentStepIndex") || "0",
          10
        );
        setCurrentStepIndex(
          savedStepIndex >= 0 && savedStepIndex < data.length
            ? savedStepIndex
            : 0
        );
      })
      .catch((err) => {
        console.error("Failed to fetch budget data:", err);
        setError("Could not load budget information. Please try again later.");
        setBudgetData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleStepChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < budgetData.length) {
      setCurrentStepIndex(newIndex);
      localStorage.setItem("budgetCurrentStepIndex", newIndex.toString());
    }
  };

  const handleUpdateSpent = (
    stepId: string,
    itemId: string,
    newSpent: number
  ) => {
    setBudgetData((prevData) =>
      updateBudgetItemSpent(prevData, stepId, itemId, newSpent)
    );
  };

  const goBack = () => {
    router.back();
  };

  const stepsForProgressCard = useMemo(
    () => budgetData.map((step) => ({ id: step.id, name: step.name })),
    [budgetData]
  );
  const currentStepData: BudgetStep | undefined = budgetData[currentStepIndex];

  return (
    <>
      <Head>
        <title>Budget Tracker | Graminate</title>
        <meta
          name="description"
          content="Track and manage your farm budget stages"
        />
      </Head>
      <PlatformLayout>
        <main className="min-h-screen bg-light dark:bg-gray-900">
          <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-300 dark:border-gray-700">
            <div className="flex items-center mb-3 sm:mb-0">
              <Button
                text=""
                arrow="left"
                style="ghost"
                onClick={goBack}
                aria-label="Go back"
              />
              <h1 className="text-lg font-semibold dark:text-white">
                Finance Tracker
              </h1>
            </div>
          </header>

          {loading ? (
            <div className="flex justify-center items-center min-h-[60vh]">
              <Loader />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center min-h-[60vh] text-center">
              <div
                className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            </div>
          ) : budgetData.length === 0 && !loading ? (
            <div className="flex justify-center items-center min-h-[60vh] text-center">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No budget data available.
              </p>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {stepsForProgressCard.length > 0 && (
                <ProgressCard
                  steps={stepsForProgressCard}
                  currentStepIndex={currentStepIndex}
                  onStepChange={handleStepChange}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:items-start">
                <div className="lg:col-span-2 h-full">
                  <StatusCard
                    stepData={currentStepData}
                    onUpdateSpent={handleUpdateSpent}
                    currencySymbol={currencySymbol}
                  />
                </div>
                <div className="lg:col-span-1 h-full">
                  <IntegratedOverallSummary
                    budgetData={budgetData}
                    currencySymbol={currencySymbol}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </PlatformLayout>
    </>
  );
};

export default Budget;
