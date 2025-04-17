import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationBar from "../NotificationSideBar";

import type { User } from "@/types/card-props";
import type { Navbar } from "@/types/card-props";
import axios from "axios";
import { API_BASE_URL } from "@/constants/constants";

const Navbar = ({ imageSrc = "/images/logo.png", userId }: Navbar) => {
  const router = useRouter();

  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    business: "",
    imageUrl: "",
  });
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isNotificationBarOpen, setNotificationBarOpen] =
    useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  const notifications = [
    { title: "New Message.", description: "You have a new message" },
    {
      title: "New customer request",
      description: "A customer sent you a product request",
    },
  ];

  const userNavigation = [
    { name: "Pricing", href: `/platform/${userId}/pricing`, external: true },
    { name: "News Updates", href: `/news` },
    { name: "Training & Services", href: "/training-services", external: true },
  ];

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data?.data?.user;

        setUser({
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          business: data.business_name,
          imageUrl:
            data.imageUrl ||
            `https://eu.ui-avatars.com/api/?name=${data.first_name}+${data.last_name}&size=250`,
        });
      } catch (error: any) {
        console.error(
          "Error fetching user details:",
          error.response?.data?.error || error.message
        );
      }
    }

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("chatMessages");
      localStorage.removeItem("token");
      router.push("/");
    } catch (error: any) {
      console.error(
        "Error during logout:",
        error.response?.data?.error || error.message || "Logout failed."
      );
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const toggleNotificationBar = () => {
    setNotificationBarOpen(!isNotificationBarOpen);
  };

  const toUserPreferences = () => {
    router.push(`/platform/${userId}/settings/general`);
  };

  return (
    <>
      <header className="px-6 lg:px-12 bg-gray-800 py-2 w-full top-0 z-50">
        <div className="mx-auto w-full px-2 sm:px-4 lg:divide-y lg:divide-gray-700 lg:px-8">
          <div className="relative flex h-12 py-1 justify-between">
            {/* Logo Section */}
            <div className="relative z-10 flex px-2 lg:px-0">
              <div className="flex flex-shrink-0 items-center">
                <div className="flex flex-row items-center gap-4">
                  <img
                    src={imageSrc}
                    alt="Graminate Logo"
                    className="h-10 w-auto"
                  />
                  <span className="hidden sm:inline text-bold text-3xl text-light">
                    Graminate
                  </span>
                </div>
              </div>
            </div>

            {/* Icons and Profile Dropdown Section */}
            <div className="relative z-10 ml-4 flex items-center">
              {/* Icons Section */}
              <div className="flex items-center space-x-3 pr-4 border-r border-gray-700">
                {/* Settings Icon */}
                <button
                  aria-label="Settings"
                  className="text-gray-400 hover:bg-blue-100 p-2 rounded-md focus:outline-none"
                  onClick={toUserPreferences}
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

                {/* Notifications Icon */}
                <button
                  className="relative text-gray-400 hover:bg-blue-100 p-2 rounded-md focus:outline-none"
                  onClick={toggleNotificationBar}
                >
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
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9a6 6 0 00-12 0v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-0 h-4 w-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Profile Dropdown Section */}
              <div className="relative ml-4 flex-shrink-0 flex items-center">
                <button
                  className="relative rounded-full bg-gray-800 text-sm text-white hidden lg:flex"
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                >
                  <img
                    className="h-7 w-7 rounded-full"
                    src={user.imageUrl}
                    alt={user.name}
                  />
                </button>
                <span className="ml-2 text-white text-sm font-medium hidden lg:inline">
                  {user.name}
                </span>
                <button
                  className="ml-1 flex items-center text-gray-400 hover:text-white focus:outline-none"
                  onClick={toggleDropdown}
                >
                  {isDropdownOpen ? (
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>
                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 top-12 w-96 rounded-md shadow-lg py-4 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 pb-3 border-b border-gray-300">
                      <div className="flex items-center">
                        <img
                          className="h-12 w-12 rounded-full"
                          src={user.imageUrl}
                          alt={user.name}
                        />
                        <div className="ml-3 flex-1 flex-col gap-1">
                          <p className="text-lg font-semibold text-dark dark:text-light">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-300">{user.email}</p>
                          {user.business && (
                            <p className="text-sm text-gray-100 dark:text-white">
                              {user.business}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <a
                              href={`/platform/${userId}/settings/general`}
                              className="text-sm font-medium text-green-600 hover:underline"
                            >
                              Profile Preferences
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-t border-gray-300">
                      {userNavigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="flex items-center mb-2 text-sm font-medium text-gray-200 dark:text-gray-500 hover:underline"
                          target={item.external ? "_blank" : "_self"}
                        >
                          {item.name}
                          {item.external && (
                            <svg
                              className="h-4 w-4 text-gray-500 ml-1"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 5l7 7m0 0l-7 7m7-7H6"
                              />
                            </svg>
                          )}
                        </a>
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-200 dark:text-gray-500 border-t border-gray-300">
                      <button
                        className="text-sm font-medium text-dark dark:text-white hover:underline"
                        onClick={handleLogout}
                      >
                        Sign Out
                      </button>
                      <a href="/privacy-policy" className="hover:underline">
                        Privacy Policy
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <NotificationBar
        userId={userId}
        notifications={notifications}
        isOpen={isNotificationBarOpen}
        closeNotificationBar={toggleNotificationBar}
      />
    </>
  );
};

export default Navbar;
