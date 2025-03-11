"use client";

import { createContext, useContext, useEffect, useState } from "react";

type TemperatureScale = "Celsius" | "Fahrenheit";

const TemperatureScaleContext = createContext<{
  temperatureScale: TemperatureScale;
  setTemperatureScale: (scale: TemperatureScale) => void;
}>({
  temperatureScale: "Celsius",
  setTemperatureScale: () => {},
});

export const TemperatureScaleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [temperatureScale, setTemperatureScale] =
    useState<TemperatureScale>("Celsius");

  useEffect(() => {
    const storedScale = localStorage.getItem(
      "temperatureScale"
    ) as TemperatureScale | null;
    if (storedScale) {
      setTemperatureScale(storedScale);
    }
  }, []);

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

export const useTemperatureScale = () => useContext(TemperatureScaleContext);
