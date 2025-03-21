import { useState } from "react";

type Props = {
  selectedTime?: string;
  onTimeSelected: (time: string) => void;
  onCancel: () => void;
};

const ClockPicker = ({ selectedTime, onTimeSelected, onCancel }: Props) => {
  const [hours, setHours] = useState<number>(12);
  const [minutes, setMinutes] = useState<number>(0);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  const handleSetTime = () => {
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;
    onTimeSelected(formattedTime);
  };

  return (
    <div className="clock-picker bg-gray-500 dark:bg-gray-700 p-5 rounded-lg shadow-lg max-w-full max-h-full overflow-auto relative">
      <h3 className="text-lg font-bold mb-4 text-gray-200 dark:text-light break-words">
        Select Time
      </h3>
      <div className="flex justify-center items-center mb-4">
        <div className="flex items-center space-x-2">
          {/* Hours */}
          <select
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value))}
            className="border border-gray-300 dark:bg-gray-700 text-dark dark:text-light rounded p-2 focus:outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          {/* Minutes */}
          <select
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value))}
            className="border border-gray-300 dark:bg-gray-700 text-dark dark:text-light rounded p-2 focus:outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
          {/* AM/PM */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as "AM" | "PM")}
            className="border border-gray-300 dark:bg-gray-700 text-dark dark:text-light rounded p-2 focus:outline-none"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="mt-4 flex justify-center space-x-4">
        <button
          className="bg-green-200 text-white py-2 px-4 rounded hover:bg-green-100"
          aria-label="set"
          onClick={handleSetTime}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </button>
        <button
          className="bg-red-200 text-white py-2 px-4 rounded hover:bg-red-100"
          aria-label="cancel"
          onClick={onCancel}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ClockPicker;
