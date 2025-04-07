import React, { useState, useEffect, KeyboardEvent } from "react";
import Button from "@/components/ui/Button";
import CustomTextArea from "@/components/ui/CustomTextArea";

type TaskDetails = {
  id: string;
  title: string;
};

type TaskModalProps = {
  isOpen: boolean;
  taskDetails: TaskDetails;
  projectName: string | null;
  onClose: () => void;
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
  const [existingDescriptionId, setExistingDescriptionId] = useState<
    string | null
  >(null);
  const [isFlagged, setIsFlagged] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const savedTitle = localStorage.getItem(`task-${taskDetails.id}`);
    if (savedTitle) {
      // In Svelte, the taskDetails title is updated; here we update our local state.
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
    // If needed, you could also call a callback to update the parent state.
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-gray-300 text-sm">
          {projectName} / {taskDetails.id}
        </p>

        <div className="grid grid-cols-[60%_40%] gap-4 mt-4">
          {/* Left Column */}
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-gray-200 text-lg font-bold rounded-md w-full p-2"
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
                    d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
