import React, { useState } from "react";
import { triggerToast } from "@/stores/toast";
import Button from "../ui/Button";
import TextField from "../ui/TextField";

type FirstLoginModalProp = {
  isOpen: boolean;
  userId: string;
  onSubmit: (businessName: string, businessType: string) => Promise<void>;
  onClose: () => void;
};

const FirstLoginModal = ({
  isOpen,
  userId,
  onSubmit,
  onClose,
}: FirstLoginModalProp) => {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Producer");
  const [step, setStep] = useState<"businessName" | "businessType">(
    "businessName"
  );

  if (!isOpen) return null;

  const businessNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      triggerToast("Business Name cannot be blank.", "error");
      return;
    }
    setStep("businessType");
  };

  const handleBusinessTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(businessName, businessType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-light dark:bg-dark">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        {step === "businessName" && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              A few more questions
            </h2>
            <form onSubmit={businessNameSubmit}>
              <div className="mb-6">
                <TextField
                  label="What is your Business Name?"
                  placeholder="e.g. Graminate Agrosoft Ltd."
                  value={businessName}
                  onChange={(val: string) => setBusinessName(val)}
                />
              </div>
              <div className="flex justify-end">
                <Button text="Next" style="primary" type="submit" />
              </div>
            </form>
          </>
        )}

        {step === "businessType" && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Select Your Business Type
            </h2>
            <form onSubmit={handleBusinessTypeSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-200 mb-1">
                  Choose your type of Business:
                </label>
                <div className="flex flex-col gap-3 mt-2">
                  {["Producer", "Wholesaler", "Processor"].map((type) => (
                    <label key={type} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="businessType"
                        value={type}
                        checked={businessType === type}
                        onChange={() => setBusinessType(type)}
                      />
                      <span className="text-gray-800 dark:text-gray-200">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button text="Submit" style="primary" type="submit" />
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default FirstLoginModal;
