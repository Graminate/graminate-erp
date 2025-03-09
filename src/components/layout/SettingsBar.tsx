import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import Button from "../ui/Button";

type MenuItem = {
  label: string;
  href?: string;
  subItems?: MenuItem[];
};

const SettingsBar: React.FC = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  const settingsMenu: MenuItem[] = [
    {
      label: "Your Preferences",
      subItems: [
        {
          label: "General",
          href: `/platform/${userId}/settings/general/`,
        },
        {
          label: "Notifications",
          href: `/platform/${userId}/settings/notifications`,
        },
      ],
    },
    {
      label: "Account",
      subItems: [
        {
          label: "Account Settings",
          href: `/platform/${userId}/settings/account`,
        },
      ],
    },
  ];

  const goBack = () => {
    router.back();
  };

  return (
    <div className="w-72 px-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-light border-r border-gray-400 dark:border-gray-200 min-h-screen -m-6">
      {/* Back Button */}
      <div className="flex items-center pt-4">
        <Button text="Back" style="ghost" arrow="left" onClick={goBack} />
      </div>

      {/* Settings Header */}
      <div className="px-4 py-2 text-xl font-semibold">Settings</div>

      {/* Menu Items */}
      <div className="px-4">
        {settingsMenu.map((menu, index) => (
          <div key={index} className="mt-4">
            {menu.subItems ? (
              <>
                <div className="text-medium font-semibold text-gray-600 dark:text-light">
                  {menu.label}
                </div>
                <ul className="mt-2 space-y-2">
                  {menu.subItems.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <Link href={subItem.href || "#"}>
                        <div className="block px-2 py-1 text-sm text-gray-700 rounded hover:bg-gray-400 dark:text-gray-300 dark:hover:bg-blue-100">
                          {subItem.label}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Link href={menu.href || "#"}>
                <div className="block px-2 py-1 text-sm font-medium text-gray-700 rounded hover:bg-gray-400">
                  {menu.label}
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsBar;
