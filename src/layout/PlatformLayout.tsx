import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar/Navbar";
import Sidebar from "@/components/layout/Sidebar";

interface PlatformLayoutProps {
  children: React.ReactNode;
}

const PlatformLayout: React.FC<PlatformLayoutProps> = ({ children }) => {
  // Set sidebarOpen to true so that the Sidebar is visible by default
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (router.query.user_id) {
      setUserId(router.query.user_id as string);
    }
  }, [router.query.user_id]);

  const handleSectionChange = (section: string) => {
    console.log("Section changed:", section);
  };

  return (
    <div className="flex flex-col min-h-screen bg-light dark:bg-dark text-dark dark:text-light">
      <Navbar userId={userId} />
      <div className="flex flex-1 min-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          userId={userId}
          onSectionChange={handleSectionChange}
        />
        <div className="flex-1 p-4">{children}</div>
      </div>
    </div>
  );
};

export default PlatformLayout;
