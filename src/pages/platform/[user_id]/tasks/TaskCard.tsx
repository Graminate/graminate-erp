import { Id, Task } from "@/types/types";
import React, { useState } from "react";


type TaskCardProps = {
  task: Task;
  openTaskModal: (task: Task) => void;
  toggleDropdown: (colId: Id, taskId: Id) => void;
  deleteTask: (taskId: Id) => void;
  openLabelPopup: (taskId: Id) => void;
  dropdownOpen: { colId: Id; taskId: Id } | null;
  isOverlay?: boolean;
};

const TaskCard = ({
  task,
  openTaskModal,
  toggleDropdown,
  deleteTask,
  openLabelPopup,
  dropdownOpen,
  isOverlay = false,
}: TaskCardProps) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-gray-700 p-3 rounded-md shadow relative ${
        isOverlay ? "cursor-grabbing" : "cursor-pointer"
      } touch-manipulation`}
      onMouseEnter={() => !isOverlay && setIsHovering(true)}
      onMouseLeave={() => !isOverlay && setIsHovering(false)}
      onClick={(e) => {
        if (isOverlay) return;
        const target = e.target as HTMLElement;
        if (!target.closest('[aria-label="ellipsis"]')) {
          openTaskModal(task);
        }
      }}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium dark:text-light mr-2 break-words">
          {task.title}
        </p>
        {!isOverlay && isHovering && (
          <div className="relative flex-shrink-0">
            <button
              aria-label="ellipsis"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-light p-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown(task.columnId, task.id);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 12a.75.75 0 111.5 0 .75.75 0 01-1.5 0zm5 0a.75.75 0 111.5 0 .75.75 0 01-1.5 0zm5 0a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"
                />
              </svg>
            </button>
            {dropdownOpen &&
              dropdownOpen.colId === task.columnId &&
              dropdownOpen.taskId === task.id && (
                <div
                  className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 shadow-lg rounded text-sm text-gray-800 dark:text-light z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="block hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-t w-full text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLabelPopup(task.id);
                    }}
                  >
                    Add label
                  </button>
                  <button
                    className="block hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-b w-full text-left text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
          </div>
        )}
      </div>
      {task.type && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.type.split(",").map((label) =>
            label.trim() ? (
              <span
                key={label.trim()}
                className="text-xs bg-gray-300 text-light px-2.5 py-1 rounded-full dark:bg-gray-900 dark:text-light"
              >
                {label.trim()}
              </span>
            ) : null
          )}
        </div>
      )}
      <div className="flex justify-end mt-1">
        <span className="text-xs text-dark dark:text-light ">
          Task-
          {typeof task.id === "string" && task.id.startsWith("task-")
            ? task.id.toUpperCase()
            : task.id}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
