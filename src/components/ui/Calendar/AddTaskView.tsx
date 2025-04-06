import React from "react";
import { REMINDER_OPTIONS } from "@/constants/options";
import ClockPicker from "./ClockPicker";
import DropdownSmall from "../Dropdown/DropdownSmall";
import TextField from "../TextField";

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
  isTaskNameValid: boolean;
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
  isTaskNameValid,
}: AddTaskViewProps) => {
  const handleAddTaskClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addTask();
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Add Task
        </h3>
      </div>
      <p className="text-sm text-dark dark:text-light mb-6">
        {selectedDate.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="space-y-5">
        <TextField
          placeholder="Enter task name..."
          value={newTask}
          onChange={setNewTask}
          errorMessage={
            !isTaskNameValid && !newTask.trim()
              ? "Task name cannot be empty"
              : ""
          }
          label="Task Name"
        />

        <div className="relative">
          <label
            htmlFor="time-button"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Time
          </label>
          <button
            id="time-button"
            className={`w-full text-left border ${
              isClockVisible
                ? "border-green-200 ring-1 ring-blue-200"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-200 focus:border-blue-500 flex justify-between items-center`}
            onClick={() => setIsClockVisible(!isClockVisible)}
            aria-haspopup="true"
            aria-expanded={isClockVisible}
          >
            <span>{newTaskTime}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4.586l-3.293 3.293a1 1 0 101.414 1.414L10 10.414V5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {isClockVisible && (
            <div className="absolute z-10 mt-1 w-full sm:w-72 right-0">
              <ClockPicker
                selectedTime={newTaskTime}
                onTimeSelected={(time: string) => {
                  setNewTaskTime(time);
                  setIsClockVisible(false);
                }}
                onCancel={() => setIsClockVisible(false)}
              />
            </div>
          )}
        </div>

        <DropdownSmall
          items={REMINDER_OPTIONS}
          label="Reminder / Alert"
          placeholder="No reminder"
          selected={selectedReminder}
          onSelect={(item: string) => setSelectedReminder(item)}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddTaskClick}
            disabled={!newTask.trim() || !newTaskTime.trim()}
          >
            Add Task
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md text-sm font-medium text-dark bg-gray-500 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
            onClick={() => setShowAddTask(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default AddTaskView;
