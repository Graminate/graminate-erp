import React, { useState, useCallback } from "react";
import { triggerToast } from "@/stores/toast";
import Button from "../ui/Button";
import TextField from "../ui/TextField";

type Step = "businessName" | "businessType" | "subType";

type FirstLoginModalProps = {
  isOpen: boolean;
  userId: string;
  onSubmit: (
    businessName: string,
    businessType: string,
    subType?: string[]
  ) => Promise<void>;
  onClose: () => void;
};

const BUSINESS_TYPES = ["Producer", "Wholesaler", "Processor"];
const AGRICULTURE_TYPES = ["Fishery", "Poultry", "Animal Husbandry"];
const MODAL_TITLE_ID = "first-login-modal-title";

const FirstLoginModal = ({
  isOpen,
  onSubmit,
  onClose,
}: FirstLoginModalProps) => {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [step, setStep] = useState<Step>("businessName");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubTypes, setSelectedSubTypes] = useState<string[]>([]);

  const handleBusinessNameChange = useCallback((value: string) => {
    setBusinessName(value);
  }, []);

  const handleBusinessTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setBusinessType(event.target.value);
    },
    []
  );

  // Move from Step 1 to Step 2 after validating business name.
  const goToNextStep = useCallback(() => {
    if (!businessName.trim()) {
      triggerToast("Business Name cannot be blank.", "error");
      return;
    }
    setStep("businessType");
  }, [businessName]);

  const goToPreviousStep = () => {
    setStep((prev) => {
      if (prev === "subType") return "businessType";
      if (prev === "businessType") return "businessName";
      return prev;
    });
  };

  const handleBusinessTypeSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (businessType === "Producer") {
        setStep("subType");
      } else {
        handleSubmit();
      }
    },
    [businessType]
  );

  // Final submission for users that did not select Producer.
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      await onSubmit(businessName.trim(), businessType, selectedSubTypes);
    } catch (error) {
      triggerToast("Failed to save details. Please try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [businessName, businessType, onSubmit]);

  // Submission for Producer users including their selected sub-types.
  const handleSubTypeSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);
      try {
        await onSubmit(businessName.trim(), businessType, selectedSubTypes);
      } catch (error) {
        triggerToast(
          "Failed to save details. Please try again later.",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [businessName, businessType, selectedSubTypes, onSubmit]
  );

  // Toggle the selection for an agriculture sub-type.
  const handleSubTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSelectedSubTypes((prev) => {
        if (prev.includes(value)) {
          return prev.filter((item) => item !== value);
        }
        return [...prev, value];
      });
    },
    []
  );

  if (!isOpen) {
    return null;
  }

  const renderStepContent = () => {
    if (step === "businessName") {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToNextStep();
          }}
          noValidate
        >
          <h2
            id={MODAL_TITLE_ID}
            className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white"
          >
            Welcome! Just a couple more details...
          </h2>
          <p className="text-sm text-center text-dark dark:text-light mb-6">
            Step 1 of 3
          </p>
          <div className="mb-6">
            <TextField
              label="What is your Business Name?"
              placeholder="e.g. Graminate Agrosoft Ltd."
              value={businessName}
              onChange={handleBusinessNameChange}
            />
          </div>
          <div className="flex justify-end mt-8">
            <Button
              text="Next"
              style="primary"
              type="submit"
              isDisabled={!businessName.trim()}
            />
          </div>
        </form>
      );
    }

    if (step === "businessType") {
      return (
        <form onSubmit={handleBusinessTypeSubmit} noValidate>
          <h2
            id={MODAL_TITLE_ID}
            className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white"
          >
            Select Your Business Type
          </h2>
          <p className="text-sm text-center text-dark dark:text-light mb-6">
            Step 2 of 3
          </p>
          <fieldset className="mb-6">
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose your primary type of Business:
            </legend>
            <div className="space-y-3 mt-2">
              {BUSINESS_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-3 p-3 border rounded-md border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                >
                  <input
                    type="radio"
                    name="businessType"
                    value={type}
                    checked={businessType === type}
                    onChange={handleBusinessTypeChange}
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                  />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-between items-center mt-8">
            <Button
              text="Back"
              style="secondary"
              onClick={goToPreviousStep}
              type="button"
              isDisabled={isLoading}
            />
            <Button
              text={
                businessType === "Producer"
                  ? "Next"
                  : isLoading
                  ? "Saving..."
                  : "Get Started"
              }
              style="primary"
              type="submit"
              isDisabled={isLoading}
            />
          </div>
        </form>
      );
    }

    if (step === "subType") {
      return (
        <form onSubmit={handleSubTypeSubmit} noValidate>
          <h2
            id={MODAL_TITLE_ID}
            className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white"
          >
            Choose Your Type of Agriculture
          </h2>
          <p className="text-sm text-center text-dark dark:text-light mb-6">
            Step 3 of 3
          </p>
          <fieldset className="mb-6">
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select one or more options:
            </legend>
            <div className="space-y-3 mt-2">
              {AGRICULTURE_TYPES.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-3 p-3 border rounded-md border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                >
                  <input
                    type="checkbox"
                    name="subType"
                    value={option}
                    checked={selectedSubTypes.includes(option)}
                    onChange={handleSubTypeChange}
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                  />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-between items-center mt-8">
            <Button
              text="Back"
              style="secondary"
              onClick={goToPreviousStep}
              type="button"
              isDisabled={isLoading}
            />
            <Button
              text={isLoading ? "Saving..." : "Get Started"}
              style="primary"
              type="submit"
              isDisabled={isLoading}
            />
          </div>
        </form>
      );
    }

    return null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-light bg-opacity-60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={MODAL_TITLE_ID}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg relative transition-all duration-300 ease-out">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default FirstLoginModal;
