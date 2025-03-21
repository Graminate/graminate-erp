import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import CalendarGrid from "./CalendarGrid";
import CalendarHeader from "./CalendarHeader";
import TaskListView from "../TaskListView";
import AddTaskView from "./AddTaskView";

type Task = {
  name: string;
  time: string;
};

type Tasks = {
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
  let [hours, minutes] = timePart.split(":").map(Number);
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  const taskTime = new Date(date);
  taskTime.setHours(hours, minutes, 0, 0);
  return taskTime < now;
};

const Calendar = () => {
  const [tasks, setTasks] = useState<Tasks>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newTask, setNewTask] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("12:00 PM");
  const [isClockVisible, setIsClockVisible] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [isTaskNameValid, setIsTaskNameValid] = useState(true);
  const [selectedReminder, setSelectedReminder] = useState<string>("");
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const stored = localStorage.getItem("tasks");
    if (stored) {
      setTasks(JSON.parse(stored));
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

    setNewTask("");
    setNewTaskTime("12:00 PM");
    setSelectedReminder("");
    setShowAddTask(false);
    setShowTasks(true);
  };

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

  const convertTo24Hour = (time: string): string => {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
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

  const canAddTask = !isTodayWithPastTime(selectedDate, newTaskTime);

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
          canAddTask={canAddTask}
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