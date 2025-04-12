import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Swal from "sweetalert2";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/constants/constants";

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
    if (user_id) {
      setUserId(user_id as string);
    } else {
      setUserId("");
    }
  }, [user_id]);

  const handleSectionChange = (section: string) => {
    console.log("Sidebar Section changed:", section);
  };

  const verifySession = useCallback(
    async (currentUserId: string) => {
      setIsLoadingAuth(true);

      try {
        await axios.get(`${API_BASE_URL}/user/${currentUserId}`, {
          withCredentials: true,
          timeout: 10000,
        });
        setIsAuthorized(true);
      } catch (error: any) {
        setIsAuthorized(false);
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
    },
    [router]
  );

  useEffect(() => {
    const accountJustDeleted = sessionStorage.getItem("accountJustDeleted");
    if (accountJustDeleted === "true") {
      sessionStorage.removeItem("accountJustDeleted");
      setIsLoadingAuth(false);
      setIsAuthorized(false);
      return;
    }

    if (!router.isReady) {
      setIsLoadingAuth(true);
      return;
    }

    if (!user_id) {
      setIsLoadingAuth(false);
      setIsAuthorized(false);
      return;
    }

    setIsAuthorized(false);
    verifySession(user_id as string).catch(console.error);
  }, [router.isReady, user_id, verifySession]);

  if (!router.isReady || isLoadingAuth) {
    return null;
  }

  if (!isAuthorized) {
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
