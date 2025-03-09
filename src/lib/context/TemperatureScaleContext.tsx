"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Define available temperature scales
type TemperatureScale = "Celsius" | "Fahrenheit";

// Create context with default values
const TemperatureScaleContext = createContext<{
  temperatureScale: TemperatureScale;
  setTemperatureScale: (scale: TemperatureScale) => void;
}>({
  temperatureScale: "Celsius",
  setTemperatureScale: () => {},
});

// Provider component
export const TemperatureScaleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [temperatureScale, setTemperatureScale] =
    useState<TemperatureScale>("Celsius");

  // Load temperature scale from localStorage
  useEffect(() => {
    const storedScale = localStorage.getItem(
      "temperatureScale"
    ) as TemperatureScale | null;
    if (storedScale) {
      setTemperatureScale(storedScale);
    }
  }, []);

  // Save temperature scale to localStorage
  useEffect(() => {
    localStorage.setItem("temperatureScale", temperatureScale);
  }, [temperatureScale]);

  return (
    <TemperatureScaleContext.Provider
      value={{ temperatureScale, setTemperatureScale }}
    >
      {children}
    </TemperatureScaleContext.Provider>
  );
};

// Custom hook for easy access
export const useTemperatureScale = () => useContext(TemperatureScaleContext);
