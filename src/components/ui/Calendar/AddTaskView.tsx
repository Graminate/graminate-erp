import React, { useState } from "react";
import TextField from "../TextField";
import DropdownSmall from "../Dropdown/DropdownSmall";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/utils/axiosInstance";

type AddTaskViewProps = {
  selectedDate: Date;
  newTask: string;
  setNewTask: (value: string) => void;
  newTaskTime: string;
  setNewTaskTime: (value: string) => void;
  // addTask prop removed
  setShowAddTask: (value: boolean) => void;
  isTaskNameValid: boolean; // Keep for displaying error based on parent's check or manage locally
  setIsTaskNameValid: (value: boolean) => void; // To update parent or manage locally
  // priority and setPriority props removed
  projectInput: string;
  handleProjectInputChange: (value: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  isLoadingSuggestions: boolean; // Renamed from isLoadingSubTypes for clarity if it's just for suggestions
  selectSuggestion: (suggestion: string) => void;
  suggestionsRef: React.RefObject<HTMLDivElement>;
  setShowSuggestions: (value: boolean) => void;
  userId: number;
  projectName: string; // This is the selected project/category
  refreshTasks: () => void; // Callback to refresh tasks in Calendar.tsx
  convertTo24Hour: (time: string) => string; // Utility from parent
  isTodayWithPastTimeCheck: (date: Date, time: string) => boolean; // Utility from parent
  setShowInvalidTimeModal: (value: boolean) => void; // To show modal from parent
};

const AddTaskView = ({
  selectedDate,
  newTask,
  setNewTask,
  newTaskTime,
  setNewTaskTime,
  setShowAddTask,
  isTaskNameValid,
  setIsTaskNameValid,
  projectInput, // This is the current input value for project/category
  handleProjectInputChange,
  suggestions,
  showSuggestions,
  isLoadingSuggestions,
  selectSuggestion,
  suggestionsRef,
  setShowSuggestions,
  userId,
  projectName, // This should be the final selected project for the task
  refreshTasks,
  convertTo24Hour,
  isTodayWithPastTimeCheck,
  setShowInvalidTimeModal,
}: AddTaskViewProps) => {
  const [priority, setPriority] = useState("Medium"); // Local state for priority
  // const [deadline, setDeadline] = useState(""); // Not needed if selectedDate and newTaskTime are used directly
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      setIsTaskNameValid(false); // Update validation state
      Swal.fire("Error", "Task name cannot be empty.", "error");
      return;
    }
    setIsTaskNameValid(true);

    if (isTodayWithPastTimeCheck(selectedDate, newTaskTime)) {
      setShowInvalidTimeModal(true);
      return;
    }

    try {
      setIsLoading(true);
      const datePart = selectedDate.toISOString().split("T")[0];
      const timePart = convertTo24Hour(newTaskTime); // HH:mm

      // Construct a new Date object to correctly get ISO string in local timezone's midnight, then set hours/minutes
      const taskDateTime = new Date(`${datePart}T00:00:00`); // Start with midnight in local timezone
      const [hoursStr, minutesStr] = timePart.split(":");
      taskDateTime.setHours(parseInt(hoursStr, 10), parseInt(minutesStr, 10));

      const isoDeadline = taskDateTime.toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ

      const taskData = {
        user_id: userId,
        project: projectName || projectInput, // Use selected projectName or current input if not formally selected
        task: newTask.trim(),
        status: "To Do", // Default status
        priority,
        deadline: isoDeadline,
      };

      await axiosInstance.post("/tasks/add", taskData);
      Swal.fire("Success", "Task created successfully!", "success");
      refreshTasks(); // Call parent's refresh function
    } catch (error: any) {
      console.error("Error creating task:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create task. Please try again.";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
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
        <div className="relative mb-4">
          <TextField
            label="Category"
            placeholder="Enter task category"
            value={projectInput}
            onChange={handleProjectInputChange}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions &&
            (isLoadingSuggestions ? (
              <p className="text-xs p-2 text-gray-400">
                Loading suggestions...
              </p>
            ) : (
              suggestions.length > 0 && (
                <div
                  ref={suggestionsRef as React.RefObject<HTMLDivElement>}
                  className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg focus:outline-none sm:text-sm"
                >
                  <p className="text-xs p-2 text-gray-300">Suggestions...</p>
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
              )
            ))}
        </div>
        <TextField
          label="Task"
          placeholder="Enter task name..."
          value={newTask}
          onChange={(val) => {
            setNewTask(val);
            if (val.trim()) setIsTaskNameValid(true); // Auto-validate on change
          }}
          errorMessage={
            !isTaskNameValid && !newTask.trim()
              ? "Task name cannot be empty"
              : ""
          }
        />

        <div className="mb-4">
          <DropdownSmall
            label="Priority"
            placeholder="Select priority"
            items={["Low", "Medium", "High"]}
            selected={priority}
            onSelect={(item: string) => setPriority(item)}
          />
        </div>

        <TextField
          label="Time"
          placeholder="Select time"
          value={newTaskTime}
          onChange={setNewTaskTime}
          calendar={true}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddTask}
            disabled={!newTask.trim() || isLoading}
          >
            {isLoading ? "Adding..." : "Add Task"}
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
