"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faChartPie,
  faChartLine,
  faUsers,
  faAddressBook,
  faCloud,
  faDollar,
} from "@fortawesome/free-solid-svg-icons";

interface SidebarProps {
  isOpen: boolean;
  userId?: string;
  onSectionChange?: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  userId,
  onSectionChange,
}) => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
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
          label: "Invoices",
          route: `/platform/${userId}/crm?view=invoices`,
        },
        {
          label: "Tickets",
          route: `/platform/${userId}/crm?view=tickets`,
        },
      ],
    },
    {
      icon: faChartLine,
      label: "Price Tracker",
      section: "Price Tracker",
      route: `/platform/${userId}/price_tracker`,
      subItems: [],
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
      label: "Labour Management",
      section: "Labour",
      subItems: [
        {
          label: "Labour Database",
          route: `/platform/${userId}/labour_database`,
        },
        {
          label: "Payment",
          route: `/platform/${userId}/payment`,
        },
        {
          label: "Productivity",
          route: `/platform/${userId}/productivity`,
        },
      ],
    },
    {
      icon: faDollar,
      label: "Budget & Finances",
      section: "Budget & Finances",
      route: `/platform/${userId}/budget`,
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
  };

  const handleSectionChange = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
    if (onSectionChange) {
      onSectionChange(section); // ✅ Notify parent component (PlatformLayout.tsx)
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeSubMenu = () => {
    setExpandedSection(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector(".sidebar");
      const navbar = document.querySelector(".navbar");

      if (
        (!sidebar || !sidebar.contains(event.target as Node)) &&
        (!navbar || !navbar.contains(event.target as Node))
      ) {
        closeSubMenu();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`fixed py-3 inset-y-0 left-0 bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:relative sidebar ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ width: isCollapsed ? "60px" : "230px" }}
    >
      <nav className="space-y-2 flex flex-col relative">
        {sections.map(({ icon, label, section, route, subItems }) => (
          <div key={section} className="relative group">
            <div
              className="flex items-center mx-2 p-3 rounded-lg cursor-pointer hover:bg-blue-100 transition-all duration-200 group"
              role="button"
              tabIndex={0}
              onClick={() =>
                route ? navigateTo(route) : handleSectionChange(section)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  route ? navigateTo(route) : handleSectionChange(section);
                }
              }}
              style={{ justifyContent: isCollapsed ? "center" : "flex-start" }}
            >
              <div className="text-gray-400 flex justify-center items-center w-6 h-6">
                <FontAwesomeIcon icon={icon} />
              </div>
              {!isCollapsed && (
                <>
                  <span className="text-gray-500 font-light text-sm ml-2 flex-grow">
                    {label}
                  </span>
                  {subItems.length > 0 && (
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg
                        fill="#ffffff"
                        height="12px"
                        width="12px"
                        viewBox="0 0 330 330"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001
                        c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213
                        C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606
                        C255,161.018,253.42,157.202,250.606,154.389z"
                        />
                      </svg>
                    </div>
                  )}
                </>
              )}
            </div>

            {expandedSection === section && subItems.length > 0 && (
              <div className="absolute top-0 left-full bg-gray-800 shadow-lg rounded-md py-2 w-48 space-y-2">
                {subItems.map(({ label, route }) => (
                  <div
                    key={label}
                    className="text-gray-400 text-sm py-2 px-4 mx-2 cursor-pointer hover:bg-blue-100 rounded-md"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigateTo(route)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigateTo(route);
                      }
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="absolute bottom-4 right-4">
        <button
          className="flex items-center justify-center p-1 rounded-full bg-gray-400 text-gray-200 shadow-lg"
          onClick={toggleCollapse}
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
