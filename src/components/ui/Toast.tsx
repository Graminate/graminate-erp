import { useEffect, useState } from "react";

import { showToast, toastMessage } from "@/stores/toast";

const Toast = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = showToast.subscribe((value: boolean) => {
      setIsVisible(value);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = toastMessage.subscribe((value: string | null) => {
      setMessage(value ?? "");
    });
    return unsubscribe;
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 bottom-4 left-4 max-w-xs rounded-lg bg-green-600 px-4 py-3 text-center text-white shadow-md transition-all duration-300 md:right-6 md:bottom-6 md:left-auto md:max-w-sm md:text-left transform translate-y-0">
      <p className="text-sm font-semibold">{message}</p>
    </div>
  );
};

export default Toast;
