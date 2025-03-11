import React, { useState, useRef, useEffect } from "react";

type Props = {
  items: string[];
  direction?: "up" | "down";
  placeholder?: string;
  selectedItems: string[];
  onChange: (selected: string[]) => void;
};

const DropdownFilter = ({
  items,
  direction = "down",
  placeholder = "Select",
  selectedItems,
  onChange,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const isItemSelected = (item: string): boolean =>
    selectedItems.includes(item);

  const toggleItem = (item: string) => {
    if (isItemSelected(item)) {
      onChange(selectedItems.filter((selectedItem) => selectedItem !== item));
    } else {
      onChange([...selectedItems, item]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left w-auto" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        className="w-full hover:bg-gray-400 dark:hover:bg-gray-700 dark:text-gray-400 
        dark:focus:bg-green-950 focus:bg-green-400 focus:text-green-100 text-sm font-semibold 
        px-3 py-2 rounded-md text-left flex items-center justify-between"
        onClick={toggleDropdown}
      >
        <span>
          {selectedItems.length > 0 ? (
            <>
              {placeholder}
              <span className="bg-green-200 text-white mr-2 px-2 py-0.5 text-xs rounded-full">
                {selectedItems.length}
              </span>
            </>
          ) : (
            placeholder
          )}
        </span>
        {/* Dropdown Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-10 w-auto mx-4 bg-white dark:bg-gray-700 rounded-md shadow-lg mt-2 ${
            direction === "up" ? "bottom-full mb-2" : ""
          }`}
        >
          {items.map((item) => (
            <label
              key={item}
              className="flex items-center px-4 py-2 cursor-pointer dark:hover:bg-blue-100 hover:bg-gray-400"
            >
              <input
                type="checkbox"
                className="form-checkbox text-blue-600 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                checked={isItemSelected(item)}
                onChange={() => toggleItem(item)}
              />
              <span className="ml-2 text-sm text-dark dark:text-light">
                {item}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownFilter;
