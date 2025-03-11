import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import NavPanel from "../layout/NavPanel";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

type Props = {
  steps: string[];
  currentStep: number;
};

type ButtonType = { name: string; view: string };

const StatusCard = ({ steps, currentStep }: Props) => {
  const [activeView, setActiveView] = useState<string>("");
  const [allocated, setAllocated] = useState<number>(0);
  const [spent, setSpent] = useState<number>(0);
  const [buttons, setButtons] = useState<ButtonType[]>([]);

  // Define button groups for each step:
  const buttonsForStep1: ButtonType[] = [
    { name: "Seeds", view: "Seeds" },
    { name: "Tools", view: "Tools" },
    { name: "Labour", view: "Labour" },
  ];

  const buttonsForStep2: ButtonType[] = [
    { name: "Clearing", view: "Clearing" },
    { name: "Ploughing", view: "Ploughing" },
    { name: "Manuring", view: "Manuring" },
  ];

  const buttonsForStep3: ButtonType[] = [
    { name: "Sowing", view: "Sowing" },
    { name: "Grooming", view: "Grooming" },
  ];

  const buttonsForStep4: ButtonType[] = [
    { name: "Water", view: "Water" },
    { name: "Pesticide", view: "Pesticide" },
    { name: "Fertiliser", view: "Fertiliser" },
  ];

  const buttonsForStep5: ButtonType[] = [
    { name: "Harvest", view: "Harvest" },
    { name: "Process", view: "Process" },
    { name: "Storage", view: "Storage" },
  ];

  useEffect(() => {
    if (currentStep === 1) {
      setButtons(buttonsForStep1);
      setActiveView(buttonsForStep1[0].view);
    } else if (currentStep === 2) {
      setButtons(buttonsForStep2);
      setActiveView(buttonsForStep2[0].view);
    } else if (currentStep === 3) {
      setButtons(buttonsForStep3);
      setActiveView(buttonsForStep3[0].view);
    } else if (currentStep === 4) {
      setButtons(buttonsForStep4);
      setActiveView(buttonsForStep4[0].view);
    } else if (currentStep === 5) {
      setButtons(buttonsForStep5);
      setActiveView(buttonsForStep5[0].view);
    }
  }, [currentStep]);

  // Chart data
  const chartData: Record<
    string,
    {
      data: number[];
      backgroundColor: string[];
      daysLeft: number;
      allocated: number;
      spent: number;
    }
  > = {
    Seeds: {
      data: [2, 2],
      backgroundColor: ["#4CAF50", "#FFC107"],
      daysLeft: 15,
      allocated: 5000,
      spent: 3500,
    },
    Tools: {
      data: [4000, 2000],
      backgroundColor: ["#673AB7", "#FF5722"],
      daysLeft: 20,
      allocated: 4000,
      spent: 2000,
    },
    Labour: {
      data: [7000, 6000],
      backgroundColor: ["#FF9800", "#8BC34A"],
      daysLeft: 10,
      allocated: 7000,
      spent: 6000,
    },
    Clearing: {
      data: [3000, 2500],
      backgroundColor: ["#A78BFA", "#FDE68A"],
      daysLeft: 12,
      allocated: 3000,
      spent: 2500,
    },
    Ploughing: {
      data: [5000, 4500],
      backgroundColor: ["#10B981", "#F9A8D4"],
      daysLeft: 8,
      allocated: 5000,
      spent: 4500,
    },
    Manuring: {
      data: [4000, 3000],
      backgroundColor: ["#6B7280", "#93C5FD"],
      daysLeft: 6,
      allocated: 4000,
      spent: 3000,
    },
    Sowing: {
      data: [4500, 4000],
      backgroundColor: ["#8B5CF6", "#E879F9"],
      daysLeft: 10,
      allocated: 4500,
      spent: 4000,
    },
    Grooming: {
      data: [3500, 2000],
      backgroundColor: ["#34D399", "#60A5FA"],
      daysLeft: 5,
      allocated: 3500,
      spent: 2000,
    },
    Water: {
      data: [8000, 7000],
      backgroundColor: ["#3B82F6", "#E5E7EB"],
      daysLeft: 10,
      allocated: 8000,
      spent: 7000,
    },
    Pesticide: {
      data: [6000, 5000],
      backgroundColor: ["#EF4444", "#E5E7EB"],
      daysLeft: 5,
      allocated: 6000,
      spent: 5000,
    },
    Fertiliser: {
      data: [10000, 5000],
      backgroundColor: ["#F59E0B", "#E5E7EB"],
      daysLeft: 7,
      allocated: 10000,
      spent: 5000,
    },
    Harvest: {
      data: [7500, 6000],
      backgroundColor: ["#FB923C", "#C084FC"],
      daysLeft: 15,
      allocated: 7500,
      spent: 6000,
    },
    Process: {
      data: [5000, 3500],
      backgroundColor: ["#4B5563", "#F472B6"],
      daysLeft: 10,
      allocated: 5000,
      spent: 3500,
    },
    Storage: {
      data: [6000, 4500],
      backgroundColor: ["#10B981", "#6EE7B7"],
      daysLeft: 20,
      allocated: 6000,
      spent: 4500,
    },
  };

  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const createChart = () => {
    if (canvasRef.current) {
      const data = chartData[activeView] || { data: [], backgroundColor: [] }; // Fallback to avoid errors

      chartRef.current = new Chart(canvasRef.current, {
        type: "doughnut",
        data: {
          datasets: [
            {
              data: data.data,
              backgroundColor: data.backgroundColor,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: (tooltipItem: any) =>
                  `${tooltipItem.label}: ₹${
                    data.data[tooltipItem.dataIndex] || 0
                  }`,
              },
            },
            legend: {
              position: "top",
              labels: {
                color: "#9CA3AF",
              },
            },
          },
        },
      });
    }
  };

  const updateChart = () => {
    if (chartRef.current) {
      const data = chartData[activeView] || { data: [], backgroundColor: [] }; // Fallback

      chartRef.current.data.datasets[0].data = data.data;
      chartRef.current.data.datasets[0].backgroundColor = data.backgroundColor;
      chartRef.current.update();
    }
  };

  const destroyChart = () => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  };

  useEffect(() => {
    if ([1, 2, 3, 4, 5].includes(currentStep)) {
      if (!chartRef.current) {
        createChart();
      } else {
        updateChart();
      }
    } else {
      destroyChart();
    }
  }, [currentStep, activeView]);

  useEffect(() => {
    const data = chartData[activeView];
    setAllocated(data?.allocated || 0);
    setSpent(data?.spent || 0);
  }, [activeView]);

  useEffect(() => {
    return () => {
      destroyChart();
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-500 to-gray-400 dark:from-gray-700 rounded-lg shadow-lg p-6 md:p-2 sm:p-2 text-gray-800">
      {([1, 2, 3, 4, 5] as number[]).includes(currentStep) ? (
        <>
          <p className="dark:text-light text-xl font-semibold flex justify-center items-center h-full my-2">
            {steps[currentStep - 1] || `Step ${currentStep}`}
          </p>
          <NavPanel
            buttons={buttons}
            activeView={activeView}
            onNavigate={(view: string) => {
              setActiveView(view);
              updateChart();
            }}
          />
          <div className="flex flex-col items-center md:items-start">
            <div className="text-center w-full sm:mt-3">
              {currentStep === 1 ? (
                activeView === "Seeds" ? (
                  <p className="text-dark dark:text-light">Prepare the Seeds</p>
                ) : activeView === "Tools" ? (
                  <p className="text-dark dark:text-light">Gather Tools</p>
                ) : activeView === "Labour" ? (
                  <p className="text-dark dark:text-light">Assign Labour</p>
                ) : null
              ) : currentStep === 2 ? (
                activeView === "Clearing" ? (
                  <p className="text-dark dark:text-light">
                    Clearing Activities
                  </p>
                ) : activeView === "Ploughing" ? (
                  <p className="text-dark dark:text-light">Ploughing Tasks</p>
                ) : activeView === "Manuring" ? (
                  <p className="text-dark dark:text-light">Manuring Steps</p>
                ) : null
              ) : currentStep === 3 ? (
                activeView === "Sowing" ? (
                  <p className="text-dark dark:text-light">Sowing Guide</p>
                ) : activeView === "Grooming" ? (
                  <p className="text-dark dark:text-light">
                    Grooming Instructions
                  </p>
                ) : null
              ) : currentStep === 4 ? (
                activeView === "Water" ? (
                  <p className="text-dark dark:text-light">Watering Budget</p>
                ) : activeView === "Pesticide" ? (
                  <p className="text-dark dark:text-light">Pesticide Budget</p>
                ) : activeView === "Fertiliser" ? (
                  <p className="text-dark dark:text-light">Fertilizer Budget</p>
                ) : null
              ) : currentStep === 5 ? (
                activeView === "Harvest" ? (
                  <p className="text-dark dark:text-light">Harvest Details</p>
                ) : activeView === "Process" ? (
                  <p className="text-dark dark:text-light">Processing Steps</p>
                ) : activeView === "Storage" ? (
                  <p className="text-dark dark:text-light">Storage Tips</p>
                ) : null
              ) : null}
            </div>
          </div>
          <div className="relative mx-auto flex flex-col md:flex-row px-5 items-center w-full md:mt-5 sm:my-3">
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <canvas
                ref={canvasRef}
                id="status-doughnut"
                className="w-full"
              ></canvas>
            </div>
            <div className="flex flex-col text-left ml-0 md:ml-4">
              <p className="text-dark dark:text-light">
                Allocated: ₹{chartData[activeView]?.allocated || 0}
              </p>
              <p className="text-dark dark:text-light">
                Spent: ₹{chartData[activeView]?.spent || 0}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-100 dark:text-light text-xl font-semibold flex justify-center items-center h-full my-2">
            {steps[currentStep - 1] || `Step ${currentStep}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusCard;
