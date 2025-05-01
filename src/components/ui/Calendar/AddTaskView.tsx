import React from "react";
import ClockPicker from "./ClockPicker";
import TextField from "../TextField";
import DropdownSmall from "../Dropdown/DropdownSmall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";

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
  priority: string;
  setPriority: (value: string) => void;
  projectInput: string;
  handleProjectInputChange: (value: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  isLoadingSuggestions: boolean;
  selectSuggestion: (suggestion: string) => void;
  suggestionsRef: React.RefObject<HTMLDivElement>;
  setShowSuggestions: (value: boolean) => void;
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
  isTaskNameValid,
  priority,
  setPriority,
  projectInput,
  handleProjectInputChange,
  suggestions,
  showSuggestions,
  selectSuggestion,
  suggestionsRef,
  setShowSuggestions,
}: AddTaskViewProps) => {
  const handleAddTaskClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addTask();
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
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
          label="Task"
          placeholder="Enter task name..."
          value={newTask}
          onChange={setNewTask}
          errorMessage={
            !isTaskNameValid && !newTask.trim()
              ? "Task name cannot be empty"
              : ""
          }
        />

        <div className="relative mb-4">
          <TextField
            label="Task Category"
            placeholder="Enter task category"
            value={projectInput}
            onChange={handleProjectInputChange}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef as React.RefObject<HTMLDivElement>}
              className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg focus:outline-none sm:text-sm"
            >
              {suggestions.map((suggestion: string, index: number) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-500 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-800 dark:text-gray-200"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <DropdownSmall
            label="Priority"
            placeholder="Select priority"
            items={["Low", "Medium", "High"]}
            selected={priority}
            onSelect={(item: string) => setPriority(item)}
          />
        </div>

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
            <FontAwesomeIcon icon={faClock} className="size-5 text-gray-300" />
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
