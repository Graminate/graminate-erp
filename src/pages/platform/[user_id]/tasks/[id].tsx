import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import Button from "@/components/ui/Button";
import TicketModal from "@/components/modals/TicketModal";
import TaskModal from "@/components/modals/TaskModal";
import DropdownFilter from "@/components/ui/Dropdown/DropdownFilter";
import SearchBar from "@/components/ui/SearchBar";
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
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import Head from "next/head";
import { Column, Id, Task } from "@/types/types";
import TaskListView from "./TaskListView";
import SortableItem from "./SortableItem";
import ColumnContainer from "./ColumnContainer";
import TaskCard from "./TaskCard";
import axiosInstance from "@/lib/utils/axiosInstance";

const TasksPage = () => {
  const router = useRouter();
  const projectTitle = router.query.project as string;
  const userId = router.query.user_id as string;

  const initialColumns: Column[] = [
    { id: "todo", title: "TO DO" },
    { id: "progress", title: "IN PROGRESS" },
    { id: "check", title: "CHECK" },
    { id: "done", title: "DONE" },
  ];

  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const [tasks, setTasks] = useState<Task[]>([]);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [isListView, setIsListView] = useState(false);
  // const [isAddingColumn, setIsAddingColumn] = useState(false);
  // const [newColumnTitle, setNewColumnTitle] = useState("");
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
    const labelsFromTasks = tasks.flatMap(
      (t: Task) => t.type?.split(",").map((l: string) => l.trim()) ?? []
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
    const fetchTasks = async () => {
      if (!projectTitle || !userId) return;

      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/tasks/${userId}`, {
          params: { project: projectTitle },
        });

        const fetchedTasks =
          response.data.length > 0
            ? response.data.map((task: any) => ({
                id: task.task_id,
                title: task.task,
                type: task.type || "",
                columnId: mapStatusToColumnId(task.status),
                status: task.status,
              }))
            : []; // Empty array if no tasks

        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasks([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [projectTitle, userId]);

  // Helper function to map status to columnId
  const mapStatusToColumnId = (status: string): Id => {
    switch (status) {
      case "To Do":
        return "todo";
      case "In Progress":
        return "progress";
      case "Checks":
        return "check";
      case "Completed":
        return "done";
      default:
        return "todo"; // Default to "todo" if status doesn't match
    }
  };

  useEffect(() => {
    setIsBrowser(typeof document !== "undefined");
  }, []);

  const filteredTasks = useMemo(() => {
    return (tasks || []).filter((task) => {
      const taskLabels = task.type
        ? task.type.split(",").map((l) => l.trim().toLowerCase())
        : [];
      const filterLabelsLower = (selectedFilterLabels || []).map((l) =>
        l.toLowerCase()
      );
      const searchLower = (searchQuery || "").toLowerCase().trim();
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

  // const addNewColumn = () => {
  //   const title = newColumnTitle.trim();
  //   if (!title) {
  //     Swal.fire("Error", "Column title is required", "error");
  //     return;
  //   }
  //   const newCol: Column = {
  //     id: generateId("col"),
  //     title: title,
  //   };
  //   setColumns((prev) => [...prev, newCol]);
  //   setNewColumnTitle("");
  //   setIsAddingColumn(false);
  // };

  // const deleteColumn = (id: Id) => {
  //   const columnToDelete = columns.find((col) => col.id === id);
  //   const tasksInColumn = tasks.filter((task) => task.columnId === id).length;

  //   Swal.fire({
  //     title: `Delete "${columnToDelete?.title}"?`,
  //     text: `This column has ${tasksInColumn} task(s). Deleting the column will also delete all its tasks! This cannot be undone.`,
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     cancelButtonColor: "#3085d6",
  //     confirmButtonText: "Yes, delete it!",
  //     cancelButtonText: "Cancel",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       setColumns((prev) => prev.filter((col) => col.id !== id));
  //       setTasks((prev) => prev.filter((task) => task.columnId !== id));
  //       setColumnLimits((prev) => {
  //         const newLimits = { ...prev };
  //         delete newLimits[id];
  //         return newLimits;
  //       });
  //       Swal.fire(
  //         "Deleted!",
  //         "Column and its tasks have been deleted.",
  //         "success"
  //       );
  //     }
  //   });
  // };

  const updateColumnTitle = (id: Id, title: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, title: title } : col))
    );
  };

  const addTask = async (columnId: Id, title: string, type: string) => {
    try {
      const status = mapColumnIdToStatus(columnId);

      const response = await axiosInstance.post("/tasks/add", {
        user_id: userId,
        project: projectTitle,
        task: title.trim(),
        type: type.trim() || "",
        status: status,
      });

      const newTask: Task = {
        id: response.data.task_id,
        columnId,
        title: title.trim(),
        type: type.trim() || "",
        status: status,
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
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  // Helper function to map columnId to status
  const mapColumnIdToStatus = (columnId: Id): string => {
    switch (columnId) {
      case "todo":
        return "To Do";
      case "progress":
        return "In Progress";
      case "check":
        return "Checks";
      case "done":
        return "Completed";
      default:
        return "To Do";
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

  const updateTask = async (updatedTask: Task) => {
    try {
      await axiosInstance.put(`/tasks/update/${updatedTask.id}`, {
        task: updatedTask.title,
        type: updatedTask.type,
        status: mapColumnIdToStatus(updatedTask.columnId),
      });

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
    } catch (error) {
      console.error("Failed to update task:", error);
    }
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
      // setIsAddingColumn(false);
      // setNewColumnTitle("");
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
            return arrayMove(updatedTasks, activeIndex, activeIndex);
          });
        }
      } else if (isOverATask) {
        const overTask = tasks.find((t) => t.id === overId);
        if (!overTask) return;
        if (activeTask.columnId !== overTask.columnId) {
          setTasks((prevTasks) => {
            const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
            if (activeIndex === -1) return prevTasks;
            const overIndex = prevTasks.findIndex((t) => t.id === overId);
            if (overIndex === -1) return prevTasks;
            const updatedTasks = [...prevTasks];
            updatedTasks[activeIndex] = {
              ...updatedTasks[activeIndex],
              columnId: overTask.columnId,
            };

            return arrayMove(updatedTasks, activeIndex, overIndex);
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
          overIndex = currentTasks.findIndex((t) => t.columnId === overId);
          if (overIndex === -1) {
            overIndex = currentTasks.length;
          } else {
            const firstTaskInOverColumnIndex = currentTasks.findIndex(
              (t) => t.columnId === overId
            );
            overIndex =
              firstTaskInOverColumnIndex !== -1
                ? firstTaskInOverColumnIndex
                : currentTasks.length;
          }
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
              <div className="flex flex-row items-center gap-2">
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
              tasks={filteredTasks || []}
              columns={columns || []}
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
                          // deleteColumn={deleteColumn}
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
                status: mapColumnIdToStatus(selectedTask.columnId), // Add this line
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
