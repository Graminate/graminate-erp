import { useState, useEffect } from "react";
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
} from "@fortawesome/free-solid-svg-icons";

import type { Sidebar } from "@/types/card-props";

const Sidebar = ({ isOpen, userId, onSectionChange }: Sidebar) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const searchParams = useSearchParams();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
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
        {
          label: "Contacts",
          route: `/platform/${userId}/crm?view=contacts`,
        },
        {
          label: "Companies",
          route: `/platform/${userId}/crm?view=companies`,
        },
        {
          label: "Contracts",
          route: `/platform/${userId}/crm?view=contracts`,
        },
        {
          label: "Receipts",
          route: `/platform/${userId}/crm?view=receipts`,
        },
        {
          label: "Tasks",
          route: `/platform/${userId}/crm?view=tasks`,
        },
      ],
    },
    {
      icon: faCloud,
      label: "Weather Monitor",
      section: "Weather Monitor",
      route: `/platform/${userId}/weather`,
      subItems: [],
    },
    {
      icon: faUsers,
      label: "Workerforce",
      section: "Labour",
      basePath: `/platform/${userId}/labour`,
      subItems: [
        {
          label: "Employee Database",
          route: `/platform/${userId}/labour_database`,
        },
        {
          label: "Payment",
          route: `/platform/${userId}/payment`,
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
    },
  ];

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
      setExpandedSection(null);
    } else if (hasSubItems) {
      const isCurrentlyExpanded = expandedSection === section;
      setExpandedSection(isCurrentlyExpanded ? null : section);
      if (onSectionChange && !isCurrentlyExpanded) {
        onSectionChange(section);
      }
    } else if (route) {
      navigateTo(route);
      setExpandedSection(null);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setExpandedSection(null);
  };

  const closeSubMenu = () => {
    setExpandedSection(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebarElement = document.querySelector(".sidebar-container");
      if (sidebarElement && !sidebarElement.contains(event.target as Node)) {
        closeSubMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      closeSubMenu();
    }
  }, [isOpen]);

  return (
    <div
      className={`sidebar-container fixed inset-y-0 left-0 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-300 shadow-xl transform transition-all duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:relative lg:shadow-none`}
      style={{ width: isCollapsed ? "60px" : "230px" }}
    >
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {sections.map(({ icon, label, section, route, subItems, basePath }) => {
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
                    : "text-gray-400 hover:bg-gray-700 hover:text-gray-400"
                } ${isCollapsed ? "justify-center" : ""}`}
                role="button"
                tabIndex={0}
                title={isCollapsed ? label : ""}
                onClick={() => handleSectionToggle(section, hasSubItems, route)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSectionToggle(section, hasSubItems, route);
                  }
                }}
              >
                <FontAwesomeIcon
                  icon={icon}
                  className={`h-5 w-5 ${
                    isCollapsed ? "" : "mr-3"
                  } flex-shrink-0`}
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

              {!isCollapsed && expandedSection === section && hasSubItems && (
                <div className="mt-1 ml-5 pl-3 border-l border-gray-600 space-y-1">
                  {subItems.map((subItem) => {
                    const isSubActive =
                      pathname + searchParams.toString() === subItem.route;
                    return (
                      <div
                        key={subItem.label}
                        className={`text-sm py-2 px-4 rounded-md cursor-pointer transition-colors duration-150 ${
                          isSubActive
                            ? "text-indigo-300 font-semibold"
                            : "text-gray-400 hover:text-light hover:bg-gray-700"
                        }`}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigateTo(subItem.route)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigateTo(subItem.route);
                          }
                        }}
                      >
                        {subItem.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto p-3 border-t border-gray-700">
        <button
          className={`w-full flex items-center p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-100 transition-colors duration-200 ${
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
