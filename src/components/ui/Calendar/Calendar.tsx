import React, { useState, useEffect, useRef } from "react";
import CalendarGrid from "./CalendarGrid";
import CalendarHeader from "./CalendarHeader";
import TaskListView from "../TaskListView";
import AddTaskView from "./AddTaskView";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useRouter } from "next/router";
import InfoModal from "@/components/modals/InfoModal";

export type Task = {
  name: string;
  time: string;
};

export type Tasks = {
  [key: string]: Task[];
};

const isTodayWithPastTime = (date: Date, time: string): boolean => {
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (!isToday) return false;
  const [timePart, modifier] = time.split(" ");
  const timeParts = timePart.split(":").map(Number);
  let hours = timeParts[0];
  const minutes = timeParts[1];
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  const taskTime = new Date(date);
  taskTime.setHours(hours, minutes, 0, 0);
  return taskTime < now;
};

const Calendar = () => {
  const router = useRouter();
  const { user_id } = router.query;

  const [tasks, setTasks] = useState<Tasks>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newTask, setNewTask] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("12:00 PM");
  const [showTasks, setShowTasks] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [isTaskNameValid, setIsTaskNameValid] = useState(true);
  const [selectedReminder, setSelectedReminder] = useState<string>("");
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [priority, setPriority] = useState<string>("Medium");
  const [projectInput, setProjectInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [isLoadingSubTypes, setIsLoadingSubTypes] = useState(true);
  const [showInvalidTimeModal, setShowInvalidTimeModal] = useState(false);

  const suggestionsRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const fetchUserSubTypes = async () => {
      setIsLoadingSubTypes(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        const response = await axiosInstance.get(`/user/${user_id}`);

        const user = response.data?.data?.user ?? response.data?.user;
        if (!user) throw new Error("User payload missing");

        setSubTypes(Array.isArray(user.sub_type) ? user.sub_type : []);
      } catch (err) {
        console.error("Error fetching user sub_types:", err);
        setSubTypes([]);
      } finally {
        setIsLoadingSubTypes(false);
      }
    };

    if (user_id) {
      fetchUserSubTypes();
    }
  }, [user_id]);

  const handleProjectInputChange = (value: string) => {
    setProjectInput(value);
    if (value.length > 0) {
      const filtered = subTypes.filter((subType) =>
        subType.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions(subTypes);
      setShowSuggestions(true);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setProjectInput(suggestion);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("tasks");
    if (stored) {
      try {
        const parsedTasks = JSON.parse(stored);
        setTasks(parsedTasks);
      } catch (error) {
        console.error("Failed to parse tasks from localStorage", error);
        setTasks({});
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const getDateKey = (date: Date): string => date.toISOString().split("T")[0];

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setShowTasks(true);
    setShowAddTask(false);
  };

  const addTask = () => {
    if (!newTask.trim()) {
      setIsTaskNameValid(false);
      return;
    }
    setIsTaskNameValid(true);

    if (isTodayWithPastTime(selectedDate, newTaskTime)) {
      setShowInvalidTimeModal(true);
      return;
    }

    const dateKey = getDateKey(selectedDate);
    const newTaskObject = { name: newTask.trim(), time: newTaskTime };

    setTasks((prevTasks) => {
      const dateTasks = prevTasks[dateKey] ? [...prevTasks[dateKey]] : [];
      dateTasks.push(newTaskObject);
      dateTasks.sort((a, b) => {
        return (
          new Date(`1970-01-01T${convertTo24Hour(a.time)}`).getTime() -
          new Date(`1970-01-01T${convertTo24Hour(b.time)}`).getTime()
        );
      });
      return { ...prevTasks, [dateKey]: dateTasks };
    });

    setNewTask("");
    setNewTaskTime("12:00 PM");
    setSelectedReminder("");
    setShowAddTask(false);
    setShowTasks(true);
  };

  const removeTask = (indexToRemove: number) => {
    const dateKey = getDateKey(selectedDate);
    setTasks((prev) => {
      const updatedTasks = { ...prev };

      if (updatedTasks[dateKey]) {
        const updatedDateTasks = updatedTasks[dateKey].filter(
          (_, index) => index !== indexToRemove
        );

        if (updatedDateTasks.length === 0) {
          delete updatedTasks[dateKey];
        } else {
          updatedTasks[dateKey] = updatedDateTasks;
        }
      }
      return updatedTasks;
    });
  };

  const convertTo24Hour = (time: string): string => {
    const [timePart, modifier] = time.split(" ");
    const timeParts = timePart.split(":").map(Number);
    let hours = timeParts[0];
    const minutes = timeParts[1];
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const generateCalendar = (month: number, year: number): (number | null)[] => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array(firstDay)
      .fill(null)
      .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  };

  const calendarDays = generateCalendar(calendarMonth, calendarYear);

  const previousMonth = () => {
    setCalendarMonth((prev) => {
      if (prev === 0) {
        setCalendarYear(calendarYear - 1);
        return 11;
      }
      return prev - 1;
    });
    setShowTasks(false);
    setShowAddTask(false);
  };

  const nextMonth = () => {
    setCalendarMonth((prev) => {
      if (prev === 11) {
        setCalendarYear(calendarYear + 1);
        return 0;
      }
      return prev + 1;
    });
    setShowTasks(false);
    setShowAddTask(false);
  };

  const getDayStatus = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === today.getTime()) return "Today";
    if (checkDate.getTime() === tomorrow.getTime()) return "Tomorrow";
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  const getDayClasses = (day: number | null): string => {
    let classes =
      "flex items-center justify-center h-10 w-10 rounded-full text-center text-sm font-medium transition-colors duration-150 ease-in-out cursor-pointer ";
    const currentDay = new Date(calendarYear, calendarMonth, day ?? 0);
    currentDay.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (day === null) {
      classes += "text-gray-300 dark:text-gray-600 cursor-default ";
    } else {
      const isSelected =
        day === selectedDate.getDate() &&
        calendarMonth === selectedDate.getMonth() &&
        calendarYear === selectedDate.getFullYear();
      const isToday =
        day === currentDate.getDate() &&
        calendarMonth === currentDate.getMonth() &&
        calendarYear === currentDate.getFullYear();
      const isPast = currentDay < today;

      if (isSelected) {
        classes += "bg-green-200 text-white shadow-md ";
      } else if (isToday) {
        classes +=
          "text-dark dark:text-light dark:border-blue-400 hover:bg-green-300 dark:hover:bg-green-100 ";
      } else if (isPast) {
        classes +=
          "text-dark dark:text-light cursor-default hover:bg-gray-400 dark:hover:bg-gray-600 ";
      } else {
        classes +=
          "text-gray-700 dark:text-light hover:bg-gray-400 dark:hover:bg-gray-600 ";
      }
    }
    return classes;
  };

  const canAddTaskCheck = !isTodayWithPastTime(selectedDate, newTaskTime);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl mx-auto text-gray-800 dark:text-gray-100 relative min-h-[400px]">
      <InfoModal
        isOpen={showInvalidTimeModal}
        onClose={() => setShowInvalidTimeModal(false)}
        title="Invalid Time"
        text="You cannot add tasks to past times on the current day."
        variant="error"
        confirmButtonText="OK"
      />
      {showAddTask ? (
        <AddTaskView
          selectedDate={selectedDate}
          newTask={newTask}
          setNewTask={setNewTask}
          newTaskTime={newTaskTime}
          setNewTaskTime={setNewTaskTime}
          addTask={addTask}
          setShowAddTask={setShowAddTask}
          isTaskNameValid={isTaskNameValid}
          priority={priority}
          setPriority={setPriority}
          projectInput={projectInput}
          handleProjectInputChange={handleProjectInputChange}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          isLoadingSuggestions={isLoadingSubTypes}
          selectSuggestion={selectSuggestion}
          suggestionsRef={suggestionsRef}
          setShowSuggestions={setShowSuggestions}
          userId={Number(user_id)}
          projectName={projectInput}
          refreshTasks={() => {
            setShowAddTask(false);
          }}
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
          canAddTask={canAddTaskCheck}
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
            getDateKey={getDateKey}
          />
        </>
      )}
    </div>
  );
};

export default Calendar;
