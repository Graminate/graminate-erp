import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Button from "@/components/ui/Button";
import DropdownSmall from "@/components/ui/Dropdown/DropdownSmall";
import TextArea from "@/components/ui/TextArea";

import SortableItem from "./SortableItem";
import TaskCard from "./TaskCard";
import { Column, Id, Task } from "@/types/types";

type ColumnContainerProps = {
  column: Column;
  tasks: Task[];
  deleteColumn?: (id: Id) => void;
  updateColumnTitle?: (id: Id, title: string) => void;
  openTicketModal: (colId: Id) => void;
  columnLimits: Record<Id, string>;
  addTask: (columnId: Id, title: string, type: string) => void;
  dropdownItems: string[];
  openTaskModal: (task: Task) => void;
  toggleDropdown: (colId: Id, taskId: Id) => void;
  deleteTask: (taskId: Id) => void;
  openLabelPopup: (taskId: Id) => void;
  dropdownOpen: { colId: Id; taskId: Id } | null;
  isOverlay?: boolean;
};

const ColumnContainer = ({
  column,
  tasks,
  deleteColumn,
  updateColumnTitle,
  openTicketModal,
  columnLimits,
  addTask,
  dropdownItems,
  openTaskModal,
  toggleDropdown,
  deleteTask,
  openLabelPopup,
  dropdownOpen,
  isOverlay = false,
}: ColumnContainerProps) => {
  const [editMode, setEditMode] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState("");
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const toggleColumnDropdownInternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setColumnDropdownOpen((prev) => !prev);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      Swal.fire("Error", "Task title cannot be empty.", "error");
      return;
    }
    addTask(column.id, newTaskTitle, newTaskType);
    setNewTaskTitle("");
    setNewTaskType("");
    setIsAddingTask(false);
  };

  const columnLimit = columnLimits[column.id]
    ? parseInt(columnLimits[column.id], 10)
    : Infinity;
  const limitExceeded = !isNaN(columnLimit) && tasks.length > columnLimit;

  return (
    <div
      className={`bg-gray-500 dark:bg-gray-800 shadow-md rounded-lg p-3 w-full sm:w-[270px] flex-shrink-0 flex flex-col max-h-[calc(100vh-240px)] ${
        isOverlay ? "opacity-90 cursor-grabbing" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2 flex-grow min-w-0">
          {!editMode ? (
            <h2
              title={column.title}
              className="text-sm font-semibold dark:text-light cursor-pointer truncate"
              onClick={() => !isOverlay && setEditMode(true)}
            >
              {column.title}
            </h2>
          ) : (
            <input
              type="text"
              value={column.title}
              onChange={(e) =>
                updateColumnTitle &&
                updateColumnTitle(column.id, e.target.value)
              }
              onBlur={() => setEditMode(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") setEditMode(false);
              }}
              autoFocus
              className="bg-transparent border-b border-gray-400 dark:border-gray-600 focus:outline-none text-sm font-semibold dark:text-light w-full"
            />
          )}
          <span
            className={`text-xs ${
              limitExceeded ? "text-light bg-red-200" : "text-light bg-blue-200"
            } dark:bg-gray-700 rounded-full px-2 py-0.5 flex-shrink-0`}
          >
            {tasks.length}
            {columnLimits[column.id] && ` / ${columnLimits[column.id]}`}
          </span>
        </div>
        {!isOverlay && (
          <div className="relative flex-shrink-0">
            <button
              aria-label="column-ellipsis"
              className="dark:text-light hover:bg-gray-300 dark:hover:bg-gray-700 rounded p-1"
              onClick={toggleColumnDropdownInternal}
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
            {columnDropdownOpen && (
              <div
                className="absolute right-0 mt-1 bg-white dark:bg-gray-800 w-36 shadow-lg rounded text-sm text-gray-800 dark:text-light z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="block hover:bg-gray-400 dark:hover:bg-gray-700 px-4 py-2 rounded-t w-full text-left"
                  onClick={() => {
                    openTicketModal(column.id);
                    setColumnDropdownOpen(false);
                  }}
                >
                  Set column limit
                </button>
                {/* <button
                  className="block hover:bg-gray-400 dark:hover:bg-gray-700 px-4 py-2 rounded-b w-full text-left text-red-200"
                  onClick={() => {
                    deleteColumn && deleteColumn(column.id);
                    setColumnDropdownOpen(false);
                  }}
                >
                  Delete Column
                </button> */}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto overflow-x-hidden space-y-3 mb-3 pr-1">
        <SortableContext
          items={tasksIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableItem key={task.id} id={task.id}>
              <TaskCard
                task={task}
                openTaskModal={openTaskModal}
                toggleDropdown={toggleDropdown}
                deleteTask={deleteTask}
                openLabelPopup={openLabelPopup}
                dropdownOpen={dropdownOpen}
              />
            </SortableItem>
          ))}
        </SortableContext>
      </div>

      {!isOverlay && (
        <>
          {isAddingTask ? (
            <div className="mt-auto py-3 bg-gray-500 dark:bg-gray-700">
              <div className="border border-gray-300 dark:border-gray-300 rounded-lg">
                <TextArea
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={setNewTaskTitle}
                />
              </div>

              <div className="mt-3 flex flex-col mx-auto gap-2">
                <DropdownSmall
                  items={dropdownItems}
                  direction="down"
                  placeholder="Label (Optional)"
                  selected={newTaskType}
                  onSelect={setNewTaskType}
                />

                <div className="flex justify-start gap-2 ">
                  <Button
                    text="Add"
                    style="primary"
                    width="large"
                    onClick={handleAddTask}
                  />
                  <Button
                    text="Cancel"
                    style="secondary"
                    width="large"
                    onClick={() => setIsAddingTask(false)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-auto pt-2">
              <Button
                text="Create Issue"
                style="primary"
                add
                width="large"
                onClick={() => setIsAddingTask(true)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ColumnContainer;
