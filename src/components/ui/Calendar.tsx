import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ClockPicker from "./ClockPicker";
import TextField from "./TextField";
import DropdownSmall from "./Dropdown/DropdownSmall";
import { REMINDER_OPTIONS } from "@/constants/options";
import { faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Task = {
  name: string;
  time: string;
};

type Tasks = {
  [key: string]: Task[];
};

const Calendar = () => {
  // Main state
  const [tasks, setTasks] = useState<Tasks>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newTask, setNewTask] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("12:00 PM");
  const [isClockVisible, setIsClockVisible] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [isTaskNameValid, setIsTaskNameValid] = useState(true);

  // New state for reminder selection
  const [selectedReminder, setSelectedReminder] = useState<string>("");

  // State for the currently viewed calendar month/year
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // Load and save tasks from/to localStorage
  useEffect(() => {
    const stored = localStorage.getItem("tasks");
    if (stored) {
      setTasks(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Helper to get date key string (YYYY-MM-DD)
  const getDateKey = (date: Date): string => date.toISOString().split("T")[0];

  // Update view when a date is selected
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setShowTasks(true);
    setShowAddTask(false);
  };

  // Add a new task if valid (also disallows adding tasks to past dates)
  const addTask = () => {
    if (!newTask.trim()) {
      setIsTaskNameValid(false);
      return;
    }
    setIsTaskNameValid(true);

    const today = new Date();
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const selectedOnly = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );

    if (selectedOnly < todayOnly) {
      Swal.fire({
        title: "Invalid Date",
        text: "You cannot add tasks to past dates.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const dateKey = getDateKey(selectedDate);
    setTasks((prevTasks) => {
      const dateTasks = prevTasks[dateKey] ? [...prevTasks[dateKey]] : [];
      dateTasks.push({ name: newTask.trim(), time: newTaskTime });
      dateTasks.sort((a, b) => {
        return (
          new Date(`1970-01-01T${convertTo24Hour(a.time)}`).getTime() -
          new Date(`1970-01-01T${convertTo24Hour(b.time)}`).getTime()
        );
      });
      return { ...prevTasks, [dateKey]: dateTasks };
    });

    // Reset form (including reminder)
    setNewTask("");
    setNewTaskTime("12:00 PM");
    setSelectedReminder("");
    setShowAddTask(false);
    setShowTasks(true);
  };

  // Remove a task by its index
  const removeTask = (index: number) => {
    const dateKey = getDateKey(selectedDate);
    setTasks((prev) => {
      const updated = { ...prev };
      if (updated[dateKey]) {
        updated[dateKey].splice(index, 1);
        if (updated[dateKey].length === 0) {
          delete updated[dateKey];
        }
      }
      return updated;
    });
  };

  // Convert time string (e.g. "12:00 PM") to 24-hour format
  const convertTo24Hour = (time: string): string => {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Generate calendar days (array of numbers and null placeholders)
  const generateCalendar = (month: number, year: number): (number | null)[] => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array(firstDay)
      .fill(null)
      .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  };

  const calendarDays = generateCalendar(calendarMonth, calendarYear);

  // Month navigation handlers
  const previousMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
    setShowTasks(false);
    setShowAddTask(false);
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((prev) => prev + 1);
    } else {
      setCalendarMonth((prev) => prev + 1);
    }
    setShowTasks(false);
    setShowAddTask(false);
  };

  // Returns a friendly label for the selected date
  const getDayStatus = (date: Date): string => {
    const today = new Date();
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const tomorrowOnly = new Date(todayOnly);
    tomorrowOnly.setDate(todayOnly.getDate() + 1);
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    if (dateOnly.getTime() === todayOnly.getTime()) return "Today";
    if (dateOnly.getTime() === tomorrowOnly.getTime()) return "Tomorrow";
    return date.toDateString();
  };

  // Determines if the currently selected date is in the past
  const isSelectedDatePast = (() => {
    const selectedOnly = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedOnly < today;
  })();

  const currentDate = new Date();
  const dayAbbreviations = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Return appropriate CSS classes for a day cell
  const getDayClasses = (day: number | null): string => {
    let classes =
      "flex items-center justify-center h-10 w-10 rounded-full text-center text-base font-medium cursor-pointer ";
    if (day === null) {
      classes += "text-gray-400 dark:text-dark cursor-not-allowed ";
    } else {
      if (
        day === selectedDate.getDate() &&
        calendarMonth === selectedDate.getMonth() &&
        calendarYear === selectedDate.getFullYear()
      ) {
        classes += "bg-green-200 text-white ";
      } else if (
        day === currentDate.getDate() &&
        calendarMonth === currentDate.getMonth() &&
        calendarYear === currentDate.getFullYear()
      ) {
        classes += "text-red-200 ";
      } else {
        classes +=
          "hover:bg-gray-300 dark:hover:bg-blue-100 text-dark dark:text-white";
      }
    }
    return classes;
  };

  return (
    <div className="bg-gray-500 dark:bg-gray-700 rounded-lg shadow-lg p-6 w-full dark:text-light relative">
      {showAddTask ? (
        <AddTaskView
          selectedDate={selectedDate}
          newTask={newTask}
          setNewTask={setNewTask}
          newTaskTime={newTaskTime}
          setNewTaskTime={setNewTaskTime}
          isClockVisible={isClockVisible}
          setIsClockVisible={setIsClockVisible}
          addTask={addTask}
          setShowAddTask={setShowAddTask}
          selectedReminder={selectedReminder}
          setSelectedReminder={setSelectedReminder}
        />
      ) : showTasks ? (
        <TaskListView
          selectedDate={selectedDate}
          tasks={tasks[getDateKey(selectedDate)] || []}
          removeTask={removeTask}
          setShowTasks={setShowTasks}
          isSelectedDatePast={isSelectedDatePast}
          setShowAddTask={setShowAddTask}
          getDayStatus={getDayStatus}
        />
      ) : (
        <>
          <CalendarHeader
            calendarMonth={calendarMonth}
            calendarYear={calendarYear}
            previousMonth={previousMonth}
            nextMonth={nextMonth}
          />
          <CalendarGrid
            calendarDays={calendarDays}
            dayAbbreviations={dayAbbreviations}
            getDayClasses={getDayClasses}
            calendarMonth={calendarMonth}
            calendarYear={calendarYear}
            handleDateChange={handleDateChange}
            tasks={tasks}
          />
        </>
      )}
    </div>
  );
};

export default Calendar;

/* ========= Subcomponents ========= */

// View for adding a new task
type AddTaskViewProps = {
  selectedDate: Date;
  newTask: string;
  setNewTask: (value: string) => void;
  newTaskTime: string;
  setNewTaskTime: (value: string) => void;
  isClockVisible: boolean;
  setIsClockVisible: (value: boolean) => void;
  addTask: () => void;
  setShowAddTask: (value: boolean) => void;
  selectedReminder: string;
  setSelectedReminder: (value: string) => void;
};

const AddTaskView = ({
  selectedDate,
  newTask,
  setNewTask,
  newTaskTime,
  setNewTaskTime,
  isClockVisible,
  setIsClockVisible,
  addTask,
  setShowAddTask,
  selectedReminder,
  setSelectedReminder,
}: AddTaskViewProps) => (
  <>
    <h3 className="text-lg font-bold mb-4 text-dark dark:text-light">
      Add Task for {selectedDate.toDateString()}
    </h3>
    <div className="space-y-4">
      <TextField
        placeholder="Title"
        value={newTask}
        onChange={setNewTask}
        errorMessage={!newTask.trim() ? "Task name cannot be empty" : ""}
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
        items={REMINDER_OPTIONS}
        label="Alert"
        placeholder="None"
        selected={selectedReminder}
        onSelect={(item: string) => setSelectedReminder(item)}
      />
      <div className="flex space-x-4">
        <button
          className="bg-green-200 hover:bg-green-800 text-white px-4 py-2 rounded"
          onClick={(e) => {
            e.preventDefault();
            addTask();
          }}
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
);

// View for displaying tasks for a given day
type TaskListViewProps = {
  selectedDate: Date;
  tasks: { name: string; time: string }[];
  removeTask: (index: number) => void;
  setShowTasks: (value: boolean) => void;
  isSelectedDatePast: boolean;
  setShowAddTask: (value: boolean) => void;
  getDayStatus: (date: Date) => string;
};

const TaskListView = ({
  selectedDate,
  tasks,
  removeTask,
  setShowTasks,
  isSelectedDatePast,
  setShowAddTask,
  getDayStatus,
}: TaskListViewProps) => (
  <>
    <h3 className="text-lg font-bold mb-4 text-dark dark:text-light">
      Tasks for {getDayStatus(selectedDate)}
    </h3>
    <ul className="list-disc pl-5 space-y-2">
      {tasks.map((task, index) => (
        <li key={index} className="flex items-center justify-between">
          <span className="text-dark dark:text-light">
            {task.time} - {task.name}
          </span>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => removeTask(index)}
          >
            <FontAwesomeIcon
              icon={faTrash}
              className="size-4 text-red-200 hover:text-red-100"
            />
          </button>
        </li>
      ))}
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
            d="M15.75 19.5L8.25 12l7.5-7.5"
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
);

// Calendar header with month navigation
type CalendarHeaderProps = {
  calendarMonth: number;
  calendarYear: number;
  previousMonth: () => void;
  nextMonth: () => void;
};

const CalendarHeader = ({
  calendarMonth,
  calendarYear,
  previousMonth,
  nextMonth,
}: CalendarHeaderProps) => (
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
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    </button>
    <div className="flex items-center">
      <span className="text-lg font-semibold text-dark dark:text-light">
        {`${new Date(calendarYear, calendarMonth).toLocaleString("default", {
          month: "long",
        })} ${calendarYear}`}
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
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>
  </div>
);

type CalendarGridProps = {
  calendarDays: (number | null)[];
  dayAbbreviations: string[];
  getDayClasses: (day: number | null) => string;
  calendarMonth: number;
  calendarYear: number;
  handleDateChange: (date: Date) => void;
  tasks: Tasks; // ✅ make sure this is here
};

const CalendarGrid = ({
  calendarDays,
  dayAbbreviations,
  getDayClasses,
  calendarMonth,
  calendarYear,
  handleDateChange,
  tasks, // ✅ make sure you are destructuring this here
}: CalendarGridProps) => (
  <>
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
      {calendarDays.map((day, index) => {
        const dateKey =
          day &&
          new Date(calendarYear, calendarMonth, day)
            .toISOString()
            .split("T")[0];

        return (
          <div
            key={index}
            className="relative"
            onClick={() =>
              day &&
              handleDateChange(new Date(calendarYear, calendarMonth, day))
            }
          >
            <div className={getDayClasses(day)}>{day || ""}</div>

            {day && tasks[dateKey!] && tasks[dateKey!].length > 0 && (
              <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-100 rounded-full"></span>
            )}
          </div>
        );
      })}
    </div>
  </>
);
