import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Swal from "sweetalert2";
import axios, { AxiosError } from "axios";

type Props = {
  children: React.ReactNode;
};

const PlatformLayout = ({ children }: Props) => {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();
  const { user_id } = router.query;

  useEffect(() => {
    if (router.query.user_id) {
      setUserId(router.query.user_id as string);
    }
  }, [router.query.user_id]);

  const handleSectionChange = (section: string) => {
    console.log("Section changed:", section);
  };

  useEffect(() => {
    if (!router.isReady || !user_id) return;

    const verifySession = async () => {
      setIsLoadingAuth(true);
      setIsAuthorized(false);

      try {
        await axios.get(`http://localhost:3001/api/user/${user_id}`, {
          withCredentials: true,
          timeout: 10000,
        });

        setIsAuthorized(true);
      } catch (error: any) {
        let errorText = "Session expired or unauthorized access.";

        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;

          if (axiosError.response?.status === 401) {
            errorText = "Session expired. Please log in again.";
          } else if (axiosError.response?.status === 404) {
            errorText = `User not found`;
          }
        }

        Swal.fire({
          title: "Access Denied",
          text: errorText,
          icon: "error",
          confirmButtonText: "OK",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((res) => {
          if (res.isConfirmed) {
            router.back();
          }
        });
      } finally {
        setIsLoadingAuth(false);
      }
    };
    verifySession().catch(() => {});
  }, [router.isReady, user_id]);

  // Authentication Check
  if (!router.isReady || isLoadingAuth || !isAuthorized) {
    return null;
  }
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
