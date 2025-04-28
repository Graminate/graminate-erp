import React, { useState } from "react";
import Swal from "sweetalert2";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import axios from "axios";
import { API_BASE_URL } from "@/constants/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";

type Props = {
  isOpen: boolean;
  closeModal: () => void;
};

const ForgotPasswordModal = ({ isOpen, closeModal }: Props) => {
  const [email, setEmail] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        title: "Error",
        text: "Please enter your email address.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/password/forgot`, { email });

      Swal.fire({
        title: "Email Sent",
        text: "Please check your email for the reset password link.",
        icon: "success",
        confirmButtonText: "OK",
      });

      closeModal();
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to send reset password email.";

      console.error("Error:", message);

      Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm bg-opacity-50">
      <div className="bg-white dark:bg-dark rounded-lg shadow-lg p-8 w-11/12 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-500 p-3 rounded-full">
            <FontAwesomeIcon icon={faKey} className="w-8 h-8 text-gray-300" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Forgot password?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          No worries, we’ll send you reset instructions.
        </p>

        <form onSubmit={handleResetPassword}>
          <div className="mb-4 text-left">
            <TextField
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(val: string) => setEmail(val)}
              width="large"
            />
          </div>
          <div className="flex flex-col gap-4">
            <Button
              text="Reset Password"
              width="large"
              style="primary"
              type="submit"
            />
            <Button text="Back to log in" style="ghost" onClick={closeModal} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
