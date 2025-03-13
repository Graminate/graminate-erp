import { useState } from "react";

type ButtonData = {
  name: string;
  view: string;
};

type Props = {
  buttons: ButtonData[];
  activeView: string;
  onNavigate: (view: string) => void;
};

const NavPanel = ({ buttons, activeView, onNavigate }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      {/* Desktop Navigation */}
      <div className="hidden md:flex">
        {buttons.map(({ name, view }) => (
          <button
            key={view}
            className={`flex-1 px-4 py-2 text-center text-sm font-medium
              border border-gray-400 dark:border-gray-200 hover:bg-gray-500 dark:hover:bg-gray-100 bg-neutral-100 dark:bg-dark dark:text-light focus:outline-none
              ${
                activeView === view
                  ? "border-b-transparent bg-white font-semibold"
                  : "text-gray-600 font-thin"
              }`}
            onClick={() => onNavigate(view)}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Mobile Navigation (Hamburger Menu) */}
      <div className="flex md:hidden justify-center">
        <div className="flex flex-col items-center w-full relative">
          {/* Hamburger Icon */}
          <button
            className="p-2 rounded-md focus:outline-none text-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 z-50 w-full bg-white text-gray-100 shadow-md">
              {buttons.map(({ name, view }) => (
                <button
                  key={view}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-200"
                  onClick={() => {
                    onNavigate(view);
                    setIsMenuOpen(false);
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavPanel;
