import React, { useState, useEffect } from "react";
import type { ProgressCard } from "@/types/card-props";

const ProgressCard = ({
  steps,
  currentStep: initialStep = 1,
  onStepChange = () => {},
}: ProgressCard) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [limitedSteps, setLimitedSteps] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );
  const [viewMode, setViewMode] = useState<"Large" | "Small">("Large");
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

  // Limit to first 5 steps
  useEffect(() => {
    setLimitedSteps(steps.slice(0, 5));
  }, [steps]);

  // Calculate progress based on currentStep and total steps
  useEffect(() => {
    const calculateProgress = (current: number, total: number): number => {
      if (total <= 1) return 100;
      return Math.min(((current - 1) / (total - 1)) * 100, 100);
    };
    setProgress(calculateProgress(currentStep, limitedSteps.length));
  }, [currentStep, limitedSteps]);

  // Set viewMode based on screen width (<=1145px: Small; >1145px: Large)
  useEffect(() => {
    if (screenWidth <= 1145) {
      setViewMode("Small");
    } else {
      setViewMode("Large");
    }
  }, [screenWidth]);

  // Listen to window resize events
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Navigate to a different step with a given slide direction
  const navigateToStep = (stepIndex: number, direction: "left" | "right") => {
    setSlideDirection(direction);
    const newStep = stepIndex + 1;
    setCurrentStep(newStep);
    onStepChange({ step: newStep });
    localStorage.setItem("currentStep", newStep.toString());
  };

  return (
    <div
      className={`bg-gray-500 dark:bg-gray-700 p-6 shadow-lg rounded-lg relative ${
        viewMode === "Small" ? "w-1/2" : "w-full"
      } my-3`}
    >
      {/* CSS Keyframes for fly transition */}
      <style>{`
        @keyframes flyIn {
          from {
            transform: translateX(var(--initial-offset));
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
      <div className="relative">
        {viewMode === "Large" ? (
          <>
            {/* Progress Bar */}
            <div
              className="relative bg-gray-300 my-5 rounded-full h-2 mx-auto"
              style={{
                width: limitedSteps.length
                  ? `calc(100% - ${100 / limitedSteps.length}%)`
                  : "100%",
              }}
            >
              <div
                className="absolute top-0 left-0 h-2 bg-green-100 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {/* Step Buttons */}
            <div className="absolute top-2 left-0 transform -translate-y-1/2 w-full flex justify-between">
              {limitedSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / limitedSteps.length}%` }}
                >
                  <button
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer 
                      ${
                        index + 1 === currentStep
                          ? "bg-green-200"
                          : index + 1 < currentStep
                          ? "bg-green-100"
                          : "bg-gray-300"
                      }`}
                    tabIndex={0}
                    aria-label={`Navigate to step ${index + 1}`}
                    onClick={() => {
                      const direction =
                        index + 1 < currentStep ? "left" : "right";
                      navigateToStep(index, direction);
                    }}
                  >
                    <span className="text-sm font-bold">{index + 1}</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Small View Navigation
          <div className="relative flex items-center justify-between text-dark dark:text-light mt-5">
            {/* Left Navigation Button */}
            <button
              aria-label="left-navigation"
              onClick={() => {
                if (currentStep > 1) navigateToStep(currentStep - 2, "left");
              }}
              disabled={currentStep === 1}
              className={`p-2 rounded-full ${
                currentStep === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-dark dark:text-light hover:bg-gray-400 dark:hover:bg-dark"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            {/* Current Step Display with fly transition */}
            <div className="relative w-10 h-10 flex items-center justify-center bg-green-200 rounded-full overflow-hidden">
              {limitedSteps[currentStep - 1] && (
                <span
                  key={currentStep}
                  className="absolute text-base font-bold"
                  style={
                    {
                      animation: `flyIn 300ms ease-out forwards`,
                      "--initial-offset":
                        slideDirection === "left" ? "-100px" : "100px",
                    } as React.CSSProperties
                  }
                >
                  {currentStep}
                </span>
              )}
            </div>
            {/* Right Navigation Button */}
            <button
              aria-label="right-navigation"
              onClick={() => {
                if (currentStep < limitedSteps.length)
                  navigateToStep(currentStep, "right");
              }}
              disabled={currentStep === limitedSteps.length}
              className={`p-2 rounded-full ${
                currentStep === limitedSteps.length
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-dark dark:text-light hover:bg-gray-400 dark:hover:bg-dark"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      {/* Steps Text */}
      <div className="flex justify-between mt-6">
        {viewMode === "Large" ? (
          limitedSteps.map((step, index) => (
            <div
              key={index}
              className={`text-center text-sm font-medium ${
                index + 1 === currentStep
                  ? "text-green-200"
                  : index + 1 < currentStep
                  ? "text-green-100"
                  : "text-gray-100 dark:text-gray-300"
              }`}
              style={{ width: `${100 / limitedSteps.length}%` }}
            >
              <span>{step}</span>
            </div>
          ))
        ) : (
          <div className="text-center text-sm font-medium text-green-200 w-full">
            <span>
              {limitedSteps[currentStep - 1] || `Step ${currentStep}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressCard;
