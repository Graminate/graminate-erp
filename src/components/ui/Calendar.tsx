"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ClockPicker from "./ClockPicker";
import TextField from "./TextField";
import DropdownSmall from "./Dropdown/DropdownSmall";

interface Task {
  name: string;
  time: string;
}

interface Tasks {
  [key: string]: Task[];
}

const reminderOptions = [
  "At time of event",
  "5 minutes before",
  "10 minutes before",
  "15 minutes before",
  "30 minutes before",
  "1 hour before",
  "2 hours before",
  "1 day before",
  "2 days before",
  "1 week before",
];

const Calendar: React.FC = () => {
  // State for tasks, selected date, and task form
  const [tasks, setTasks] = useState<Tasks>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newTask, setNewTask] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("12:00 PM");
  const [isClockVisible, setIsClockVisible] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [isTaskNameValid, setIsTaskNameValid] = useState(true);

  // State for calendar month/year
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Load tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  // Save tasks to localStorage on tasks change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Handle date selection from the calendar
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setShowTasks(true);
    setShowAddTask(false);
  };

  // Add a task – disallow adding if the task name is empty or if the date is in the past
  const addTask = () => {
    if (!newTask.trim()) {
      setIsTaskNameValid(false);
      return;
    }
    setIsTaskNameValid(true);

    const today = new Date();
    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const selectedDateOnly = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );

    if (selectedDateOnly < todayDateOnly) {
      Swal.fire({
        title: "Invalid Date",
        text: "You cannot add tasks to past dates.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const dateKey = selectedDate.toISOString().split("T")[0];

    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      if (!updatedTasks[dateKey]) {
        updatedTasks[dateKey] = [];
      }
      updatedTasks[dateKey].push({ name: newTask.trim(), time: newTaskTime });

      updatedTasks[dateKey].sort((a, b) => {
        return (
          new Date(`1970-01-01T${convertTo24Hour(a.time)}`).getTime() -
          new Date(`1970-01-01T${convertTo24Hour(b.time)}`).getTime()
        );
      });
      return updatedTasks;
    });

    setNewTask("");
    setNewTaskTime("12:00 PM");
    setShowAddTask(false);
    setShowTasks(true);
  };

  // Remove a task at the given index for the current date
  const removeTask = (index: number) => {
    const dateKey = selectedDate.toISOString().split("T")[0];
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      if (updatedTasks[dateKey]) {
        updatedTasks[dateKey].splice(index, 1);
        if (updatedTasks[dateKey].length === 0) {
          delete updatedTasks[dateKey];
        }
      }
      return updatedTasks;
    });
  };

  // Helper to convert time string to 24-hour format
  const convertTo24Hour = (time: string): string => {
    const [hoursMinutes, modifier] = time.split(" ");
    let [hours, minutes] = hoursMinutes.split(":").map(Number);

    if (modifier === "PM" && hours < 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Generate the calendar days for the given month and year.
  const generateCalendar = (month: number, year: number) => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array(firstDayOfMonth)
      .fill(null)
      .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  };

  const calendarDays = generateCalendar(selectedMonth, selectedYear);

  // Navigate to previous or next month and reset task views.
  const previousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
    setShowTasks(false);
    setShowAddTask(false);
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
    setShowTasks(false);
    setShowAddTask(false);
  };

  // Return "Today", "Tomorrow" or the full date string based on the selected date.
  const getDayStatus = (date: Date): string => {
    const today = new Date();
    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const tomorrowDateOnly = new Date(todayDateOnly);
    tomorrowDateOnly.setDate(todayDateOnly.getDate() + 1);
    const selectedDateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    if (selectedDateOnly.getTime() === todayDateOnly.getTime()) {
      return "Today";
    } else if (selectedDateOnly.getTime() === tomorrowDateOnly.getTime()) {
      return "Tomorrow";
    }
    return date.toDateString();
  };

  // Determine if the selected date is in the past.
  const isSelectedDatePast = (() => {
    const selected = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
  })();

  const currentDate = new Date();
  const dayAbbreviations = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Apply conditional styling for each day cell.
  const getDayClasses = (day: number | null): string => {
    let classes =
      "flex items-center justify-center h-10 w-10 rounded-full text-center text-base font-medium cursor-pointer ";
    if (day === null) {
      classes += "text-gray-400 dark:text-dark cursor-not-allowed ";
    } else {
      const selectedDay = selectedDate.getDate();
      if (
        day === selectedDay &&
        selectedMonth === selectedDate.getMonth() &&
        selectedYear === selectedDate.getFullYear()
      ) {
        classes += "bg-green-200 text-white ";
      } else if (
        day === currentDate.getDate() &&
        selectedMonth === currentDate.getMonth() &&
        selectedYear === currentDate.getFullYear()
      ) {
        classes += "text-red-200 ";
      } else {
        classes += "hover:bg-gray-300 dark:hover:bg-blue-100 ";
      }
    }
    return classes;
  };

  return (
    <div className="bg-gradient-to-br from-gray-500 to-gray-400 dark:from-gray-700 rounded-lg shadow-lg p-6 w-full dark:text-light relative">
      {showAddTask ? (
        // --- Add Task View ---
        <>
          <h3 className="text-lg font-bold mb-4 text-dark dark:text-light">
            Add Task for {selectedDate.toDateString()}
          </h3>
          <div className="space-y-4">
            <TextField
              placeholder="Task name"
              value={newTask}
              onChange={setNewTask}
              errorMessage={!isTaskNameValid ? "Task name cannot be empty" : ""}
            />
            <button
              className="w-full border border-gray-300 text-dark dark:text-light rounded px-2 py-1 focus:outline-none"
              onClick={() => setIsClockVisible(true)}
            >
              {newTaskTime}
            </button>
            {isClockVisible && (
              <ClockPicker
                selectedTime={newTaskTime}
                onTimeSelected={(time: string) => {
                  setNewTaskTime(time);
                  setIsClockVisible(false);
                }}
                onCancel={() => setIsClockVisible(false)}
              />
            )}
            <DropdownSmall
              items={reminderOptions}
              label="Alert"
              placeholder="None"
              selected={""}
              onSelect={(item: string) => {
                // Implement alert selection if needed
              }}
            />
            <div className="flex space-x-4">
              <button
                className="bg-green-200 hover:bg-green-800 text-white px-4 py-2 rounded"
                onClick={addTask}
                disabled={!newTask.trim() || !newTaskTime.trim()}
              >
                Add
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 rounded"
                onClick={() => setShowAddTask(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      ) : showTasks ? (
        // --- Task List View ---
        <>
          <h3 className="text-lg font-bold mb-4 text-dark dark:text-light">
            Tasks for {getDayStatus(selectedDate)}
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            {(tasks[selectedDate.toISOString().split("T")[0]] || []).map(
              (task, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-dark dark:text-light">
                    {task.time} - {task.name}
                  </span>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => removeTask(index)}
                  >
                    ✖
                  </button>
                </li>
              )
            )}
          </ul>
          <div className="mt-4 flex space-x-4">
            <button
              aria-label="back to calendar"
              className="bg-green-200 hover:bg-green-100 text-white p-2 rounded"
              onClick={() => setShowTasks(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            {!isSelectedDatePast && (
              <button
                aria-label="add tasks"
                className="bg-gray-300 hover:bg-gray-200 text-white p-2 rounded-full"
                onClick={() => setShowAddTask(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            )}
          </div>
        </>
      ) : (
        // --- Calendar View ---
        <>
          <div className="flex items-center justify-between mb-4">
            <button
              className="text-gray-600 hover:text-gray-100 dark:text-gray-300 dark:hover:text-light px-2 focus:outline-none"
              onClick={previousMonth}
              aria-label="Previous month"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <div className="flex items-center">
              <span className="text-lg font-semibold text-dark dark:text-light">
                {`${new Date(selectedYear, selectedMonth).toLocaleString(
                  "default",
                  {
                    month: "long",
                  }
                )} ${selectedYear}`}
              </span>
            </div>
            <button
              className="text-gray-200 hover:text-gray-100 dark:text-gray-300 dark:hover:text-light px-2 focus:outline-none"
              onClick={nextMonth}
              aria-label="Next month"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayAbbreviations.map((dayAbbr, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center font-semibold text-sm text-dark dark:text-light"
              >
                {dayAbbr}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={getDayClasses(day)}
                onClick={() =>
                  day &&
                  handleDateChange(new Date(selectedYear, selectedMonth, day))
                }
              >
                {day || ""}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
