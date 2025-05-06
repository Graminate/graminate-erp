import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";

type Props = {
  selectedTime?: string;
  onTimeSelected: (time: string) => void;
  onCancel: () => void;
};

const ClockPicker = ({ selectedTime, onTimeSelected, onCancel }: Props) => {
  const parseTime = (timeStr?: string) => {
    if (!timeStr) return { hours: 12, minutes: 0, period: "AM" as "AM" | "PM" };
    const [timePart, modifier] = timeStr.split(" ");
    const [h, m] = timePart.split(":").map(Number);
    return { hours: h, minutes: m, period: modifier as "AM" | "PM" };
  };

  const initialTime = parseTime(selectedTime);
  const [hours, setHours] = useState<number>(initialTime.hours);
  const [minutes, setMinutes] = useState<number>(initialTime.minutes);
  const [period, setPeriod] = useState<"AM" | "PM">(initialTime.period);

  useEffect(() => {
    const newTime = parseTime(selectedTime);
    setHours(newTime.hours);
    setMinutes(newTime.minutes);
    setPeriod(newTime.period);
  }, [selectedTime]);

  const handleSetTime = () => {
    const formattedHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const formattedTime = `${formattedHours.toString()}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;
    onTimeSelected(formattedTime);
  };

  const selectBaseClasses =
    "w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-center py-2 px-1";

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs w-full animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200">
          Select Time
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 "
          aria-label="Cancel time selection"
        >
          <FontAwesomeIcon icon={faX} />
        </button>
      </div>

      <div className="flex justify-center items-center space-x-2 mb-4">
        <div className="flex-1">
          <label htmlFor="hours-select" className="sr-only">
            Hours
          </label>
          <select
            id="hours-select"
            value={hours === 0 ? 12 : hours > 12 ? hours - 12 : hours}
            onChange={(e) => {
              const displayHour = parseInt(e.target.value);
              let actualHour = displayHour;
              if (period === "PM" && displayHour !== 12) actualHour += 12;
              if (period === "AM" && displayHour === 12) actualHour = 0;
              setHours(actualHour);
            }}
            className={selectBaseClasses}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
        <span className="text-gray-500 dark:text-gray-400 font-bold pb-1">
          :
        </span>
        <div className="flex-1">
          <label htmlFor="minutes-select" className="sr-only">
            Minutes
          </label>
          <select
            id="minutes-select"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value))}
            className={selectBaseClasses}
          >
            {Array.from({ length: 60 }, (_, i) => i).map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="period-select" className="sr-only">
            AM/PM
          </label>
          <select
            id="period-select"
            value={period}
            onChange={(e) => {
              const newPeriod = e.target.value as "AM" | "PM";
              setPeriod(newPeriod);
              if (newPeriod === "PM" && hours < 12) setHours(hours + 12);
              if (newPeriod === "AM" && hours >= 12) setHours(hours - 12);
            }}
            className={selectBaseClasses + " px-2"}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-200 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          onClick={handleSetTime}
          aria-label="Set selected time"
        >
          Set Time
        </button>
      </div>
    </div>
  );
};

export default ClockPicker;
