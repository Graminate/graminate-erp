import { useState, useRef, useEffect } from "react";

type Props = {
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
  direction?: "up" | "down";
  label?: string | null;
  placeholder?: string;
};

const DropdownSmall = ({
  items,
  selected,
  onSelect,
  direction = "down",
  label = null,
  placeholder = "Select an option",
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dropdownId = `dropdown-${Math.random().toString(36).substring(2, 15)}`;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (item: string) => {
    onSelect(item);
    setIsOpen(false);
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
    <div className="relative w-full md:w-auto" ref={dropdownRef}>
      {label && (
        <label
          htmlFor={dropdownId}
          className="block mb-1 text-sm font-medium text-dark dark:text-gray-300"
        >
          {label}
        </label>
      )}

      {/* Dropdown Button */}
      <button
        id={dropdownId}
        className="w-full border border-gray-300 text-dark dark:text-light dark:bg-gray-700 text-sm p-1 rounded flex justify-between items-center"
        onClick={toggleDropdown}
        style={{
          minWidth: "180px",
          maxWidth: "90%",
          boxSizing: "border-box",
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selected || placeholder}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
          />
        </svg>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <ul
          className={`absolute ${
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
          } left-0 dark:text-light bg-white text-dark dark:bg-gray-800 shadow-md rounded max-h-40 overflow-y-auto z-50`}
          style={{
            minWidth: "180px",
            maxWidth: "90%",
            boxSizing: "border-box",
          }}
          role="listbox"
        >
          {items.map((item) => (
            <li
              key={item}
              role="option"
              tabIndex={0}
              className="px-4 py-2 text-sm hover:bg-gray-400 dark:hover:bg-blue-100 cursor-pointer"
              onClick={() => handleSelect(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  handleSelect(item);
                }
              }}
              aria-selected={selected === item}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownSmall;
