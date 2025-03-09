"use client";

import React, { useState, useEffect } from "react";

interface CustomTextAreaProps {
  placeholder?: string;
  value: string;
  rows?: number;
  onInput: (value: string) => void;
  descriptionId?: string | null;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({
  placeholder = "Add a description...",
  value,
  rows = 4,
  onInput,
  descriptionId = null,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
    setTempValue(value);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!tempValue && !value) {
        setIsFocused(false);
      }
    }, 200);
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTempValue(event.target.value);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        descriptionId
          ? `/api/descriptions/${descriptionId}`
          : `/api/descriptions`,
        {
          method: descriptionId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: tempValue }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save the description");
      }

      onInput(tempValue);
      setIsFocused(false);
    } catch (error) {
      console.error("Error saving description:", error);
      alert("Endpoint doesn't exist until now.");
    }
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsFocused(false);
  };

  return (
    <div className="relative w-full">
      {isFocused ? (
        <>
          {/* Text Area */}
          <textarea
            className="w-full border border-gray-300 p-3 text-sm rounded shadow-sm resize-none"
            value={tempValue}
            rows={rows}
            placeholder="Add your description here"
            onChange={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
          ></textarea>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 focus:outline-none"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-gray-700 text-sm rounded hover:bg-gray-500 focus:outline-none"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        // Placeholder (Click to Edit)
        <div
          className="relative w-full p-3 text-sm text-gray-300 hover:bg-gray-50 rounded cursor-text"
          role="button"
          tabIndex={0}
          aria-label="Edit description"
          onClick={handleFocus}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsFocused(true);
            }
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default CustomTextArea;
