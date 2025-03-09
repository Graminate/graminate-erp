"use client";

import React, { useState } from "react";

interface SearchBarProps {
  query: string;
  placeholder?: string;
  mode?: "table" | "type";
  onSearch: (searchQuery: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  query: initialQuery,
  placeholder = "",
  mode = "",
  onSearch,
}) => {
  const [query, setQuery] = useState(initialQuery);

  // Validate placeholder for 'table' mode
  if (mode === "table" && !placeholder) {
    throw new Error(
      "The 'placeholder' parameter is mandatory when 'mode' is set to 'table'."
    );
  }

  if (mode === "type" && !placeholder) {
    placeholder = "Search";
  }

  const handleSearch = () => {
    onSearch(query);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        className="w-full px-4 py-1 border border-gray-300 dark:border-gray-200 focus:border-green-200 rounded-md dark:bg-gray-700 focus:outline-none dark:text-gray-500"
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="absolute inset-y-0 right-4 flex items-center"
        onClick={handleSearch}
        aria-label="Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-5 stroke-gray-800 dark:stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </button>
    </div>
  );
};

export default SearchBar;
