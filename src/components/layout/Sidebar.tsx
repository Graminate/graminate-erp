import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faChartPie,
  faUsers,
  faAddressBook,
  faCloud,
  faDollar,
  faWarehouse,
  faChevronRight,
  faChevronLeft,
  faFish,
  faKiwiBird,
  faCow,
  faBug,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

import type { Sidebar as SidebarProps } from "@/types/card-props";
import Loader from "../ui/Loader";
import axiosInstance from "@/lib/utils/axiosInstance";

const Sidebar = ({ isOpen, userId, onSectionChange }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const [userType, setUserType] = useState<string | null>(null);
  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [isUserTypeLoading, setIsUserTypeLoading] = useState(true);

  // Fetch the user's type & sub_types via JWT-authenticated API call
  useEffect(() => {
    const fetchUserType = async () => {
      setIsUserTypeLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        const response = await axiosInstance.get(`/user/${userId}`);

        // adjust this path if your API wraps differently
        const user = response.data?.data?.user ?? response.data?.user;
        if (!user) throw new Error("User payload missing");

        setUserType(user.type || "Producer");
        setSubTypes(Array.isArray(user.sub_type) ? user.sub_type : []);
      } catch (err) {
        console.error("Error fetching user type:", err);
        // fallback to default
        setUserType("Producer");
        setSubTypes([]);
      } finally {
        setIsUserTypeLoading(false);
      }
    };

    if (userId) {
      fetchUserType();
    }
  }, [userId]);

  // Build the menu sections, re-running when userType or subTypes change
  const sections = useMemo(() => {
    const base: {
      icon: IconDefinition;
      label: string;
      section: string;
      route?: string;
      basePath?: string;
      subItems: { label: string; route: string }[];
    }[] = [
      {
        icon: faHome,
        label: "Dashboard",
        section: "Dashboard",
        route: `/platform/${userId}`,
        subItems: [],
      },
      {
        icon: faAddressBook,
        label: "CRM",
        section: "CRM",
        basePath: `/platform/${userId}/crm`,
        subItems: [
          { label: "Contacts", route: `/platform/${userId}/crm?view=contacts` },
          {
            label: "Companies",
            route: `/platform/${userId}/crm?view=companies`,
          },
          {
            label: "Contracts",
            route: `/platform/${userId}/crm?view=contracts`,
          },
          { label: "Receipts", route: `/platform/${userId}/crm?view=receipts` },
          { label: "Tasks", route: `/platform/${userId}/crm?view=tasks` },
        ],
      },
    ];

    if (userType === "Producer") {
      if (subTypes.includes("Fishery")) {
        base.push({
          icon: faFish,
          label: "Fishery",
          section: "Fishery Farm",
          route: `/platform/${userId}/fishery`,
          subItems: [],
        });
      }
      if (subTypes.includes("Poultry")) {
        base.push({
          icon: faKiwiBird,
          label: "Poultry Farm",
          section: "Poultry Farm",
          route: `/platform/${userId}/poultry`,
          subItems: [
            { label: "Dashboard", route: `/platform/${userId}/poultry` },
            {
              label: "Health Reports",
              route: `/platform/${userId}/poultry_health`,
            },
          ],
        });
      }
      if (subTypes.includes("Animal Husbandry")) {
        base.push({
          icon: faCow,
          label: "Animal Husbandry",
          section: "Animal Husbandry",
          route: `/platform/${userId}/animal_husbandry`,
          subItems: [],
        });
      }
      if (subTypes.includes("Apiculture")) {
        base.push({
          icon: faBug,
          label: "Apiculture Farm",
          section: "Apiculture Farm",
          route: `/platform/${userId}/apiculture`,
          subItems: [],
        });
      }
      // Weather Monitor for all producers
      base.push({
        icon: faCloud,
        label: "Weather Monitor",
        section: "Weather Monitor",
        route: `/platform/${userId}/weather`,
        subItems: [],
      });
    }

    // Common sections
    base.push(
      {
        icon: faUsers,
        label: "Employees",
        section: "Labour",
        basePath: `/platform/${userId}/labour`,
        subItems: [
          { label: "Database", route: `/platform/${userId}/labour_database` },
          {
            label: "Salary Manager",
            route: `/platform/${userId}/labour_payment`,
          },
        ],
      },
      {
        icon: faDollar,
        label: "Finance Tracker",
        section: "Finance Tracker",
        route: `/platform/${userId}/budget`,
        subItems: [],
      },
      {
        icon: faWarehouse,
        label: "Inventory",
        section: "Inventory",
        route: `/platform/${userId}/inventory`,
        subItems: [],
      },
      {
        icon: faChartPie,
        label: "Find Partners",
        section: "Find Partners",
        route: `/platform/${userId}/partner_finder`,
        subItems: [],
      }
    );

    return base;
  }, [userId, userType, subTypes]);

  const navigateTo = (route: string) => {
    router.push(route);
    setExpandedSection(null);
  };

  const handleSectionToggle = (
    section: string,
    hasSubItems: boolean,
    route?: string
  ) => {
    if (route && !hasSubItems) {
      navigateTo(route);
    } else if (hasSubItems) {
      const isOpen = expandedSection === section;
      setExpandedSection(isOpen ? null : section);
      if (!isOpen && onSectionChange) onSectionChange(section);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed((c) => !c);
    setExpandedSection(null);
  };

  const closeSubMenu = () => setExpandedSection(null);

  // clicking outside closes submenu
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const side = document.querySelector(".sidebar-container");
      if (side && !side.contains(e.target as Node)) closeSubMenu();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // collapse when parent closes
  useEffect(() => {
    if (!isOpen) closeSubMenu();
  }, [isOpen]);

  // render
  return (
    <div
      className={`sidebar-container fixed inset-y-0 left-0 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-300 shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:relative lg:shadow-none`}
      style={{ width: isCollapsed ? 60 : 230 }}
    >
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {isUserTypeLoading ? (
          <div className="text-center text-gray-400 text-sm px-4">
            <Loader />
          </div>
        ) : (
          sections.map(
            ({ icon, label, section, route, basePath, subItems }) => {
              const hasSubItems = subItems.length > 0;
              const isActive =
                (!hasSubItems && pathname === route) ||
                (hasSubItems && basePath && pathname.startsWith(basePath)) ||
                expandedSection === section;

              return (
                <div key={section} className="relative px-3">
                  <div
                    className={`flex items-center p-3 rounded-lg cursor-pointer group transition-colors duration-200 ${
                      isActive
                        ? "bg-gray-700 text-white shadow-md"
                        : "text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                    } ${isCollapsed ? "justify-center" : ""}`}
                    role="button"
                    tabIndex={0}
                    title={isCollapsed ? label : ""}
                    onClick={() =>
                      handleSectionToggle(section, hasSubItems, route)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSectionToggle(section, hasSubItems, route);
                      }
                    }}
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-grow font-medium text-sm truncate">
                          {label}
                        </span>
                        {hasSubItems && (
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className={`h-3 w-3 transition-transform duration-200 ${
                              expandedSection === section ? "rotate-90" : ""
                            } ${
                              isActive
                                ? "text-white"
                                : "text-gray-500 group-hover:text-gray-300"
                            }`}
                          />
                        )}
                      </>
                    )}
                  </div>

                  {!isCollapsed &&
                    expandedSection === section &&
                    hasSubItems && (
                      <div className="mt-1 ml-5 pl-3 border-l border-gray-600 space-y-1">
                        {subItems.map((sub) => {
                          const isSubActive =
                            pathname + searchParams.toString() === sub.route;
                          return (
                            <div
                              key={sub.label}
                              className={`text-sm py-2 px-4 rounded-md cursor-pointer transition-colors duration-150 ${
                                isSubActive
                                  ? "text-indigo-300 font-semibold"
                                  : "text-gray-400 hover:text-white hover:bg-gray-700"
                              }`}
                              role="button"
                              tabIndex={0}
                              onClick={() => navigateTo(sub.route)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  navigateTo(sub.route);
                                }
                              }}
                            >
                              {sub.label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              );
            }
          )
        )}
      </nav>

      <div className="mt-auto p-3 border-t border-gray-700">
        <button
          className={`w-full flex items-center p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition-colors duration-200 ${
            isCollapsed ? "justify-center" : "justify-end"
          }`}
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <FontAwesomeIcon
            icon={isCollapsed ? faChevronRight : faChevronLeft}
            className="h-5 w-5"
          />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
