import axios from "axios";
import { useState, useEffect } from "react";
import Button from "./Button";

type Props = {
  placeholder?: string;
  value: string;
  rows?: number;
  onInput: (value: string) => void;
  descriptionId?: string | null;
};

const CustomTextArea = ({
  placeholder = "Add a description...",
  value,
  rows = 4,
  onInput,
  descriptionId = null,
}: Props) => {
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

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTempValue(e.target.value);
  };

  const handleSave = async () => {
    try {
      const url = descriptionId
        ? `/api/descriptions/${descriptionId}`
        : `/api/descriptions`;

      const method = descriptionId ? "put" : "post";

      await axios[method](url, {
        description: tempValue,
      });

      onInput(tempValue);
      setIsFocused(false);
    } catch (error: any) {
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
            <Button text="Save" style="primary" onClick={handleSave} />
            <Button text="Cancel" style="secondary" onClick={handleCancel} />
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
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
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
