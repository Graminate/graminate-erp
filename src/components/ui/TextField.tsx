import {
  faEye,
  faEyeSlash,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  number?: boolean;
  value: string;
  onChange: (val: string) => void;
  width?: "small" | "medium" | "large" | "";
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
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
  number = false,
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
              : number
              ? "number"
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
              <FontAwesomeIcon icon={faEyeSlash} className="size-4" />
            ) : (
              <FontAwesomeIcon icon={faEye} className="size-4" />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {type === "error" && (
        <div className="flex items-center mt-1">
          <span className="font-medium mr-1">
            <FontAwesomeIcon
              icon={faInfoCircle}
              className="size-6 text-red-200"
            />
          </span>
          <p className="text-sm text-red-200">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TextField;
