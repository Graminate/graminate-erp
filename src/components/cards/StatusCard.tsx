import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  ChartConfiguration,
} from "chart.js";
import Button from "@/components/ui/Button";
import NavPanel from "@/components/layout/NavPanel";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

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

type StatusCardProps = {
  stepData: BudgetStep | undefined;
  onUpdateSpent: (stepId: string, itemId: string, newSpent: number) => void;
  currencySymbol?: string;
};

const StatusCard = ({
  stepData,
  onUpdateSpent,
  currencySymbol = "₹",
}: StatusCardProps) => {
  const [activeItemId, setActiveItemId] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeItem = stepData?.items.find((item) => item.id === activeItemId);
  const remainingBudget = activeItem
    ? activeItem.allocated - activeItem.spent
    : 0;

  useEffect(() => {
    setActiveItemId(stepData?.items[0]?.id ?? "");
  }, [stepData]);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(
        window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    };
    checkDarkMode();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", checkDarkMode);
    return () => mediaQuery.removeEventListener("change", checkDarkMode);
  }, []);

  const getChartConfig = (
    item: BudgetItem | undefined
  ): ChartConfiguration<"doughnut"> => {
    const spent = item?.spent ?? 0;
    const allocated = item?.allocated ?? 0;
    const remainingForChart = Math.max(0, allocated - spent);

    const CHART_COLORS = {
      spent: "#EF4444",
      spentDark: "#F87171",
      remaining: "#3B82F6",
      remainingDark: "#60A5FA",
      placeholder: isDarkMode ? "#6B7280" : "#D1D5DB",
      borderColor: isDarkMode ? "#374151" : "#FFFFFF",
      legendColor: isDarkMode ? "#D1D5DB" : "#4B5563",
    };

    const dataValues = allocated > 0 ? [spent, remainingForChart] : [1];
    const labels = allocated > 0 ? ["Spent", "Remaining"] : ["No Budget"];
    const backgroundColors =
      allocated > 0
        ? isDarkMode
          ? [CHART_COLORS.spentDark, CHART_COLORS.remainingDark]
          : [CHART_COLORS.spent, CHART_COLORS.remaining]
        : [CHART_COLORS.placeholder];

    return {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: dataValues,
            backgroundColor: backgroundColors,
            borderColor: CHART_COLORS.borderColor,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                allocated <= 0
                  ? "No budget allocated"
                  : `${context.label || ""}: ${currencySymbol}${(
                      context.parsed || 0
                    ).toLocaleString()}`,
            },
          },
          legend: {
            display: allocated > 0,
            position: "bottom",
            labels: {
              color: CHART_COLORS.legendColor,
              padding: 15,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
        },
      },
    };
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const config = getChartConfig(activeItem);
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    if (activeItem) {
      chartRef.current = new Chart(canvasRef.current, config);
    } else if (canvasRef.current?.getContext("2d")) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [activeItem, isDarkMode, currencySymbol]);

  useEffect(() => {
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  const handleUpdateSpent = (amount: number) => {
    if (stepData && activeItem) {
      const newSpent = activeItem.spent + amount;
      if (newSpent >= 0) {
        onUpdateSpent(stepData.id, activeItem.id, newSpent);
      }
    }
  };

  if (!stepData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center text-dark dark:text-light h-full flex items-center justify-center">
        <p>Select a step from the progress bar above to view details.</p>
      </div>
    );
  }

  const navPanelButtons = stepData.items.map((item) => ({
    name: item.name,
    view: item.id,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 text-gray-800 dark:text-gray-200 h-full flex flex-col">
      <h2 className="text-xl md:text-2xl font-semibold text-center mb-4 text-gray-700 dark:text-gray-300">
        {stepData.name} Details
      </h2>

      {navPanelButtons.length > 0 ? (
        <NavPanel
          buttons={navPanelButtons}
          activeView={activeItemId}
          onNavigate={setActiveItemId}
        />
      ) : (
        <p className="text-center text-dark dark:text-light mb-4 pb-3 border-b border-gray-300 dark:border-gray-600">
          No items in this step.
        </p>
      )}

      {activeItem ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center flex-grow">
          <div className="relative h-56 sm:h-64 md:h-72 w-full flex justify-center items-center p-2">
            <canvas
              ref={canvasRef}
              id={`status-doughnut-${stepData.id}-${activeItem.id}`}
            />
          </div>

          <div className="flex flex-col space-y-3 md:space-y-4 text-sm md:text-base">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-center md:text-left">
              {activeItem.name}
            </h3>
            {activeItem.description && (
              <p className="text-xs md:text-sm text-dark dark:text-light text-center md:text-left">
                {activeItem.description}
              </p>
            )}

            <div className="space-y-2 border-t border-b border-gray-200 dark:border-gray-700 py-3 my-2">
              <div className="flex justify-between items-center">
                {" "}
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Allocated:
                </span>{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {currencySymbol}
                  {activeItem.allocated.toLocaleString()}
                </span>{" "}
              </div>
              <div className="flex justify-between items-center">
                {" "}
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Spent:
                </span>{" "}
                <span className="font-bold text-red-600 dark:text-red-400">
                  {currencySymbol}
                  {activeItem.spent.toLocaleString()}
                </span>{" "}
              </div>
              <div className="flex justify-between items-center">
                {" "}
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Remaining:
                </span>{" "}
                <span
                  className={`font-bold ${
                    remainingBudget >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-orange-500 dark:text-orange-400"
                  }`}
                >
                  {" "}
                  {remainingBudget < 0 ? "-" : ""}
                  {currencySymbol}
                  {Math.abs(remainingBudget).toLocaleString()}{" "}
                </span>{" "}
              </div>
            </div>

            {activeItem.allocated > 0 && (
              <div className="pt-2 text-center md:text-left">
                <p className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                  Adjust Spent:
                </p>
                <div className="flex items-center justify-center md:justify-start gap-1 md:gap-2 flex-wrap">
                  <Button
                    text="-100"
                    style="secondary"
                    onClick={() => handleUpdateSpent(-100)}
                    isDisabled={activeItem.spent <= 0}
                  />
                  <Button
                    text="+100"
                    style="secondary"
                    onClick={() => handleUpdateSpent(100)}
                  />
                  <Button
                    text="-1k"
                    style="secondary"
                    onClick={() => handleUpdateSpent(-1000)}
                    isDisabled={activeItem.spent <= 0}
                  />
                  <Button
                    text="+1k"
                    style="secondary"
                    onClick={() => handleUpdateSpent(1000)}
                  />
                </div>
                {remainingBudget < 0 && (
                  <p className="text-xs text-orange-500 dark:text-orange-400 mt-2 text-center md:text-left">
                    Warning: Budget exceeded!
                  </p>
                )}
              </div>
            )}
            {activeItem.allocated <= 0 && (
              <p className="text-xs text-dark dark:text-light text-center md:text-left">
                No budget allocated for adjustments.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center text-dark dark:text-light p-10">
          {stepData.items.length > 0
            ? "Select an item from the panel above."
            : "No budget items defined for this step."}
        </div>
      )}
    </div>
  );
};

export default StatusCard;
