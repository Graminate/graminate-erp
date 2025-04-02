import React, { useState } from "react";
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
import TicketView from "@/components/ui/Switch/TicketView";
import ViewTable from "@/components/tables/ViewTable";
import PlatformLayout from "@/layout/PlatformLayout";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Task = {
  id: string;
  title: string;
  type: string;
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

type NotificationProps = {
  id: string;
  children: React.ReactNode;
};

const Notification = ({ id, children }: NotificationProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const TasksPage: React.FC = () => {
  const router = useRouter();
  const { user_id, id } = router.query;
  const projectTitle =
    typeof router.query.title === "string" ? router.query.title : "";
  const budget =
    typeof router.query.budget === "string" ? router.query.budget : "";

  const ProjectStatus = ["Active", "On Hold", "Completed"];
  const [isListView, setIsListView] = useState(false);
  const toggleView = (view: boolean) => setIsListView(view);

  const initialColumns: Column[] = [
    {
      id: "1",
      title: "TO DO",
      tasks: [
        {
          id: "Task-1",
          title: "Make Ticket section similar to Jira interface",
          type: "",
        },
      ],
    },
    {
      id: "2",
      title: "IN PROGRESS",
      tasks: [{ id: "Task-2", title: "Complete CRM entry forms", type: "" }],
    },
    {
      id: "3",
      title: "DONE",
      tasks: [
        { id: "Task-3", title: "Make landing page for Graminate", type: "" },
      ],
    },
  ];

  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [addingTask, setAddingTask] = useState<number | null>(null);
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<{
    colIndex: number;
    taskIndex: number;
  } | null>(null);
  const [columnDropdownOpen, setColumnDropdownOpen] = useState<number | null>(
    null
  );
  const [isLabelPopupOpen, setIsLabelPopupOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState("");
  const [totalTaskCount, setTotalTaskCount] = useState(3);
  const [dropdownItems, setDropdownItems] = useState<string[]>([
    "Finance",
    "Maintenance",
    "Research",
    "Urgent",
  ]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeColumnIndex, setActiveColumnIndex] = useState<number | null>(
    null
  );
  const [selectedFilterLabels, setSelectedFilterLabels] = useState<string[]>(
    []
  );
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task>({
    id: "",
    title: "",
    type: "",
  });
  const [columnLimits, setColumnLimits] = useState<Record<number, string>>({});

  const filterTasks = (column: Column) =>
    column.tasks.filter((task) => {
      const taskLabels = task.type
        ? task.type.split(", ").map((l) => l.trim())
        : [];
      return (
        (selectedFilterLabels.length === 0 ||
          selectedFilterLabels.some((label) => taskLabels.includes(label))) &&
        (!searchQuery.trim() ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.id.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

  // --- dnd-kit drag handler ---
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over.id);
      setColumns(arrayMove(columns, oldIndex, newIndex));
    }
  };

  // --- Label modal ---
  const openLabelPopup = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsLabelPopupOpen(true);
  };

  const toggleLabelPopup = () => {
    setIsLabelPopupOpen((prev) => !prev);
  };

  const addLabel = () => {
    const updatedCols = columns.map((col) => ({
      ...col,
      tasks: col.tasks.map((task) => {
        if (task.id === selectedTaskId) {
          const currentLabels = task.type
            ? task.type.split(", ").map((l) => l.trim())
            : [];
          if (!currentLabels.includes(newLabel.trim())) {
            const newType =
              currentLabels.length > 0
                ? `${task.type}, ${newLabel.trim()}`
                : newLabel.trim();
            return { ...task, type: newType };
          }
        }
        return task;
      }),
    }));
    setColumns(updatedCols);
  };

  // --- Ticket modal ---
  const openTicketModal = (index: number) => {
    setIsTicketModalOpen(true);
    setActiveColumnIndex(index);
    setColumnDropdownOpen(null);
  };

  const closeTicketModal = () => {
    setIsTicketModalOpen(false);
    setActiveColumnIndex(null);
  };

  const saveColumnLimit = (limit: string) => {
    if (activeColumnIndex !== null) {
      setColumnLimits((prev) => ({
        ...prev,
        [activeColumnIndex]: limit.trim(),
      }));
    }
    closeTicketModal();
  };

  // --- Task actions ---
  const startAddingTask = (index: number) => {
    setNewTaskTitle("");
    setNewTaskType("");
    setAddingTask(index);
  };

  const addTask = (index: number) => {
    if (!newTaskTitle.trim()) {
      Swal.fire({
        title: "Error",
        text: "Task title is required",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const newId = `Task-${totalTaskCount + 1}`;
    const newTask: Task = {
      id: newId,
      title: newTaskTitle.trim(),
      type: newTaskType.trim() || "",
    };

    setColumns((prevColumns) =>
      prevColumns.map((col, i) =>
        i === index ? { ...col, tasks: [...col.tasks, newTask] } : col
      )
    );

    setTotalTaskCount(totalTaskCount + 1);
    setAddingTask(null); // Close the input field
  };

  const deleteTask = (colIndex: number, taskIndex: number) => {
    setColumns((prev) =>
      prev.map((col, i) =>
        i === colIndex
          ? { ...col, tasks: col.tasks.filter((_, j) => j !== taskIndex) }
          : col
      )
    );
    setDropdownOpen(null);
  };

  // --- Column actions ---
  const deleteColumn = (index: number) => {
    setColumns((prev) => prev.filter((_, i) => i !== index));
    setColumnDropdownOpen(null);
  };

  const toggleDropdown = (colIndex: number, taskIndex: number) => {
    setDropdownOpen((prev) =>
      prev && prev.colIndex === colIndex && prev.taskIndex === taskIndex
        ? null
        : { colIndex, taskIndex }
    );
  };

  const toggleColumnDropdown = (index: number) => {
    setColumnDropdownOpen((prev) => (prev === index ? null : index));
  };

  const handlePageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[aria-label="column-ellipsis"]')) {
      setColumnDropdownOpen(null);
    }
    setAddingTask(null);
    setDropdownOpen(null);
    setEditingColumn(null);
  };

  const startEditingColumn = (index: number) => {
    setEditingColumn(index);
  };

  const saveColumnTitle = (index: number, newTitle: string) => {
    if (newTitle.trim()) {
      setColumns((prev) =>
        prev.map((col, i) =>
          i === index ? { ...col, title: newTitle.trim() } : col
        )
      );
    }
    setEditingColumn(null);
  };

  const addNewColumn = () => {
    if (!newColumnTitle.trim()) {
      Swal.fire({
        title: "Error",
        text: "Column title is required",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
    const newCol: Column = {
      id: `${Date.now()}`,
      title: newColumnTitle.trim(),
      tasks: [],
    };
    setColumns((prev) => [...prev, newCol]);
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  const cancelColumn = () => {
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  const goBack = () => {
    router.back();
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask({ ...task });
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
  };

  const hasTasks = columns.some((col) => col.tasks.length > 0);
  const headers = [
    { label: "# Key" },
    { label: "Summary" },
    { label: "Status" },
    { label: "Labels" },
  ];

  return (
    <PlatformLayout>
      <div onClick={handlePageClick} className="min-h-screen p-4">
        <div className="mb-4">
          <Button text="Back" style="ghost" arrow="left" onClick={goBack} />
        </div>
        <div className="p-2 mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-md dark:text-light">
              Project / {projectTitle}
            </h2>
            <div className="flex items-center space-x-4">
              <DropdownSmall
                items={ProjectStatus}
                placeholder="Status"
                selected={ProjectStatus[0]}
                onSelect={(item) => console.log("Selected:", item)}
              />
            </div>
          </div>
          <h1 className="text-lg font-bold mt-2 mb-6 dark:text-light">
            TASK board
          </h1>
          <div className="flex justify-between items-center mb-4">
            <SearchBar
              mode="table"
              placeholder="Search Task or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {hasTasks && (
              <div className="flex items-center gap-4 ml-auto">
                <DropdownFilter
                  items={dropdownItems}
                  direction="down"
                  placeholder="Label"
                  selectedItems={selectedFilterLabels}
                  onChange={setSelectedFilterLabels}
                />
                {selectedFilterLabels.length > 0 && (
                  <Button
                    text="Clear filters"
                    style="ghost"
                    onClick={() => setSelectedFilterLabels([])}
                  />
                )}
              </div>
            )}
            <TicketView isListView={isListView} toggleView={toggleView} />
          </div>
          {isListView ? (
            <ViewTable
              headers={headers}
              columns={columns}
              filterTasks={filterTasks}
              searchQuery={searchQuery}
            />
          ) : (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columns.map((col) => col.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex gap-6 overflow-x-auto pb-2 relative">
                  {columns.map((column, colIndex) => (
                    <Notification key={column.id} id={column.id}>
                      <div className="bg-gray-500 dark:bg-gray-800 shadow rounded-lg p-3 w-[280px] flex-shrink-0 relative">
                        {/* Column Header */}
                        <div className="flex justify-between items-center mb-3">
                          {editingColumn === colIndex ? (
                            <input
                              type="text"
                              className="text-sm dark:text-light border-b border-gray-300 w-full focus:outline-none"
                              value={column.title}
                              onChange={(e) => {
                                const updatedTitle = e.target.value;
                                setColumns((prev) =>
                                  prev.map((col, i) =>
                                    i === colIndex
                                      ? { ...col, title: updatedTitle }
                                      : col
                                  )
                                );
                              }}
                              onBlur={() =>
                                saveColumnTitle(colIndex, column.title)
                              }
                            />
                          ) : (
                            <h2
                              className="text-sm font-semibold cursor-pointer"
                              onClick={() => startEditingColumn(colIndex)}
                            >
                              {column.title}{" "}
                              {columnLimits[colIndex] && (
                                <span className="text-xs bg-gray-300 rounded p-1 ml-2">
                                  MAX: {columnLimits[colIndex]}
                                </span>
                              )}
                            </h2>
                          )}
                          {/* Column Triple Dot */}
                          <div className="relative">
                            <button
                              aria-label="column-ellipsis"
                              className="dark:text-light"
                              onClick={() => toggleColumnDropdown(colIndex)}
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
                            {columnDropdownOpen === colIndex && (
                              <div
                                className="absolute right-0 bg-white w-36 shadow rounded text-sm text-gray-800 z-10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="hover:bg-gray-200 px-4 py-2 rounded w-full text-left"
                                  onClick={() => openTicketModal(colIndex)}
                                >
                                  Set column limit
                                </button>
                                <button
                                  className="hover:bg-gray-200 px-4 py-2 rounded w-full text-left"
                                  onClick={() => deleteColumn(colIndex)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Tasks */}
                        <div className="space-y-3">
                          {filterTasks(column).map((task, taskIndex) => (
                            <div
                              key={task.id}
                              className="bg-white dark:bg-gray-700 p-3 rounded-md shadow relative cursor-pointer"
                              onClick={(e) => {
                                const target = e.target as HTMLElement;
                                // Prevent modal from opening if clicking inside the triple-dot button or dropdown
                                if (
                                  !target.closest("[aria-label='ellipsis']")
                                ) {
                                  openTaskModal(task);
                                }
                              }}
                            >
                              <div className="flex justify-between">
                                <p className="text-sm font-medium">
                                  {task.title}
                                </p>
                                {/* Task Triple Dot */}
                                <div className="relative">
                                  <button
                                    aria-label="ellipsis"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevents modal from opening when clicking this button
                                      toggleDropdown(colIndex, taskIndex);
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
                                    dropdownOpen.colIndex === colIndex &&
                                    dropdownOpen.taskIndex === taskIndex && (
                                      <div
                                        className="absolute right-0 w-32 bg-white shadow rounded text-sm text-gray-800 z-10"
                                        onClick={(e) => e.stopPropagation()} // Prevents dropdown click from closing modal
                                      >
                                        <button
                                          className="hover:bg-gray-200 px-4 py-1 rounded w-full text-left"
                                          onClick={() =>
                                            openLabelPopup(task.id)
                                          }
                                        >
                                          Add label
                                        </button>
                                        <button
                                          className="hover:bg-gray-200 px-4 py-1 rounded w-full text-left"
                                          onClick={() =>
                                            deleteTask(colIndex, taskIndex)
                                          }
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <span className="text-xs text-gray-500">
                                  {task.id}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {addingTask === colIndex ? (
                          <div className="mt-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
                            <TextArea
                              placeholder="What needs to be done?"
                              value={newTaskTitle}
                              onChange={setNewTaskTitle}
                            />
                            <div className="mt-3 flex flex-col md:flex-row items-center gap-3">
                              <DropdownSmall
                                items={dropdownItems}
                                direction="up"
                                placeholder="Task Type"
                                selected={newTaskType}
                                onSelect={setNewTaskType}
                              />
                              <Button
                                text="Create"
                                style="secondary"
                                onClick={() => addTask(colIndex)}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <Button
                              text="Create Issue"
                              style="primary"
                              onClick={() => {
                                setAddingTask(colIndex);
                                setNewTaskTitle("");
                                setNewTaskType("");
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </Notification>
                  ))}
                  <div className="flex flex-col items-center justify-center">
                    {isAddingColumn ? (
                      <div className="w-[280px] bg-gray-500 dark:bg-gray-800 shadow rounded-lg p-3">
                        <TextField
                          placeholder="Column title"
                          value={newColumnTitle}
                          onChange={setNewColumnTitle}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            aria-label="create-column"
                            className="bg-green-500 text-white p-1 rounded"
                            onClick={addNewColumn}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                          <button
                            aria-label="cancel-column"
                            className="bg-red-500 text-white p-1 rounded"
                            onClick={cancelColumn}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        aria-label="add-column"
                        className="bg-gray-300 dark:bg-gray-700 text-white p-2 rounded-lg"
                        onClick={() => setIsAddingColumn(true)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
        {isLabelPopupOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) toggleLabelPopup();
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 dark:text-light">
                Add labels to {selectedTaskId}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Begin typing to find and create labels
              </p>
              <div className="mt-4">
                <TextField
                  placeholder="Labels"
                  value={newLabel}
                  onChange={setNewLabel}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  text="Cancel"
                  style="ghost"
                  onClick={toggleLabelPopup}
                />
                <Button
                  text="Done"
                  style="primary"
                  isDisabled={!newLabel.trim()}
                  onClick={() => {
                    addLabel();
                    toggleLabelPopup();
                  }}
                />
              </div>
            </div>
          </div>
        )}
        <TicketModal
          isOpen={isTicketModalOpen}
          columnName={
            activeColumnIndex !== null ? columns[activeColumnIndex].title : ""
          }
          currentLimit="No limit set"
          onSave={saveColumnLimit}
          onCancel={closeTicketModal}
        />
        <TaskModal
          isOpen={isTaskModalOpen}
          taskDetails={selectedTask}
          projectName={projectTitle}
          onClose={closeTaskModal}
        />
      </div>
    </PlatformLayout>
  );
};

export default TasksPage;
