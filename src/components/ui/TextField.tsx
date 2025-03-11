import { useState } from "react";

type Props = {
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  isDisabled?: boolean;
  type?: "success" | "error" | "disabled" | "";
  icon?: "left" | "right" | "";
  calendar?: boolean;
  password?: boolean;
  value: string;
  onChange: (val: string) => void;
  width?: "small" | "medium" | "large" | "";
};

const TextField = ({
  label = "",
  placeholder = "",
  errorMessage = "This cannot be left blank",
  isDisabled = false,
  type = "",
  icon = "",
  calendar = false,
  password = false,
  value,
  onChange,
  width = "",
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  const getFieldClass = () => {
    switch (type) {
      case "error":
        return "border border-red-200 text-gray-100 placeholder-gray-300 text-sm rounded-md block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-red-200";
      case "disabled":
        return "border border-gray-400 opacity-50 text-gray-100 placeholder-gray-300 text-sm rounded-md block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-red-200";
      default:
        return "border border-gray-400 dark:border-gray-200 text-gray-100 placeholder-gray-300 text-sm dark:bg-gray-700 dark:text-light rounded-md block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-green-200";
    }
  };

  const getWidthClass = () => {
    switch (width) {
      case "small":
        return "w-1/4";
      case "medium":
        return "w-1/2";
      case "large":
        return "w-full";
      default:
        return "w-auto";
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`w-full ${getWidthClass()}`}>
      {label && (
        <label
          htmlFor={calendar ? "calendar" : password ? "password" : "text"}
          className="block mb-1 text-sm font-medium text-gray-200 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {/* Input Field */}
        <input
          className={`${getFieldClass()} ${
            icon === "left" ? "pl-10" : icon === "right" ? "pr-10" : ""
          }`}
          disabled={isDisabled}
          type={
            calendar
              ? "date"
              : password
              ? showPassword
                ? "text"
                : "password"
              : "text"
          }
          id={calendar ? "calendar" : password ? "password" : "text"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {/* Password Toggle Button */}
        {password && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {type === "error" && (
        <div className="flex items-center mt-1">
          <span className="font-medium mr-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 text-red-200"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </span>
          <p className="text-sm text-red-200">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TextField;
