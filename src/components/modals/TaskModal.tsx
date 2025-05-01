import React, { useState, useEffect, KeyboardEvent } from "react";
import Button from "@/components/ui/Button";
import CustomTextArea from "@/components/ui/CustomTextArea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faFlag, faX } from "@fortawesome/free-solid-svg-icons";
import TextField from "../ui/TextField";

type TaskModalProps = {
  isOpen: boolean;
  taskDetails: {
    id: string;
    columnId: string;
    title: string;
    type: string;
    status: string;
  };
  projectName: string;
  availableLabels: string[];
  onClose: () => void;
  updateTask: (updatedTask: {
    id: string;
    title: string;
    columnId: string;
    type: string;
    status: string;
  }) => void;
};

const TaskModal = ({
  isOpen,
  taskDetails,
  projectName,
  onClose,
}: TaskModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(taskDetails.title);
  const [description, setDescription] = useState("");
  const [existingDescriptionId] = useState<string | null>(null);
  const [isFlagged, setIsFlagged] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const savedTitle = localStorage.getItem(`task-${taskDetails.id}`);
    if (savedTitle) {
      setEditedTitle(savedTitle);
    }
  }, [taskDetails.id]);

  const closeModal = () => {
    if (onClose) onClose();
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const saveTitle = () => {
    setIsEditing(false);
    localStorage.setItem(`task-${taskDetails.id}`, editedTitle);
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const toggleFlag = () => {
    setIsFlagged((prev) => !prev);
    setShowDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 h-[80%] w-[1200px] shadow-lg relative">
        {/* Ellipse Button and Close Button */}
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          {/* Options Button */}
          <div className="relative">
            <button
              className="p-2 rounded-md hover:bg-gray-400 focus:outline-none"
              aria-label="Options"
              onClick={toggleDropdown}
            >
              <FontAwesomeIcon icon={faEllipsis} className="size-5" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded">
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-400"
                  onClick={toggleFlag}
                >
                  {isFlagged ? "Remove Flag" : "Add Flag"}
                </button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            className="p-2 rounded-md hover:bg-gray-400 focus:outline-none"
            aria-label="Close"
            onClick={closeModal}
          >
            <FontAwesomeIcon icon={faX} className="size-5" />
          </button>
        </div>

        <p className="text-gray-300 text-sm">
          {projectName} / TASK-{taskDetails.id}
        </p>

        <div className="grid grid-cols-[60%_40%] gap-4 mt-4">
          {/* Left Column */}
          <div>
            {isEditing ? (
              <TextField
                value={editedTitle}
                onChange={setEditedTitle}
                onBlur={saveTitle}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") saveTitle();
                }}
              />
            ) : (
              <button
                className="w-full text-gray-200 text-lg hover:bg-gray-50 hover:cursor-pointer bg-transparent rounded-md p-0"
                onClick={startEditing}
              >
                <span className="flex p-2 font-bold">{editedTitle}</span>
              </button>
            )}
            <div className="mt-4">
              <p className="text-gray-200 font-bold text-md mb-2">
                Description
              </p>

              <CustomTextArea
                placeholder="Add your description here..."
                value={description}
                onInput={setDescription}
                descriptionId={existingDescriptionId}
              />
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="flex flex-row gap-4 justify-start items-center">
              <Button text="Update" style="primary" />
              {isFlagged && (
                <FontAwesomeIcon icon={faFlag} className="size-6" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
