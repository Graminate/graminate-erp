import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import HomeNavbar from "@/components/layout/Navbar/HomeNavbar";

interface PlatformLayoutProps {
  children: React.ReactNode;
}

const LoginLayout: React.FC<PlatformLayoutProps> = ({ children }) => {
  const [isOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();

  // Set the theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Extract userId from the URL query parameters
  useEffect(() => {
    if (router.query.user_id) {
      setUserId(router.query.user_id as string);
    }
  }, [router.query.user_id]);

  const handleSectionChange = (section: string) => {
    // Handle section change logic as needed
    console.log("Section changed:", section);
  };

  return (
    <div className="flex flex-col min-h-screen bg-light dark:bg-dark text-dark dark:text-light">
      <HomeNavbar />
      <div className="flex flex-1 min-h-screen">
        <Sidebar
          isOpen={isOpen}
          userId={userId}
          onSectionChange={handleSectionChange}
        />
        <div className="flex-1">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginLayout;
