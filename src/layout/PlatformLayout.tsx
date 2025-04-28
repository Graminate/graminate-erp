import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Swal from "sweetalert2";
import axios, { AxiosError } from "axios";
import ChatWindow from "@/layout/ChatWindow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "@/lib/utils/axiosInstance";

type Props = {
  children: React.ReactNode;
};

const PlatformLayout = ({ children }: Props) => {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const router = useRouter();
  const { user_id } = router.query;

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user_id) {
      setUserId(user_id as string);
    } else {
      setUserId("");
    }
  }, [user_id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isChatOpen &&
        chatRef.current &&
        !chatRef.current.contains(event.target as Node)
      ) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatOpen]);

  const handleSectionChange = (section: string) => {
    console.log("Sidebar Section changed:", section);
  };

  const verifySession = useCallback(
    async (currentUserId: string) => {
      setIsLoadingAuth(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthorized(false);
        Swal.fire({
          title: "Unauthorized",
          text: "Please log in first.",
          icon: "error",
          confirmButtonText: "OK",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          router.push("/");
        });
        return;
      }

      try {
        await axiosInstance.get(`/user/${currentUserId}`, {
          timeout: 10000,
        });

        setIsAuthorized(true);
      } catch (error: unknown) {
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
        }).then(() => {
          router.push("/");
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
          isOpen={true} // Set to true since we removed the state
          userId={userId}
          onSectionChange={handleSectionChange}
        />
        <div className="flex-1 p-4">{children}</div>
      </div>

      <button
        onClick={() => setIsChatOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 bg-green-200 text-white p-4 rounded-full shadow-lg hover:bg-green-100 z-50"
      >
        <FontAwesomeIcon icon={faRobot} />
      </button>

      {isChatOpen && (
        <div ref={chatRef}>
          <ChatWindow />
        </div>
      )}
    </div>
  );
};

export default PlatformLayout;
