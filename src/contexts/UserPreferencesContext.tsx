import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

export type TimeFormatOption = "12-hour" | "24-hour";
export type TemperatureScaleOption = "Celsius" | "Fahrenheit";

interface UserPreferencesContextType {
  timeFormat: TimeFormatOption;
  setTimeFormat: (format: TimeFormatOption) => void;
  temperatureScale: TemperatureScaleOption;
  setTemperatureScale: (scale: TemperatureScaleOption) => void;
}

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined);

export const UserPreferencesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [timeFormat, setTimeFormatState] = useState<TimeFormatOption>(() => {
    if (typeof window !== "undefined") {
      const storedFormat = localStorage.getItem(
        "timeFormat"
      ) as TimeFormatOption;
      if (storedFormat === "12-hour" || storedFormat === "24-hour") {
        return storedFormat;
      }
    }
    return "24-hour";
  });

  const [temperatureScale, setTemperatureScaleState] =
    useState<TemperatureScaleOption>(() => {
      if (typeof window !== "undefined") {
        const storedScale = localStorage.getItem(
          "temperatureScale"
        ) as TemperatureScaleOption;
        if (storedScale === "Celsius" || storedScale === "Fahrenheit") {
          return storedScale;
        }
      }
      return "Celsius"; // Default temperature scale
    });

  const setTimeFormatContext = (format: TimeFormatOption) => {
    setTimeFormatState(format);
    if (typeof window !== "undefined") {
      localStorage.setItem("timeFormat", format);
    }
  };

  const setTemperatureScaleContext = (scale: TemperatureScaleOption) => {
    setTemperatureScaleState(scale);
    if (typeof window !== "undefined") {
      localStorage.setItem("temperatureScale", scale);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "timeFormat" && event.newValue) {
        if (event.newValue === "12-hour" || event.newValue === "24-hour") {
          setTimeFormatState(event.newValue as TimeFormatOption);
        }
      }
      if (event.key === "temperatureScale" && event.newValue) {
        if (event.newValue === "Celsius" || event.newValue === "Fahrenheit") {
          setTemperatureScaleState(event.newValue as TemperatureScaleOption);
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);

      // Initial sync for timeFormat
      const initialStoredTimeFormat = localStorage.getItem(
        "timeFormat"
      ) as TimeFormatOption;
      if (
        initialStoredTimeFormat &&
        (initialStoredTimeFormat === "12-hour" ||
          initialStoredTimeFormat === "24-hour") &&
        initialStoredTimeFormat !== timeFormat
      ) {
        setTimeFormatState(initialStoredTimeFormat);
      }

      // Initial sync for temperatureScale
      const initialStoredTempScale = localStorage.getItem(
        "temperatureScale"
      ) as TemperatureScaleOption;
      if (
        initialStoredTempScale &&
        (initialStoredTempScale === "Celsius" ||
          initialStoredTempScale === "Fahrenheit") &&
        initialStoredTempScale !== temperatureScale
      ) {
        setTemperatureScaleState(initialStoredTempScale);
      }

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [timeFormat, temperatureScale]); // Add temperatureScale to dependency array for completeness

  return (
    <UserPreferencesContext.Provider
      value={{
        timeFormat,
        setTimeFormat: setTimeFormatContext,
        temperatureScale,
        setTemperatureScale: setTemperatureScaleContext,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }
  return context;
};
