import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

interface ProgressStep {
  id: string;
  name: string;
}

interface ProgressCardProps {
  steps: ProgressStep[];
  currentStepIndex: number;
  onStepChange: (newStepIndex: number) => void;
}

const ProgressCard = ({
  steps,
  currentStepIndex,
  onStepChange,
}: ProgressCardProps) => {
  const totalSteps = steps.length;
  const progress =
    totalSteps <= 1 ? 100 : (currentStepIndex / (totalSteps - 1)) * 100;

  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );

  const handleStepClick = (index: number) => {
    setSlideDirection(index < currentStepIndex ? "left" : "right");
    onStepChange(index);
  };

  const handleNavigation = (direction: "left" | "right") => {
    const newIndex =
      direction === "left" ? currentStepIndex - 1 : currentStepIndex + 1;
    if (newIndex >= 0 && newIndex < totalSteps) {
      setSlideDirection(direction);
      onStepChange(newIndex);
    }
  };

  if (totalSteps === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg text-center text-dark dark:text-gray-400">
        No steps defined.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 shadow-lg rounded-lg relative text-gray-200 dark:text-gray-300">
      <style>{`
        @keyframes flyIn {
          from { transform: translateX(var(--initial-offset)); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div className="hidden md:block h-16">
        <div className="relative mb-8 h-full">
          <div
            className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full transform -translate-y-1/2"
            style={{
              width: `calc(100% - ${100 / totalSteps}%)`,
              left: `${50 / totalSteps}%`,
            }}
          />

          <div className="absolute top-1/2 left-0 w-full h-1 bg-green-100 dark:bg-gray-600 rounded-full transform -translate-y-1/2" />

          <div
            className="absolute top-1/2 left-0 h-1 bg-green-200 dark:bg-green-400 rounded-full transition-all duration-500 ease-out transform -translate-y-1/2"
            style={{
              width: `${progress}%`,
            }}
          />
          <div
            className={`absolute top-1/2 left-0 transform -translate-y-1/2 w-full flex justify-between items-center px-[calc(50%/${totalSteps})]`}
          >
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center text-center relative"
              >
                <button
                  onClick={() => handleStepClick(index)}
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2
                     focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800
                    ${
                      index === currentStepIndex
                        ? "bg-green-200 dark:bg-green-400 text-white dark:text-dark font-bold"
                        : index < currentStepIndex
                        ? "bg-green-200 text-green-800 dark:text-green-100"
                        : "bg-green-200 dark:bg-gray-700 text-light"
                    }`}
                  tabIndex={0}
                  aria-label={`Go to step ${index + 1}: ${step.name}`}
                  aria-current={index === currentStepIndex ? "step" : undefined}
                >
                  {index + 1}
                </button>

                <span
                  className={`absolute top-full mt-1 text-xs font-medium w-max max-w-[100px] truncate px-1 left-1/2 transform -translate-x-1/2 ${
                    index === currentStepIndex
                      ? "text-green-600 dark:text-green-300 font-semibold"
                      : index < currentStepIndex
                      ? "text-green-500 dark:text-green-400"
                      : "text-dark dark:text-light"
                  }`}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="md:hidden flex items-center justify-between">
        <Button
          text=""
          arrow="left"
          style="ghost"
          onClick={() => handleNavigation("left")}
          isDisabled={currentStepIndex === 0}
        />

        <div className="flex flex-col items-center text-center px-2 flex-grow min-w-0">
          <div className="relative w-10 h-10 flex items-center justify-center bg-green-200 dark:bg-green-400 rounded-full text-white dark:text-gray-900 font-bold overflow-hidden mb-1">
            <span
              key={currentStepIndex}
              className="absolute text-lg"
              style={
                {
                  animation: `flyIn 300ms ease-out forwards`,
                  "--initial-offset":
                    slideDirection === "left" ? "-30px" : "30px",
                } as React.CSSProperties
              }
            >
              {currentStepIndex + 1}
            </span>
          </div>
          <span className="text-sm font-semibold text-green-600 dark:text-green-300 truncate w-full">
            {steps[currentStepIndex]?.name || `Step ${currentStepIndex + 1}`}
          </span>
        </div>

        <Button
          text=""
          arrow="right"
          style="ghost"
          onClick={() => handleNavigation("right")}
          isDisabled={currentStepIndex === totalSteps - 1}
        />
      </div>
    </div>
  );
};

export default ProgressCard;
