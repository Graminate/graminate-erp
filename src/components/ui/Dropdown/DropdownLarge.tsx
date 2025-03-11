import { useState, useRef, useEffect } from "react";

type Props = {
  items: string[];
  selectedItem: string;
  onSelect: (item: string) => void;
  type?: "form" | "";
  label?: string;
  width?: "full" | "half" | "auto";
};

const DropdownLarge = ({
  items,
  selectedItem,
  onSelect,
  type = "",
  label = "",
  width = "auto",
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectItem = (item: string) => {
    onSelect(item);
    setIsOpen(false);
  };

  const displayLabel =
    type === "form" && !selectedItem ? "Please Select" : selectedItem;

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
    <div>
      {label && (
        <label className="block mb-1 text-sm font-medium text-dark dark:text-light">
          {label}
        </label>
      )}

      <div
        ref={dropdownRef}
        className={`relative inline-block text-left ${
          type === "form" ? "border border-gray-300 rounded-md" : ""
        } ${
          width === "full" ? "w-full" : width === "half" ? "w-1/2" : "w-auto"
        }`}
      >
        {/* Selected Item Button */}
        <button
          className="flex text-dark dark:text-light items-center justify-between px-4 py-2 text-sm hover:underline w-full"
          onClick={toggleDropdown}
          type="button"
        >
          {displayLabel}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 ml-2 -mr-1 text-gray-300"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <ul className="absolute z-10 mt-2 bg-white dark:bg-dark rounded-md shadow-lg text-center max-h-40 overflow-y-auto w-full">
            {items.map((item) => (
              <li
                key={item}
                className="px-4 py-2 text-dark dark:text-light text-sm font-medium cursor-pointer hover:bg-gray-400 dark:hover:bg-dark-100"
                onClick={() => selectItem(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DropdownLarge;
