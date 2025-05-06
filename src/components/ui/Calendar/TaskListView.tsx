import React from "react";
import { DisplayTask } from "./Calendar"; // Updated import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faTrash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

type TaskListViewProps = {
  selectedDate: Date;
  tasks: DisplayTask[];
  removeTask: (taskId: number) => void;
  setShowTasks: (value: boolean) => void;
  isSelectedDatePast: boolean;
  setShowAddTask: (value: boolean) => void;
  getDayStatus: (date: Date) => string;
  isLoading: boolean; // Added isLoading prop here
};

const TaskListView = ({
  selectedDate,
  tasks,
  removeTask,
  setShowTasks,
  isSelectedDatePast,
  setShowAddTask,
  getDayStatus,
  isLoading,
}: TaskListViewProps) => {
  const handleAddTaskClick = () => {
    setShowAddTask(true);
  };

  const handleBackClick = () => {
    setShowTasks(false);
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleBackClick}
          className="p-2 rounded-full text-dark hover:text-light dark:text-light hover:bg-green-200 dark:hover:text-light transition-colors duration-150 ease-in-out"
          aria-label="Back to calendar"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white text-center">
          Tasks for {getDayStatus(selectedDate)}
        </h3>
        <div className="w-9 h-9"></div> {/* Spacer */}
      </div>

      {/* Task List */}
      <div className="my-6 space-y-3 max-h-60 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <FontAwesomeIcon icon={faSpinner} spin size="lg" className="mr-2" />
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 italic">
            No tasks scheduled for this day.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
            {tasks.map(
              (
                task // task is now DisplayTask
              ) => (
                <li
                  key={task.task_id} // Use task_id as key
                  className="py-3 flex justify-between items-center animate-fadeIn"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.name} {/* Mapped from task.task */}
                    </p>
                  </div>
                  <button
                    onClick={() => removeTask(task.task_id)} // Pass task_id
                    disabled={isSelectedDatePast}
                    className={`ml-4 p-2 rounded-full text-red-500 hover:text-red-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out ${
                      !isSelectedDatePast
                        ? "hover:bg-red-100 dark:hover:bg-red-900"
                        : ""
                    }`}
                    aria-label={`Delete task ${task.name}`}
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                  </button>
                </li>
              )
            )}
          </ul>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleAddTaskClick}
          disabled={isSelectedDatePast} // Disable if the selected date is in the past
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
          Add Task
        </button>
      </div>
    </div>
  );
};

export default TaskListView;
