import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import Button from "@/components/ui/Button";
import TicketModal from "@/components/modals/TicketModal";
import TaskModal from "@/components/modals/TaskModal";
import DropdownFilter from "@/components/ui/Dropdown/DropdownFilter";
import DropdownSmall from "@/components/ui/Dropdown/DropdownSmall";
import SearchBar from "@/components/ui/SearchBar";
import TextArea from "@/components/ui/TextArea";
import TextField from "@/components/ui/TextField";
import PlatformLayout from "@/layout/PlatformLayout";
import TicketView from "@/components/ui/Switch/TicketView";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";
import Head from "next/head";

type Id = string | number;

type Task = {
  id: Id;
  columnId: Id;
  title: string;
  type: string;
};

type Column = {
  id: Id;
  title: string;
};

type SortableItemProps = {
  id: Id;
  children: React.ReactNode;
  isColumn?: boolean;
};

const SortableItem = ({
  id,
  children,
  isColumn = false,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: isColumn ? "Column" : "Task",
      item: { id },
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "manipulation",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

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
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 12a.75.75 0 111.5 0 .75.75 0 01-1.5 0zm5 0a.75.75 0 111.5 0 .75.75 0 01-1.5 0zm5 0a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"
                />{" "}
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

type ColumnContainerProps = {
  column: Column;
  tasks: Task[];
  deleteColumn: (id: Id) => void;
  updateColumnTitle: (id: Id, title: string) => void;
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
      className={`bg-gray-500 dark:bg-gray-800 shadow-md rounded-lg p-3 w-[300px] flex-shrink-0 flex flex-col max-h-[calc(100vh-240px)] ${
        isOverlay ? "opacity-90 cursor-grabbing" : ""
      }`}
    >
      <div className={`flex justify-between items-center mb-3 px-1`}>
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
              onChange={(e) => updateColumnTitle(column.id, e.target.value)}
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
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 12a.75.75 0 111.5 0 .75.75 0 01-1.5 0zm5 0a.75.75 0 111.5 0 .75.75 0 01-1.5 0zm5 0a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"
                />{" "}
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
                <button
                  className="block hover:bg-gray-400 dark:hover:bg-gray-700 px-4 py-2 rounded-b w-full text-left text-red-200"
                  onClick={() => {
                    deleteColumn(column.id);
                    setColumnDropdownOpen(false);
                  }}
                >
                  Delete Column
                </button>
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
            <div className="mt-auto p-3 bg-gray-500 dark:bg-gray-700">
              <div className="border border-gray-300 dark:border-gray-300 rounded-lg">
                <TextArea
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={setNewTaskTitle}
                />
              </div>

              <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex flex-row">
                  <DropdownSmall
                    items={dropdownItems}
                    direction="up"
                    placeholder="Label (Optional)"
                    selected={newTaskType}
                    onSelect={setNewTaskType}
                  />
                </div>

                <Button
                  text="Add"
                  style="primary"
                  width="small"
                  onClick={handleAddTask}
                />
                <Button
                  text="Cancel"
                  style="ghost"
                  width="small"
                  onClick={() => setIsAddingTask(false)}
                />
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

type TaskListViewProps = {
  tasks: Task[];
  columns: Column[];
  openTaskModal: (task: Task) => void;
};

const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  columns,
  openTaskModal,
}) => {
  const getColumnName = (columnId: Id) => {
    return columns.find((col) => col.id === columnId)?.title || "Unknown";
  };

  const handleRowClick = (task: Task) => {
    openTaskModal(task);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center text-dark dark:text-light py-8">
        No tasks found matching your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6">
              ID
            </th>
            <th scope="col" className="py-3 px-6">
              Summary
            </th>
            <th scope="col" className="py-3 px-6">
              Status
            </th>
            <th scope="col" className="py-3 px-6">
              Labels
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
              onClick={() => handleRowClick(task)}
            >
              <th
                scope="row"
                className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {task.id}
              </th>
              <td className="py-4 px-6 text-dark dark:text-light">
                {task.title}
              </td>
              <td className="py-4 px-6 text-dark dark:text-light">
                {getColumnName(task.columnId)}
              </td>
              <td className="py-4 px-6 text-dark dark:text-light">
                {task.type
                  ? task.type.split(",").map((label) =>
                      label.trim() ? (
                        <span
                          key={label.trim()}
                          className="text-xs bg-gray-300 text-light px-2.5 py-1.5 rounded-full dark:bg-gray-700 dark:text-light mr-1 mb-1 inline-block"
                        >
                          {label.trim()}
                        </span>
                      ) : null
                    )
                  : "None"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TasksPage: React.FC = () => {
  const router = useRouter();
  const { user_id, id: projectId } = router.query;
  const projectTitle =
    typeof router.query.title === "string" ? router.query.title : "";

  // --- Initial State ---
  const initialColumns: Column[] = [
    { id: "todo", title: "TO DO" },
    { id: "progress", title: "IN PROGRESS" },
    { id: "done", title: "DONE" },
  ];

  const initialTasks: Task[] = [
    {
      id: 1,
      columnId: "todo",
      title: "Analyze user requirements for the new dashboard feature",
      type: "Research",
    },
    {
      id: 2,
      columnId: "todo",
      title: "Create initial wireframes based on requirements",
      type: "Design",
    },
    {
      id: 3,
      columnId: "progress",
      title: "Develop user authentication module",
      type: "Dev, Urgent",
    },
    {
      id: 4,
      columnId: "progress",
      title: "Set up CI/CD pipeline",
      type: "DevOps",
    },
    {
      id: 5,
      columnId: "done",
      title: "Setup project repository on GitHub",
      type: "Setup",
    },
  ];

  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [isListView, setIsListView] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<{
    colId: Id;
    taskId: Id;
  } | null>(null);
  const [isLabelPopupOpen, setIsLabelPopupOpen] = useState(false);
  const [selectedTaskIdForLabel, setSelectedTaskIdForLabel] =
    useState<Id | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeColumnIdForModal, setActiveColumnIdForModal] =
    useState<Id | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [columnLimits, setColumnLimits] = useState<Record<Id, string>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterLabels, setSelectedFilterLabels] = useState<string[]>(
    []
  );
  const [dropdownItems, setDropdownItems] = useState<string[]>(() => {
    const labelsFromTasks = initialTasks.flatMap((t) =>
      t.type ? t.type.split(",").map((l) => l.trim()) : []
    );
    return [
      ...new Set([
        ...labelsFromTasks,
        "Finance",
        "Maintenance",
        "Research",
        "Urgent",
        "Design",
        "Dev",
        "Setup",
        "Bug",
        "DevOps",
      ]),
    ].filter(Boolean);
  });

  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(typeof document !== "undefined");
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const taskLabels = task.type
        ? task.type.split(",").map((l) => l.trim().toLowerCase())
        : [];
      const filterLabelsLower = selectedFilterLabels.map((l) =>
        l.toLowerCase()
      );
      const searchLower = searchQuery.toLowerCase().trim();
      const labelMatch =
        filterLabelsLower.length === 0 ||
        filterLabelsLower.some((label) => taskLabels.includes(label));
      const searchMatch =
        !searchLower ||
        task.title.toLowerCase().includes(searchLower) ||
        String(task.id).toLowerCase().includes(searchLower);
      return labelMatch && searchMatch;
    });
  }, [tasks, searchQuery, selectedFilterLabels]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const generateId = (prefix: string = "item") => {
    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;
  };

  const addNewColumn = () => {
    const title = newColumnTitle.trim();
    if (!title) {
      Swal.fire("Error", "Column title is required", "error");
      return;
    }
    const newCol: Column = {
      id: generateId("col"),
      title: title,
    };
    setColumns((prev) => [...prev, newCol]);
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  const deleteColumn = (id: Id) => {
    const columnToDelete = columns.find((col) => col.id === id);
    const tasksInColumn = tasks.filter((task) => task.columnId === id).length;

    Swal.fire({
      title: `Delete "${columnToDelete?.title}"?`,
      text: `This column has ${tasksInColumn} task(s). Deleting the column will also delete all its tasks! This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setColumns((prev) => prev.filter((col) => col.id !== id));
        setTasks((prev) => prev.filter((task) => task.columnId !== id));
        setColumnLimits((prev) => {
          const newLimits = { ...prev };
          delete newLimits[id];
          return newLimits;
        });
        Swal.fire(
          "Deleted!",
          "Column and its tasks have been deleted.",
          "success"
        );
      }
    });
  };

  const updateColumnTitle = (id: Id, title: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, title: title } : col))
    );
  };

  const addTask = (columnId: Id, title: string, type: string) => {
    const newTask: Task = {
      id: generateId("task"),
      columnId,
      title: title.trim(),
      type: type.trim() || "",
    };
    setTasks((prev) => [...prev, newTask]);
    const newLabel = type.trim();
    if (
      newLabel &&
      !dropdownItems
        .map((item) => item.toLowerCase())
        .includes(newLabel.toLowerCase())
    ) {
      setDropdownItems((prev) => [...prev, newLabel].sort());
    }
  };

  const deleteTask = (taskId: Id) => {
    Swal.fire({
      title: "Delete Task?",
      text: "Are you sure you want to delete this task?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
        setDropdownOpen(null);
      }
    });
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    const labels = updatedTask.type
      ? updatedTask.type
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
      : [];
    labels.forEach((label) => {
      if (
        !dropdownItems
          .map((item) => item.toLowerCase())
          .includes(label.toLowerCase())
      ) {
        setDropdownItems((prev) => [...prev, label].sort());
      }
    });
  };

  const openLabelPopup = (taskId: Id) => {
    setSelectedTaskIdForLabel(taskId);
    setNewLabel("");
    setIsLabelPopupOpen(true);
    setDropdownOpen(null);
  };

  const toggleLabelPopup = () => {
    setIsLabelPopupOpen((prev) => !prev);
  };

  const addLabel = () => {
    const labelToAdd = newLabel.trim();
    if (!labelToAdd || !selectedTaskIdForLabel) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === selectedTaskIdForLabel) {
          const currentLabels = task.type
            ? task.type
                .split(",")
                .map((l) => l.trim())
                .filter(Boolean)
            : [];
          if (
            !currentLabels
              .map((l) => l.toLowerCase())
              .includes(labelToAdd.toLowerCase())
          ) {
            if (
              !dropdownItems
                .map((i) => i.toLowerCase())
                .includes(labelToAdd.toLowerCase())
            ) {
              setDropdownItems((prev) => [...prev, labelToAdd].sort());
            }
            const newType = [...currentLabels, labelToAdd].join(", ");
            return { ...task, type: newType };
          }
        }
        return task;
      })
    );
    setNewLabel("");
  };

  const openTicketModal = (colId: Id) => {
    setActiveColumnIdForModal(colId);
    setIsTicketModalOpen(true);
  };

  const closeTicketModal = () => {
    setIsTicketModalOpen(false);
    setActiveColumnIdForModal(null);
  };

  const saveColumnLimit = (limit: string) => {
    if (activeColumnIdForModal !== null) {
      const parsedLimit = limit.trim();
      if (parsedLimit === "" || /^\d+$/.test(parsedLimit)) {
        setColumnLimits((prev) => ({
          ...prev,
          [activeColumnIdForModal]: parsedLimit,
        }));
        closeTicketModal();
      } else {
        Swal.fire(
          "Invalid Limit",
          "Please enter a positive number or leave blank for no limit.",
          "error"
        );
        return;
      }
    } else {
      closeTicketModal();
    }
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const toggleDropdown = (colId: Id, taskId: Id) => {
    setDropdownOpen((prev) =>
      prev && prev.colId === colId && prev.taskId === taskId
        ? null
        : { colId, taskId }
    );
  };

  const handlePageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest('[aria-label="ellipsis"]') &&
      !target.closest('.absolute[class*="bg-white"]')
    ) {
      setDropdownOpen(null);
    }
    if (
      !target.closest("#add-column-form") &&
      !target.closest('[aria-label="add-column"]')
    ) {
      setIsAddingColumn(false);
      setNewColumnTitle("");
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDropdownOpen(null);

    if (active.data.current?.type === "Column") {
      setActiveColumn(columns.find((col) => col.id === active.id) || null);
      setActiveTask(null);
    } else if (active.data.current?.type === "Task") {
      setActiveTask(tasks.find((task) => task.id === active.id) || null);
      setActiveColumn(null);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (isActiveATask) {
      const activeTask = tasks.find((t) => t.id === activeId);
      if (!activeTask) return;

      if (isOverAColumn) {
        if (activeTask.columnId !== overId) {
          setTasks((prevTasks) => {
            const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
            if (activeIndex === -1) return prevTasks;
            const updatedTasks = [...prevTasks];
            updatedTasks[activeIndex] = {
              ...updatedTasks[activeIndex],
              columnId: overId,
            };
            return updatedTasks;
          });
        }
      } else if (isOverATask) {
        const overTask = tasks.find((t) => t.id === overId);
        if (!overTask) return;
        if (activeTask.columnId !== overTask.columnId) {
          setTasks((prevTasks) => {
            const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
            if (activeIndex === -1) return prevTasks;
            const updatedTasks = [...prevTasks];
            updatedTasks[activeIndex] = {
              ...updatedTasks[activeIndex],
              columnId: overTask.columnId,
            };
            return updatedTasks;
          });
        }
      }
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    const isActiveAColumn = active.data.current?.type === "Column";
    const isActiveATask = active.data.current?.type === "Task";

    if (isActiveAColumn) {
      setColumns((currentColumns) => {
        const activeColumnIndex = currentColumns.findIndex(
          (col) => col.id === activeId
        );
        const overColumnIndex = currentColumns.findIndex(
          (col) => col.id === overId
        );
        if (activeColumnIndex === -1 || overColumnIndex === -1)
          return currentColumns;
        return arrayMove(currentColumns, activeColumnIndex, overColumnIndex);
      });
      return;
    }

    if (isActiveATask) {
      const isOverATask = over.data.current?.type === "Task";
      const isOverAColumn = over.data.current?.type === "Column";

      setTasks((currentTasks) => {
        const activeIndex = currentTasks.findIndex((t) => t.id === activeId);
        if (activeIndex === -1) return currentTasks;

        let newColumnId = currentTasks[activeIndex].columnId;
        let overIndex = -1;

        if (isOverAColumn) {
          newColumnId = overId;
          const firstTaskInOverColumnIndex = currentTasks.findIndex(
            (t) => t.columnId === overId
          );
          overIndex =
            firstTaskInOverColumnIndex !== -1
              ? firstTaskInOverColumnIndex
              : currentTasks.length;
        } else if (isOverATask) {
          overIndex = currentTasks.findIndex((t) => t.id === overId);
          if (overIndex === -1) return currentTasks;
          newColumnId = currentTasks[overIndex].columnId;
        } else {
          return currentTasks;
        }

        if (currentTasks[activeIndex].columnId === newColumnId) {
          if (overIndex === -1) overIndex = activeIndex;
          return arrayMove(currentTasks, activeIndex, overIndex);
        } else {
          const updatedTask = {
            ...currentTasks[activeIndex],
            columnId: newColumnId,
          };
          const tasksWithoutActive = currentTasks.filter(
            (t) => t.id !== activeId
          );

          let finalIndex = tasksWithoutActive.findIndex((t) => t.id === overId);
          if (isOverAColumn) {
            finalIndex = tasksWithoutActive.findIndex(
              (t) => t.columnId === newColumnId
            );
            if (finalIndex === -1) finalIndex = tasksWithoutActive.length;
          } else if (isOverATask) {
            finalIndex = tasksWithoutActive.findIndex((t) => t.id === overId);
            if (finalIndex === -1) finalIndex = tasksWithoutActive.length;
          } else {
            finalIndex = tasksWithoutActive.length;
          }

          const finalTasks = [
            ...tasksWithoutActive.slice(0, finalIndex),
            updatedTask,
            ...tasksWithoutActive.slice(finalIndex),
          ];
          return finalTasks;
        }
      });
    }
  };

  const toggleView = (view: boolean) => {
    setIsListView(view);
  };

  return (
    <>
      <Head>
        <title>Tasks </title>
      </Head>
      <PlatformLayout>
        <div
          onClick={handlePageClick}
          className="min-h-screen p-4 flex flex-col dark:bg-gray-900"
        >
          {/* Header Section */}
          <div className="mb-4 px-2">
            <Button
              text="Back"
              style="ghost"
              arrow="left"
              onClick={() => router.back()}
            />
          </div>
          <div className="px-2 mb-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <h2 className="text-md dark:text-light">
                Project / {projectTitle}
              </h2>
            </div>
            <h1 className="text-lg font-bold mt-2 mb-4 dark:text-light">
              {isListView ? "Task List" : "Kanban Board"}
            </h1>
            <div className="flex flex-col justify-between sm:flex-row items-center mb-4">
              <div className="w-1/4">
                <SearchBar
                  placeholder="Search Task Title or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-1/4 flex flex-row items-center gap-2">
                <DropdownFilter
                  items={dropdownItems}
                  direction="down"
                  placeholder="Filter Labels"
                  selectedItems={selectedFilterLabels}
                  onChange={setSelectedFilterLabels}
                />
                {selectedFilterLabels.length > 0 && (
                  <Button
                    text="Clear"
                    style="ghost"
                    width="small"
                    onClick={() => setSelectedFilterLabels([])}
                  />
                )}

                <TicketView isListView={isListView} toggleView={toggleView} />
              </div>
            </div>
          </div>

          {isListView ? (
            <TaskListView
              tasks={filteredTasks}
              columns={columns}
              openTaskModal={openTaskModal}
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
            >
              {/* This div enables horizontal scrolling for the columns */}
              <div className="flex-grow flex gap-4 overflow-x-auto pb-4 px-2">
                <SortableContext
                  items={columnsId}
                  strategy={horizontalListSortingStrategy}
                >
                  {columns.map((col) => {
                    const tasksForColumn = filteredTasks.filter(
                      (task) => task.columnId === col.id
                    );
                    return (
                      <SortableItem key={col.id} id={col.id} isColumn>
                        <ColumnContainer
                          column={col}
                          tasks={tasksForColumn}
                          deleteColumn={deleteColumn}
                          updateColumnTitle={updateColumnTitle}
                          openTicketModal={openTicketModal}
                          columnLimits={columnLimits}
                          addTask={addTask}
                          dropdownItems={dropdownItems}
                          openTaskModal={openTaskModal}
                          toggleDropdown={toggleDropdown}
                          deleteTask={deleteTask}
                          openLabelPopup={openLabelPopup}
                          dropdownOpen={dropdownOpen}
                        />
                      </SortableItem>
                    );
                  })}
                </SortableContext>

                {/* Add New Column Button/Form */}
                <div className="flex-shrink-0 w-[300px]">
                  {isAddingColumn ? (
                    <div
                      id="add-column-form"
                      className="bg-gray-200 dark:bg-gray-800 shadow-md rounded-lg p-3"
                    >
                      <TextField
                        placeholder="Enter column title..."
                        value={newColumnTitle}
                        onChange={setNewColumnTitle}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          text="Add Column"
                          style="primary"
                          width="small"
                          onClick={addNewColumn}
                        />
                        <Button
                          text="Cancel"
                          style="ghost"
                          width="small"
                          onClick={() => setIsAddingColumn(false)}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      aria-label="add-column"
                      className="w-full h-12 bg-gray-500 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg flex items-center justify-center transition-colors"
                      onClick={() => setIsAddingColumn(true)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-5 h-5 mr-2"
                      >
                        {" "}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />{" "}
                      </svg>
                      Add another list
                    </button>
                  )}
                </div>
              </div>

              {isBrowser &&
                createPortal(
                  <DragOverlay dropAnimation={null}>
                    {activeColumn && (
                      <ColumnContainer
                        column={activeColumn}
                        tasks={tasks.filter(
                          (t) => t.columnId === activeColumn.id
                        )}
                        deleteColumn={() => {}}
                        updateColumnTitle={() => {}}
                        openTicketModal={() => {}}
                        columnLimits={columnLimits}
                        addTask={() => {}}
                        dropdownItems={dropdownItems}
                        openTaskModal={() => {}}
                        toggleDropdown={() => {}}
                        deleteTask={() => {}}
                        openLabelPopup={() => {}}
                        dropdownOpen={null}
                        isOverlay={true}
                      />
                    )}
                    {activeTask && (
                      <TaskCard
                        task={activeTask}
                        openTaskModal={() => {}}
                        toggleDropdown={() => {}}
                        deleteTask={() => {}}
                        openLabelPopup={() => {}}
                        dropdownOpen={null}
                        isOverlay={true}
                      />
                    )}
                  </DragOverlay>,
                  document.body
                )}
            </DndContext>
          )}

          {isLabelPopupOpen && selectedTaskIdForLabel && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) toggleLabelPopup();
              }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg mx-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-light">
                  Add labels to task{" "}
                  {typeof selectedTaskIdForLabel === "string" &&
                  selectedTaskIdForLabel.startsWith("task-")
                    ? selectedTaskIdForLabel.toUpperCase()
                    : selectedTaskIdForLabel}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
                  Current labels:{" "}
                  {tasks.find((t) => t.id === selectedTaskIdForLabel)?.type ||
                    "None"}
                </p>
                <div className="mt-4 flex gap-2">
                  <div className="flex-grow">
                    <TextField
                      placeholder="New label name"
                      value={newLabel}
                      onChange={setNewLabel}
                    />
                  </div>
                  <Button
                    text="Add"
                    style="secondary"
                    isDisabled={!newLabel.trim()}
                    onClick={addLabel}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    text="Done"
                    style="primary"
                    onClick={toggleLabelPopup}
                  />
                </div>
              </div>
            </div>
          )}

          <TicketModal
            isOpen={isTicketModalOpen}
            columnName={
              activeColumnIdForModal
                ? columns.find((c) => c.id === activeColumnIdForModal)?.title ??
                  ""
                : ""
            }
            currentLimit={
              activeColumnIdForModal
                ? columnLimits[activeColumnIdForModal] || ""
                : ""
            }
            onSave={saveColumnLimit}
            onCancel={closeTicketModal}
          />

          {selectedTask && (
            <TaskModal
              isOpen={isTaskModalOpen}
              taskDetails={{
                ...selectedTask,
                id: String(selectedTask.id),
                columnId: String(selectedTask.columnId),
              }}
              updateTask={updateTask}
              projectName={projectTitle}
              availableLabels={dropdownItems}
              onClose={closeTaskModal}
            />
          )}
        </div>
      </PlatformLayout>
    </>
  );
};

export default TasksPage;
