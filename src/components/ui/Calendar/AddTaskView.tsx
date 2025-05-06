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
  addTask: () => void;
  setShowAddTask: (value: boolean) => void;
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
  userId: number;
  projectName: string;
  refreshTasks: () => void;
};

const AddTaskView = ({
  selectedDate,
  newTask,
  setNewTask,
  newTaskTime,
  setNewTaskTime,
  setShowAddTask,
  isTaskNameValid,
  projectInput,
  handleProjectInputChange,
  suggestions,
  showSuggestions,
  selectSuggestion,
  suggestionsRef,
  setShowSuggestions,
  userId,
  projectName,
  refreshTasks,
}: AddTaskViewProps) => {
  const [priority, setPriority] = useState("Medium");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      Swal.fire("Error", "Task name cannot be empty", "error");
      return;
    }

    try {
      setIsLoading(true);
      const taskData = {
        user_id: userId,
        project: projectName,
        task: newTask.trim(),
        status: "To Do",
        priority,
        deadline: deadline || null,
      };

      const response = await axiosInstance.post("/tasks/add", taskData);

      Swal.fire("Success", "Task created successfully", "success");
      refreshTasks();
    } catch (error) {
      console.error("Error creating task:", error);
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
          {showSuggestions && suggestions.length > 0 && (
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
          )}
        </div>
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
