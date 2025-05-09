import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

export type TimeFormatOption = "12-hour" | "24-hour";

interface UserPreferencesContextType {
  timeFormat: TimeFormatOption;
  setTimeFormat: (format: TimeFormatOption) => void;
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

  const setTimeFormatContext = (format: TimeFormatOption) => {
    setTimeFormatState(format);
    if (typeof window !== "undefined") {
      localStorage.setItem("timeFormat", format);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "timeFormat" && event.newValue) {
        if (event.newValue === "12-hour" || event.newValue === "24-hour") {
          setTimeFormatState(event.newValue as TimeFormatOption);
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      const initialStoredFormat = localStorage.getItem(
        "timeFormat"
      ) as TimeFormatOption;
      if (
        initialStoredFormat &&
        (initialStoredFormat === "12-hour" ||
          initialStoredFormat === "24-hour") &&
        initialStoredFormat !== timeFormat
      ) {
        setTimeFormatState(initialStoredFormat);
      }
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, []);

  return (
    <UserPreferencesContext.Provider
      value={{ timeFormat, setTimeFormat: setTimeFormatContext }}
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
