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

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import PlatformLayout from "@/layout/PlatformLayout";

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

const TasksPage: React.FC = () => {
  const router = useRouter();
  // Retrieve query parameters from URL (both path and search parameters)
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
  const [filteredLabels, setFilteredLabels] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
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
  const [taskLabels, setTaskLabels] = useState<string[]>([]);

  const handleDropdownChange = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) {
      setShowDropdown(false);
      return;
    }
    const filtered = dropdownItems.filter((item) =>
      item.toLowerCase().includes(trimmed.toLowerCase())
    );
    setFilteredLabels(filtered);
    setShowDropdown(filtered.length > 0);
  };

  const handleInputChange = () => {
    const t = newLabel.trim().toLowerCase();
    if (t) {
      const filtered = dropdownItems.filter((item) =>
        item.toLowerCase().includes(t)
      );
      setFilteredLabels(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  };

  const filterTasks = (column: Column) => {
    return column.tasks.filter((task) => {
      const taskLabelArr = task.type
        ? task.type.split(", ").map((l) => l.trim())
        : [];
      return (
        (selectedFilterLabels.length === 0 ||
          selectedFilterLabels.some((label) => taskLabelArr.includes(label))) &&
        (!searchQuery.trim() ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.id.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, '<mark class="bg-green-300">$1</mark>');
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newCols = Array.from(columns);
    const [removed] = newCols.splice(result.source.index, 1);
    newCols.splice(result.destination.index, 0, removed);
    setColumns(newCols);
  };

  const openLabelPopup = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsLabelPopupOpen(true);
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === taskId);
    const labels = task?.type ? task.type.split(", ").map((l) => l.trim()) : [];
    setTaskLabels(labels);
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
      const trimmed = limit.trim();
      setColumnLimits((prev) => ({ ...prev, [activeColumnIndex]: trimmed }));
      console.log(
        `New limit for column ${columns[activeColumnIndex].title}: ${trimmed}`
      );
    }
    closeTicketModal();
  };

  const startAddingTask = (index: number) => {
    setNewTaskTitle("");
    setNewTaskType("");
    setAddingTask(index);
  };

  const addTask = (index: number) => {
    const columnLimit = parseInt(columnLimits[index] || "0", 10);
    if (columnLimit > 0 && columns[index].tasks.length >= columnLimit) {
      Swal.fire({
        title: "Task Limit Reached",
        text: `Task limit reached for the column "${columns[index].title}".`,
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
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
    const task: Task = {
      id: newId,
      title: newTaskTitle.trim(),
      type: newTaskType.trim() || "",
    };
    const updatedCols = columns.map((col, i) =>
      i === index ? { ...col, tasks: [...col.tasks, task] } : col
    );
    setColumns(updatedCols);
    setTotalTaskCount(totalTaskCount + 1);
    setAddingTask(null);
  };

  const deleteTask = (colIndex: number, taskIndex: number) => {
    const updatedCols = columns.map((col, i) =>
      i === colIndex
        ? { ...col, tasks: col.tasks.filter((_, j) => j !== taskIndex) }
        : col
    );
    setColumns(updatedCols);
    setDropdownOpen(null);
  };

  const deleteColumn = (index: number) => {
    const updatedCols = columns.filter((_, i) => i !== index);
    setColumns(updatedCols);
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
      const updatedCols = columns.map((col, i) =>
        i === index ? { ...col, title: newTitle.trim() } : col
      );
      setColumns(updatedCols);
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
    setColumns([...columns, newCol]);
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

  const getTaskLabels = (taskId: string): string[] => {
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === taskId);
    return task?.type ? task.type.split(", ").map((l) => l.trim()) : [];
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
      <div onClick={handlePageClick} className="min-h-screen">
        <div className="mb-4">
          <Button text="Back" style="ghost" arrow="left" onClick={goBack} />
        </div>
        <div className="p-2 mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-md dark:text-light">
              Project / {projectTitle}
            </h2>
            <div className="flex justify-end items-center space-x-4">
              <div className="flex items-center bg-gray-400 dark:bg-gray-600 rounded-full overflow-hidden"></div>
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
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="columns" direction="horizontal">
                {(provided) => (
                  <div
                    className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 relative"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {columns.map((column, colIndex) => (
                      <Draggable
                        key={column.id}
                        draggableId={column.id}
                        index={colIndex}
                      >
                        {(provided) => (
                          <div
                            className="bg-gray-500 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-700 shadow rounded-lg p-2 relative flex-none w-1/4"
                            style={{
                              flexShrink: 0,
                              ...provided.draggableProps.style,
                            }}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className="flex justify-between items-center cursor-grab"
                              {...provided.dragHandleProps}
                            >
                              {editingColumn === colIndex ? (
                                <input
                                  type="text"
                                  className="text-sm dark:text-light mb-4 border-b-2 border-gray-300 w-full focus:outline-none"
                                  value={column.title}
                                  onChange={(e) => {
                                    const updatedTitle = e.target.value;
                                    const updatedCols = columns.map((col, i) =>
                                      i === colIndex
                                        ? { ...col, title: updatedTitle }
                                        : col
                                    );
                                    setColumns(updatedCols);
                                  }}
                                  onBlur={() =>
                                    saveColumnTitle(colIndex, column.title)
                                  }
                                />
                              ) : (
                                <button
                                  type="button"
                                  className="text-sm dark:text-light text-gray-200 mb-4 cursor-pointer focus:outline-none"
                                  onClick={() => startEditingColumn(colIndex)}
                                >
                                  {column.title}
                                  {columnLimits[colIndex]?.trim() && (
                                    <span className="text-xs bg-gray-300 rounded p-1 text-gray-100 font-semibold ml-2">
                                      MAX: {columnLimits[colIndex]}
                                    </span>
                                  )}
                                </button>
                              )}
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
                                    className="size-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                    />
                                  </svg>
                                </button>
                                {columnDropdownOpen === colIndex && (
                                  <div
                                    className="absolute right-0 bg-white w-36 shadow rounded text-sm text-gray-800 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      className="hover:bg-gray-500 px-4 py-2 rounded w-full text-left"
                                      onClick={() => openTicketModal(colIndex)}
                                    >
                                      Set column limit
                                    </button>
                                    <button
                                      className="hover:bg-gray-500 px-4 py-2 rounded w-full text-left"
                                      onClick={() => deleteColumn(colIndex)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-4">
                              {filterTasks(column).map((task, taskIndex) => (
                                <div
                                  key={task.id}
                                  className="bg-light dark:bg-gray-700 p-3 rounded-md shadow-sm relative cursor-pointer"
                                  onClick={() => openTaskModal(task)}
                                >
                                  <div className="flex flex-row items-start justify-between">
                                    <div className="mr-2 break-words max-w-xs">
                                      <p
                                        className="text-dark dark:text-light"
                                        dangerouslySetInnerHTML={{
                                          __html: highlightText(
                                            task.title,
                                            searchQuery
                                          ),
                                        }}
                                      />
                                    </div>
                                    <div className="relative dark:text-white">
                                      <button
                                        aria-label="ellipsis"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          toggleDropdown(colIndex, taskIndex);
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth="1.5"
                                          stroke="currentColor"
                                          className="size-4"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                          />
                                        </svg>
                                      </button>
                                      {dropdownOpen &&
                                        dropdownOpen.colIndex === colIndex &&
                                        dropdownOpen.taskIndex ===
                                          taskIndex && (
                                          <div
                                            className="absolute right-0 w-32 bg-white shadow rounded text-sm text-gray-800 z-10"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <button
                                              className="hover:bg-gray-500 px-4 py-1 rounded w-full text-left"
                                              onClick={() =>
                                                openLabelPopup(task.id)
                                              }
                                            >
                                              Add Label
                                            </button>
                                            <button
                                              className="hover:bg-gray-500 px-4 py-2 rounded w-full text-left"
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
                                  <div className="flex justify-between items-end mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {task.type &&
                                        task.type
                                          .split(", ")
                                          .map((label, idx) => (
                                            <span
                                              key={idx}
                                              className={`text-xs font-semibold text-white rounded px-2 py-1 ${
                                                {
                                                  Finance: "bg-green-100",
                                                  Research: "bg-blue-200",
                                                  Maintenance: "bg-yellow-200",
                                                  Urgent: "bg-red-200",
                                                }[label] || "bg-gray-300"
                                              }`}
                                            >
                                              {label}
                                            </span>
                                          ))}
                                    </div>
                                    <span className="text-xs text-gray-300 ml-auto">
                                      {task.id}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {addingTask === colIndex ? (
                              <div
                                className="mt-2 p-2 rounded-lg overflow-visible"
                                style={{
                                  boxSizing: "border-box",
                                  maxWidth: "100%",
                                }}
                              >
                                <TextArea
                                  placeholder="What needs to be done?"
                                  value={newTaskTitle}
                                  onChange={setNewTaskTitle}
                                />
                                <div className="mt-2 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 z-20">
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
                              <div className="mt-4 w-full py-2 mx-auto">
                                <Button
                                  text="Create issue"
                                  style="primary"
                                  onClick={() => {
                                    const limit = columnLimits[colIndex];
                                    if (
                                      !limit ||
                                      columns[colIndex].tasks.length <
                                        parseInt(limit || "0", 10)
                                    ) {
                                      startAddingTask(colIndex);
                                    }
                                  }}
                                  add
                                  width="large"
                                  isDisabled={
                                    !!columnLimits[colIndex] &&
                                    columns[colIndex].tasks.length >=
                                      parseInt(
                                        columnLimits[colIndex] || "0",
                                        10
                                      )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <div className="rounded-lg flex-none flex flex-col items-center justify-top">
                      {isAddingColumn ? (
                        <div className="w-full">
                          <TextField
                            placeholder="Column title"
                            value={newColumnTitle}
                            onChange={setNewColumnTitle}
                          />
                          <div className="flex flex-1 flex-row gap-2 items-end justify-end">
                            <button
                              aria-label="create"
                              className="mt-2 bg-gray-300 text-white p-1 rounded-lg text-sm shadow-md"
                              onClick={addNewColumn}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m4.5 12.75 6 6 9-13.5"
                                />
                              </svg>
                            </button>
                            <button
                              aria-label="cancel"
                              className="mt-2 bg-gray-300 text-white p-1 rounded-lg text-sm shadow-md"
                              onClick={cancelColumn}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-6"
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
                          aria-label="add"
                          className="w-full bg-gray-500 dark:bg-slate-800 dark:text-gray-400 p-2 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-slate-700"
                          onClick={() => setIsAddingColumn(true)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
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
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
        {isLabelPopupOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) toggleLabelPopup();
            }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-96 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 dark:text-light">
                Add labels to {selectedTaskId}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Begin typing to find and create labels
              </p>
              <div className="mt-4 relative">
                <TextField
                  placeholder="Labels"
                  value={newLabel}
                  onChange={setNewLabel}
                />
              </div>
              <div className="mt-4">
                <DropdownSmall
                  items={dropdownItems}
                  direction="up"
                  placeholder="Task Type"
                  selected={newLabel}
                  onSelect={setNewLabel} // Correct prop for selection change
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
                  isDisabled={
                    !newLabel.trim() || taskLabels.includes(newLabel.trim())
                  }
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
