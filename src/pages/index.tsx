import React, { useState, FormEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

import LoginLayout from "@/layout/LoginLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import ForgotPasswordModal from "@/components/modals/ForgotPasswordModal";
import OTPModal from "@/components/modals/OTPModal";
import axios from "axios";

const SignIn = () => {
  const router = useRouter();

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [userEmailForOtp, setUserEmailForOtp] = useState("");

  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const openForgotPasswordModal = () => {
    setLoginErrorMessage("");
    setIsForgotPasswordModalOpen(true);
  };
  const closeForgotPasswordModal = () => {
    setIsForgotPasswordModalOpen(false);
  };

  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    business_name: "",
    date_of_birth: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    first_name: false,
    last_name: false,
    email: false,
    phone_number: false,
    date_of_birth: false,
    password: false,
  });

  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState(
    "This cannot be left blank"
  );
  const [phoneErrorMessage, setPhoneErrorMessage] = useState(
    "This cannot be left blank"
  );
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginErrorMessage("");

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setLoginErrorMessage("Email and password are required.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/user/login",
        loginData,
        { withCredentials: true }
      );

      const responseData = response.data;
      router.push(`/platform/${responseData.user.user_id}`);
    } catch (error: any) {
      console.error("Error during login:", error);
      Swal.fire({
        title: "Login Failed",
        text: error.response?.data?.error || "Invalid email or password.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFieldErrors({
      first_name: false,
      last_name: false,
      email: false,
      phone_number: false,
      date_of_birth: false,
      password: false,
    });
    setEmailErrorMessage("This cannot be left blank");
    setPhoneErrorMessage("This cannot be left blank");
    setPasswordErrorMessage("");

    let hasError = false;
    const newFieldErrors = { ...fieldErrors };

    if (!registerData.first_name.trim()) {
      newFieldErrors.first_name = true;
      hasError = true;
    }
    if (!registerData.last_name.trim()) {
      newFieldErrors.last_name = true;
      hasError = true;
    }
    if (!validateEmail(registerData.email)) {
      newFieldErrors.email = true;
      setEmailErrorMessage("Enter a valid email ID");
      hasError = true;
    }
    if (!validatePhoneNumber(registerData.phone_number)) {
      newFieldErrors.phone_number = true;
      setPhoneErrorMessage("Enter valid phone number");
      hasError = true;
    }
    if (!registerData.date_of_birth.trim()) {
      newFieldErrors.date_of_birth = true;
      hasError = true;
    }
    if (!validatePassword(registerData.password)) {
      newFieldErrors.password = true;
      setPasswordErrorMessage(
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      hasError = true;
    }
    setFieldErrors(newFieldErrors);
    if (hasError) {
      return;
    }

    setUserEmailForOtp(registerData.email);

    try {
      await axios.post("http://localhost:3001/api/otp/send-otp", {
        email: registerData.email,
      });

      setIsOtpModalOpen(true);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to send OTP. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleOtpValidation = async (otp: string) => {
    try {
      const verifyResponse = await axios.post(
        "http://localhost:3001/api/otp/verify-otp",
        {
          email: userEmailForOtp,
          otp,
        }
      );

      const verifyData = verifyResponse.data;

      if (!verifyData.success) {
        Swal.fire({
          title: "Invalid OTP",
          text: "The OTP entered is incorrect. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      await axios.post("http://localhost:3001/api/user/register", registerData);

      Swal.fire({
        title: "Registration Successful!",
        text: "You can now log in.",
        icon: "success",
        confirmButtonText: "OK",
      });

      setIsOtpModalOpen(false);
      toggleForm();
    } catch (error: any) {
      if (error.response?.status === 409) {
        Swal.fire({
          title: "User already exists",
          text: "Please use a different email or phone number.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          title: "Error",
          text:
            error.response?.data?.message ||
            "An error occurred. Please try again later.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
      console.error("Error during OTP validation and registration:", error);
    }
  };
  return (
    <>
      <Head>
        <title>Welcome to Graminate: Manage your Agricultural Budget</title>
      </Head>
      <LoginLayout>
        <div
          className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
          style={{ backgroundImage: "url('/images/cover.png')" }}
        >
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg px-8 py-6 w-full max-w-md">
            {isLogin ? (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-center dark:text-light">
                  Login
                </h2>
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <TextField
                      label="Email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(val) =>
                        setLoginData({ ...loginData, email: val })
                      }
                      width="large"
                    />
                  </div>
                  <div className="mb-6">
                    <TextField
                      label="Password"
                      placeholder="Enter your password"
                      password
                      value={loginData.password}
                      onChange={(val) =>
                        setLoginData({
                          ...loginData,
                          password: val,
                        })
                      }
                      width="large"
                    />
                  </div>
                  {loginErrorMessage && (
                    <p className="text-red-500 text-sm mb-4">
                      {loginErrorMessage}
                    </p>
                  )}
                  <div className="mx-auto flex flex-row justify-center">
                    <Button
                      text="Login"
                      width="large"
                      style="primary"
                      type="submit"
                    />
                  </div>
                  <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
                    <button
                      className="text-blue-500 hover:underline focus:outline-none"
                      type="button"
                      onClick={openForgotPasswordModal}
                    >
                      Forgot Password?
                    </button>
                  </p>
                </form>
                <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
                  Don't have an account?{" "}
                  <button
                    className="text-blue-500 hover:underline focus:outline-none"
                    type="button"
                    onClick={toggleForm}
                  >
                    Sign Up
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  Sign Up
                </h2>
                <form onSubmit={handleRegister}>
                  <div className="flex flex-row gap-2">
                    <div className="mb-4">
                      <TextField
                        label="First Name"
                        placeholder="Enter your First Name"
                        type={fieldErrors.first_name ? "error" : ""}
                        value={registerData.first_name}
                        onChange={(val) =>
                          setRegisterData({
                            ...registerData,
                            first_name: val,
                          })
                        }
                        width="large"
                      />
                    </div>
                    <div className="mb-4">
                      <TextField
                        label="Last Name"
                        placeholder="Enter your Last Name"
                        type={fieldErrors.last_name ? "error" : ""}
                        value={registerData.last_name}
                        onChange={(val) =>
                          setRegisterData({
                            ...registerData,
                            last_name: val,
                          })
                        }
                        width="large"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <TextField
                      label="Email"
                      placeholder="Enter your Email"
                      type={fieldErrors.email ? "error" : ""}
                      value={registerData.email}
                      onChange={(val) =>
                        setRegisterData({
                          ...registerData,
                          email: val,
                        })
                      }
                      errorMessage={emailErrorMessage}
                      width="large"
                    />
                  </div>
                  <div className="mb-4">
                    <TextField
                      label="Phone Number"
                      placeholder="Enter your Phone Number"
                      type={fieldErrors.phone_number ? "error" : ""}
                      value={registerData.phone_number}
                      onChange={(val) =>
                        setRegisterData({
                          ...registerData,
                          phone_number: val,
                        })
                      }
                      errorMessage={phoneErrorMessage}
                      width="large"
                    />
                  </div>
                  <div className="mb-4">
                    <TextField
                      label="Business Name (optional)"
                      placeholder="Enter name of your Farm Business"
                      value={registerData.business_name}
                      onChange={(val) =>
                        setRegisterData({
                          ...registerData,
                          business_name: val,
                        })
                      }
                      width="large"
                    />
                  </div>
                  <div className="mb-4">
                    <TextField
                      label="Date of Birth"
                      placeholder="YYYY-MM-DD"
                      type={fieldErrors.date_of_birth ? "error" : ""}
                      value={registerData.date_of_birth}
                      onChange={(val) =>
                        setRegisterData({
                          ...registerData,
                          date_of_birth: val,
                        })
                      }
                      width="large"
                      calendar
                    />
                  </div>
                  <div className="mb-4">
                    <TextField
                      label="Password"
                      placeholder="Enter your password"
                      password
                      type={fieldErrors.password ? "error" : ""}
                      value={registerData.password}
                      onChange={(val) =>
                        setRegisterData({
                          ...registerData,
                          password: val,
                        })
                      }
                      errorMessage={passwordErrorMessage}
                      width="large"
                    />
                  </div>
                  <div className="mx-auto flex flex-row justify-center">
                    <Button
                      text="Sign Up"
                      width="large"
                      style="primary"
                      type="submit"
                    />
                  </div>
                </form>
                <p className="text-center mt-4 text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    className="text-blue-500 hover:underline focus:outline-none"
                    type="button"
                    onClick={toggleForm}
                  >
                    Login
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </LoginLayout>

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        closeModal={closeForgotPasswordModal}
      />
      <OTPModal
        isOpen={isOtpModalOpen}
        email={userEmailForOtp}
        onValidate={handleOtpValidation}
        onClose={() => setIsOtpModalOpen(false)}
      />
    </>
  );
};

export default SignIn;
