import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faTrash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { DisplayTask } from "./Calendar/Calendar";

type TaskListViewProps = {
  selectedDate: Date;
  tasks: DisplayTask[];
  removeTask: (taskId: number) => void;
  setShowTasks: (value: boolean) => void;
  isSelectedDatePast: boolean;
  setShowAddTask: (value: boolean) => void;
  getDayStatus: (date: Date) => string;
  isLoading: boolean;
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
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleBackClick}
          className="p-2 rounded-full text-dark hover:text-light dark:text-light hover:bg-green-200 dark:hover:text-light transition-colors duration-150 ease-in-out"
          aria-label="Back to calendar"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5" />
        </button>
        <h3 className="text-md font-semibold text-gray-800 dark:text-white text-center">
          {getDayStatus(selectedDate)}
        </h3>

        {!isSelectedDatePast ? (
          <button
            aria-label="add tasks"
            className="p-2 rounded-full text-dark hover:text-light dark:text-light hover:bg-green-200 dark:hover:text-light transition-colors duration-150 ease-in-out"
            onClick={handleAddTaskClick}
          >
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-9 h-9"></div>
        )}
      </div>

      <div className="my-6 space-y-3 max-h-60 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <FontAwesomeIcon icon={faSpinner} spin size="lg" className="mr-2" />
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-sm text-gray-300">
            No tasks scheduled for this day.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
            {tasks.map((task) => (
              <li
                key={task.task_id}
                className="py-3 flex justify-between items-center animate-fadeIn"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {task.name}
                  </p>
                </div>
                <button
                  onClick={() => removeTask(task.task_id)}
                  disabled={isSelectedDatePast}
                  className={` p-2 rounded-full text-red-200 hover:text-red-100 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out ${
                    !isSelectedDatePast
                      ? "hover:bg-red-300 dark:hover:bg-red-100"
                      : ""
                  }`}
                  aria-label={`Delete task ${task.name}`}
                >
                  <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskListView;
