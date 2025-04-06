import { useEffect, useState } from "react";
import { showToast, toastMessage } from "@/stores/toast";

const Toast = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubToast = showToast.subscribe((value: boolean) => {
      if (value) {
        setShouldRender(true);
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setTimeout(() => setShouldRender(false), 300);
      }
    });

    return unsubToast;
  }, []);

  useEffect(() => {
    const unsubMessage = toastMessage.subscribe((value: string | null) => {
      setMessage(value ?? "");
    });

    return unsubMessage;
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timeout = setTimeout(() => {
        showToast.set(false);
        toastMessage.set("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed right-4 bottom-4 left-4 max-w-xs md:right-6 md:bottom-6 md:left-auto md:max-w-sm px-4 py-3 rounded-lg text-white shadow-md transition-all duration-300 ease-in-out transform ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      } bg-green-600`}
    >
      <p className="text-sm font-semibold text-center md:text-left">
        {message}
      </p>
    </div>
  );
};

export default Toast;
