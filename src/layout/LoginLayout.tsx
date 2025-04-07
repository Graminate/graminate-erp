import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/layout/Footer";
import HomeNavbar from "@/components/layout/Navbar/HomeNavbar";

type PlatformLayoutProps = {
  children: React.ReactNode;
}

const LoginLayout = ({ children }: PlatformLayoutProps) => {
  const [isOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (router.query.user_id) {
      setUserId(router.query.user_id as string);
    }
  }, [router.query.user_id]);

  return (
    <div className="flex flex-col min-h-screen bg-light dark:bg-dark text-dark dark:text-light">
      <HomeNavbar />
      <div className="flex ">

        <div className="flex-1">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginLayout;
