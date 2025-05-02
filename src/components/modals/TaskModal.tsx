import React, { useState, useEffect, KeyboardEvent } from "react";
import CustomTextArea from "@/components/ui/CustomTextArea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faX } from "@fortawesome/free-solid-svg-icons";
import TextField from "../ui/TextField";
import DropdownLarge from "../ui/Dropdown/DropdownLarge";
import Swal from "sweetalert2";

type TaskModalProps = {
  isOpen: boolean;
  taskDetails: {
    id: string;
    columnId: string;
    title: string;
    status: string;
    priority?: string;
  };
  projectName: string;
  availableLabels: string[];
  onClose: () => void;
  updateTask: (updatedTask: {
    id: string;
    title: string;
    columnId: string;
    status: string;
    priority?: string;
  }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
};

const TaskModal = ({
  isOpen,
  taskDetails,
  projectName,
  onClose,
  deleteTask,
  updateTask,
}: TaskModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(taskDetails.title);
  const [description, setDescription] = useState("");
  const [existingDescriptionId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const priorityOptions = ["Low", "Medium", "High"];
  const statusOptions = ["To Do", "In Progress", "Checks", "Completed"];
  const [taskData, setTaskData] = useState({
    ...taskDetails,
    priority: taskDetails.priority || "Medium",
  });

  const updateTaskField = async (field: string, value: string) => {
    const originalValue = taskData[field as keyof typeof taskData];
    setTaskData((prev) => ({ ...prev, [field]: value }));
    try {
      await updateTask({
        ...taskData,
        [field]: value,
      });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      setTaskData((prev) => ({
        ...prev,
        [field]: originalValue,
      }));
      Swal.fire({
        title: "Update Failed",
        text: `Could not update ${field}`,
        icon: "error",
      });
    }
  };

  const handleDelete = async () => {
    setShowDropdown(false);
    try {
      await deleteTask(taskDetails.id);
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
      Swal.fire("Error!", "Could not delete the task.", "error");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const updatedTask = {
      ...taskData,
      status: newStatus,
      columnId: mapStatusToColumnId(newStatus),
    };
    await updateTask(updatedTask);
    setTaskData(updatedTask);
  };

  const handlePriorityChange = async (newPriority: string) => {
    const updatedTask = {
      ...taskData,
      priority: newPriority,
    };
    await updateTask(updatedTask);
    setTaskData(updatedTask);
  };

  const mapStatusToColumnId = (status: string): string => {
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
        return "todo";
    }
  };

  useEffect(() => {
    setEditedTitle(taskDetails.title);
    setTaskData({
      ...taskDetails,
      priority: taskDetails.priority || "Medium",
    });

    setDescription("");
    setIsEditing(false);
    setShowDropdown(false);
  }, [taskDetails]);

  const closeModal = () => {
    if (onClose) onClose();
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const saveTitle = () => {
    if (editedTitle !== taskData.title) {
      updateTaskField("title", editedTitle);
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      setEditedTitle(taskData.title);
      setIsEditing(false);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 max-h-[90vh] w-full h-[80%] max-w-5xl shadow-xl relative flex flex-col overflow-hidden ">
        <div className="flex justify-between items-start mb-4">
          <p className="text-dark dark:text-light text-sm uppercase tracking-wide">
            {projectName} / TASK-{taskDetails.id}
          </p>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                className="p-2 rounded-md text-dark dark:text-light hover:bg-gray-500 dark:hover:bg-gray-700"
                aria-label="Options"
                onClick={toggleDropdown}
              >
                <FontAwesomeIcon icon={faEllipsis} className="h-5 w-5" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 shadow-lg rounded-md py-1 z-10">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-dark dark:text-light hover:bg-gray-500 dark:hover:bg-gray-600"
                    onClick={handleDelete}
                  >
                    Delete Task
                  </button>
                </div>
              )}
            </div>

            <button
              className="p-2 rounded-md text-dark dark:text-light hover:bg-gray-500 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              aria-label="Close"
              onClick={closeModal}
            >
              <FontAwesomeIcon icon={faX} className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto pr-2 -mr-2">
          {/* Left Column (Takes 2/3 on md screens) */}
          <div className="md:col-span-2 space-y-6">
            <div>
              {isEditing ? (
                <TextField
                  value={editedTitle}
                  onChange={setEditedTitle}
                  onBlur={saveTitle}
                  onKeyDown={handleTitleKeyDown}
                />
              ) : (
                <button
                  className="w-full text-left text-dark dark:text-light text-2xl font-semibold hover:bg-gray-500 dark:hover:bg-gray-700 rounded px-2 py-1 -ml-2"
                  onClick={startEditing}
                  aria-label="Edit task title"
                >
                  {taskData.title}
                </button>
              )}
            </div>

            <div className="mt-4">
              <label
                htmlFor="task-description"
                className="block text-dark dark:text-light font-medium text-base mb-2"
              >
                Description
              </label>
              <CustomTextArea
                placeholder="Add a more detailed description..."
                value={description}
                onInput={setDescription}
                descriptionId={existingDescriptionId}
              />
            </div>
          </div>

          {/* Right Column (Takes 1/3 on md screens) */}
          <div className="border border-gray-400 dark:border-gray-200 md:col-span-1 space-y-6">
            <div className="p-4 rounded-md">
              <h3 className="text-dark dark:text-light font-semibold mb-8">
                Details
              </h3>
              <div className="space-y-5">
                <DropdownLarge
                  items={statusOptions}
                  selectedItem={taskData.status}
                  onSelect={handleStatusChange}
                  label="Status"
                  width="full"
                />
                <DropdownLarge
                  items={priorityOptions}
                  selectedItem={taskData.priority}
                  onSelect={handlePriorityChange}
                  label="Priority"
                  width="full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
