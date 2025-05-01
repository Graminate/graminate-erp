import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationBar from "../NotificationSideBar";
import Image from "next/image";
import type { User } from "@/types/card-props";
import type { Navbar } from "@/types/card-props";
import axiosInstance from "@/lib/utils/axiosInstance";
import {
  faArrowUpRightFromSquare,
  faBars,
  faBell,
  faChevronDown,
  faChevronUp,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface NavbarProps extends Navbar {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Navbar = ({
  imageSrc = "/images/logo.png",
  userId,
  isSidebarOpen,
  toggleSidebar,
}: NavbarProps) => {
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

  const notifications = [
    { title: "New Message", description: "You have a new message" },
    {
      title: "New customer request",
      description: "A customer sent you a product request",
    },
  ];

  const notificationCount = notifications.length;

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

        const response = await axiosInstance.get(`/user/${userId}`);
        const data = response.data?.data?.user;

        setUser({
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          business: data.business_name,
          imageUrl:
            data.imageUrl ||
            `https://eu.ui-avatars.com/api/?name=${data.first_name}+${data.last_name}&size=250`,
        });
      } catch (error: unknown) {
        console.error(
          "Error fetching user details:",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    if (userId) fetchUserDetails();
  }, [userId]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("chatMessages");
      localStorage.removeItem("token");
      router.push("/");
    } catch (error: unknown) {
      console.error(
        "Error during logout:",
        error instanceof Error ? error.message : "Logout failed"
      );
    }
  };

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);
  const toggleNotificationBar = () =>
    setNotificationBarOpen(!isNotificationBarOpen);

  const toUserPreferences = () => {
    router.push(`/platform/${userId}/settings/general`);
  };

  return (
    <>
      <header className="px-6 lg:px-12 bg-gray-800 py-2 w-full top-0 z-50">
        <div className="mx-auto w-full px-2 sm:px-4 lg:divide-y lg:divide-gray-700 lg:px-8">
          <div className="relative flex h-12 py-1 justify-between">
            {/* Logo Section with Hamburger Menu */}
            <div className="relative z-10 flex px-2 lg:px-0">
              <div className="flex flex-shrink-0 items-center">
                <div className="flex flex-row items-center gap-4">
                  {/* Mobile Hamburger Menu */}
                  <button
                    className="lg:hidden text-gray-400 hover:text-white focus:outline-none mr-2"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                    aria-expanded={isSidebarOpen}
                  >
                    <FontAwesomeIcon icon={faBars} className="size-6" />
                  </button>

                  {/* Logo */}
                  <Image
                    src={imageSrc}
                    alt="Graminate Logo"
                    className="h-10 w-auto"
                    width={100}
                    height={40}
                    priority
                  />
                  <span className="hidden sm:inline text-bold text-3xl text-light">
                    Graminate
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section - Icons and Profile */}
            <div className="relative z-10 ml-4 flex items-center">
              <div className="flex items-center space-x-3 pr-4 border-r border-gray-700">
                {/* Settings Gear */}
                <button
                  aria-label="Settings"
                  className="text-gray-400 hover:bg-blue-100 p-2 rounded-md focus:outline-none"
                  onClick={toUserPreferences}
                >
                  <FontAwesomeIcon icon={faGear} className="size-6" />
                </button>

                {/* Notifications Bell */}
                <button
                  className="relative text-gray-400 hover:bg-blue-100 p-2 rounded-md focus:outline-none"
                  onClick={toggleNotificationBar}
                >
                  <FontAwesomeIcon icon={faBell} className="size-6" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-0 h-4 w-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Profile Dropdown */}
              <div className="relative ml-4 gap-2 flex-shrink-0 flex items-center">
                <button
                  className="relative rounded-full bg-gray-800 text-sm text-white hidden lg:flex"
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                >
                  <Image
                    className="h-7 w-7 rounded-full"
                    src={user.imageUrl}
                    alt={user.name}
                    width={28}
                    height={28}
                  />
                </button>
                <span className="ml-2 text-white text-sm font-medium hidden lg:inline">
                  {user.name}
                </span>
                <button
                  className="ml-1 flex items-center text-gray-400 hover:text-white focus:outline-none"
                  onClick={toggleDropdown}
                >
                  <FontAwesomeIcon
                    icon={isDropdownOpen ? faChevronUp : faChevronDown}
                    className="size-5 transition-transform duration-200 ease-in-out"
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 top-12 w-96 rounded-md shadow-lg py-4 bg-white dark:bg-gray-700">
                    <div className="px-4 pb-3 border-b border-gray-500 dark:border-gray-300">
                      <div className="flex items-center">
                        <Image
                          className="h-12 w-12 rounded-full"
                          src={user.imageUrl}
                          alt={user.name}
                          width={48}
                          height={48}
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

                    {/* Navigation Links */}
                    <div className="px-4 py-3">
                      {userNavigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="flex items-center mb-2 text-sm font-medium text-gray-200 dark:text-gray-500 hover:underline"
                          target={item.external ? "_blank" : "_self"}
                        >
                          {item.name}
                          {item.external && (
                            <FontAwesomeIcon
                              icon={faArrowUpRightFromSquare}
                              className="size-3 text-dark dark:text-light ml-1"
                            />
                          )}
                        </a>
                      ))}
                    </div>

                    {/* Footer Section */}
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-dark dark:text-light border-t border-gray-500 dark:border-gray-300">
                      <button
                        className="text-sm font-medium text-dark dark:text-light hover:underline"
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
