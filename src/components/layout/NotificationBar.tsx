"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  title: string;
  description: string;
}

interface NotificationBarProps {
  notifications: Notification[];
  isOpen: boolean;
  closeNotificationBar: () => void;
  userId: string;
}

const NotificationBar: React.FC<NotificationBarProps> = ({
  notifications,
  isOpen,
  closeNotificationBar,
  userId,
}) => {
  const [isFilterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [isActionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const router = useRouter();

  const toggleFilterDropdown = () => {
    setFilterDropdownOpen(!isFilterDropdownOpen);
    setActionsDropdownOpen(false);
  };

  const toggleActionsDropdown = () => {
    setActionsDropdownOpen(!isActionsDropdownOpen);
    setFilterDropdownOpen(false);
  };

  const navigateToSettings = () => {
    closeNotificationBar();
    router.push(`/platform/${userId}/settings/notifications`);
  };

  return (
    <div
      className={`fixed top-0 right-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-md transform transition-transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ height: "100vh", zIndex: 50 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-light">
          Notifications
        </h2>

        <button
          aria-label="Close notification"
          className="text-gray-300 hover:bg-gray-400 p-1 rounded-full focus:outline-none"
          onClick={closeNotificationBar}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {/* Filter & Actions */}
        <div className="flex items-center justify-between mb-2 relative">
          <div className="flex space-x-2">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                className="bg-gray-400 dark:bg-gray-700 px-3 py-1 text-sm rounded-md dark:text-gray-300 hover:bg-gray-300 flex items-center"
                onClick={toggleFilterDropdown}
              >
                Filter
                <span className="ml-2">{isFilterDropdownOpen ? "▲" : "▼"}</span>
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute mt-2 w-56 bg-white shadow-lg rounded-md border p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Filter By
                  </p>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox" />
                    <span>Archived</span>
                  </label>
                  <hr className="my-3" />
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Notifications
                  </p>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox" />
                    <span>Select all</span>
                  </label>
                  <div className="flex justify-between mt-4">
                    <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                      Done
                    </button>
                    <button className="border px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Dropdown */}
            <div className="relative">
              <button
                className="bg-gray-400 px-3 py-1 text-sm rounded-md text-gray-700 hover:bg-gray-300 flex items-center"
                onClick={toggleActionsDropdown}
              >
                Actions
                <span className="ml-2">
                  {isActionsDropdownOpen ? "▲" : "▼"}
                </span>
              </button>

              {isActionsDropdownOpen && (
                <div className="absolute mt-2 w-56 bg-white shadow-lg rounded-md border p-3">
                  <ul className="space-y-2">
                    <li>
                      <button className="text-gray-800 hover:bg-gray-200 w-full text-left flex items-center px-3 py-2 cursor-pointer transition-all duration-200 rounded-md">
                        Archive All
                      </button>
                    </li>
                    <li>
                      <button className="text-gray-800 hover:bg-gray-200 w-full text-left flex items-center px-3 py-2 cursor-pointer transition-all duration-200 rounded-md">
                        Mark All as Read
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Settings Icon */}
          <button
            className="text-green-200 hover:text-green-800 mb-2 focus:outline-none"
            aria-label="settings icon"
            onClick={navigateToSettings}
          >
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
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </button>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center">
            You don’t have any notifications
          </p>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={index}
              className="p-3 border rounded-md mb-2 bg-gray-50 dark:bg-gray-700"
            >
              <p className="font-semibold text-gray-800 dark:text-light">
                {notification.title}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {notification.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationBar;
