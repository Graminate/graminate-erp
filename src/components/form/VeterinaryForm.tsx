import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import TextField from "@/components/ui/TextField";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";
import Swal from "sweetalert2";

const VeterinaryForm = ({ onClose, formTitle }: SidebarProp) => {
  const router = useRouter();
  const { user_id } = router.query;

  const [animate, setAnimate] = useState(false);
  const [vetForm, setVetForm] = useState({
    date: "",
    veterinaryName: "",
    birdType: "Chicken",
    purpose: "Broiler",
    birdsIn: 0,
    birdsDied: 0,
    vaccines: "",
    deworming: "Yes",
    symptoms: "",
    medications: "",
    actionsTaken: "",
    remarks: "",
  });

  const panelRef = useRef<HTMLDivElement>(null);

  useAnimatePanel(setAnimate);
  useClickOutside(panelRef, () => {
    setAnimate(false);
    setTimeout(() => handleClose(), 300);
  });

  const handleClose = () => {
    onClose();
  };

  const handleVetChange = (
    field: keyof typeof vetForm,
    value: string | number
  ) => {
    setVetForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const mortality =
      vetForm.birdsIn > 0
        ? Math.round((vetForm.birdsDied / vetForm.birdsIn) * 10000) / 100
        : null;

    const missingFields: string[] = [];
    if (!vetForm.date) missingFields.push("Visit Date");
    if (!vetForm.veterinaryName) missingFields.push("Veterinary Name");
    if (!vetForm.birdType) missingFields.push("Bird Type");
    if (!vetForm.purpose) missingFields.push("Purpose");
    if (!vetForm.birdsIn) missingFields.push("Birds In");
    if (!vetForm.birdsDied) missingFields.push("Birds Died");

    if (missingFields.length > 0) {
      const formatted = missingFields.join(", ");
      await import("sweetalert2").then(({ default: Swal }) =>
        Swal.fire({
          icon: "warning",
          title: "Missing Fields",
          text: `Please fill in the following: ${formatted}`,
        })
      );
      return;
    }

    try {
      await axiosInstance.post(`/poultry_health`, {
        user_id: user_id,
        date: vetForm.date,
        veterinary_name: vetForm.veterinaryName,
        bird_type: vetForm.birdType,
        purpose: vetForm.purpose,
        birds_in: vetForm.birdsIn,
        birds_died: vetForm.birdsDied,
        mortality_rate: mortality,
        vaccines: vetForm.vaccines
          ? vetForm.vaccines
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
          : [],
        deworming: vetForm.deworming,
        symptoms: vetForm.symptoms
          ? vetForm.symptoms
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        medications: vetForm.medications || "",
        actions_taken: vetForm.actionsTaken || "",
        remarks: vetForm.remarks || "",
      });
      handleClose();
      window.location.reload();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit veterinary data";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-1/3 bg-light dark:bg-gray-800 shadow-lg dark:border-l border-gray-200 overflow-y-auto"
        style={{
          transform: animate ? "translateX(0)" : "translateX(500px)",
          transition: "transform 300ms",
        }}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-dark dark:text-light">
              {formTitle ? formTitle : "Veterinary Record"}
            </h2>
            <button
              className="text-gray-300 hover:text-gray-100"
              onClick={handleClose}
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>
          </div>

          <form
            className="flex flex-col gap-4 w-full flex-grow"
            onSubmit={handleSubmit}
          >
            <fieldset className="space-y-4">
              <legend className="text-lg font-medium px-2 text-gray-800 dark:text-gray-300 -ml-2 mb-4">
                Health & Veterinary Information
              </legend>

              <TextField
                label="Veterinary Name"
                value={vetForm.veterinaryName}
                onChange={(val: string) =>
                  handleVetChange("veterinaryName", val)
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DropdownLarge
                  items={["Chicken", "Duck"]}
                  selectedItem={vetForm.birdType}
                  onSelect={(val: string) => handleVetChange("birdType", val)}
                  label="Bird Type"
                  type="form"
                  width="full"
                />
                <DropdownLarge
                  items={["Broiler", "Layer"]}
                  selectedItem={vetForm.purpose}
                  onSelect={(val: string) => handleVetChange("purpose", val)}
                  label="Purpose"
                  type="form"
                  width="full"
                />
                <DropdownLarge
                  items={["Yes", "No"]}
                  selectedItem={vetForm.deworming}
                  onSelect={(val: string) => handleVetChange("deworming", val)}
                  label="Deworming"
                  type="form"
                  width="full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Birds In"
                  number
                  value={vetForm.birdsIn.toString()}
                  onChange={(val: string) =>
                    handleVetChange("birdsIn", Number(val))
                  }
                />
                <TextField
                  label="Birds Died"
                  number
                  value={vetForm.birdsDied.toString()}
                  onChange={(val: string) =>
                    handleVetChange("birdsDied", Number(val))
                  }
                />
              </div>

              <TextField
                label="Visit Date"
                calendar
                value={vetForm.date}
                onChange={(val: string) => handleVetChange("date", val)}
              />

              <TextArea
                label="Vaccines"
                placeholder="Enter vaccine details (comma separated)"
                value={vetForm.vaccines}
                onChange={(val: string) => handleVetChange("vaccines", val)}
              />

              <TextArea
                label="Symptoms"
                placeholder="List of symptoms observed (comma separated)"
                value={vetForm.symptoms}
                onChange={(val: string) => handleVetChange("symptoms", val)}
              />

              <TextArea
                label="Medications"
                placeholder="List of medications for your poultry"
                value={vetForm.medications}
                onChange={(val: string) => handleVetChange("medications", val)}
              />

              <TextArea
                label="Actions Taken"
                placeholder="Actions taken by veterinary or to be taken on veterinary advice"
                value={vetForm.actionsTaken}
                onChange={(val: string) => handleVetChange("actionsTaken", val)}
              />

              <TextArea
                label="Remarks"
                placeholder="Any additional remarks or notes"
                value={vetForm.remarks}
                onChange={(val: string) => handleVetChange("remarks", val)}
              />
            </fieldset>

            <div className="flex justify-end gap-4 mt-4">
              <Button text="Cancel" style="secondary" onClick={handleClose} />
              <Button text="Submit" style="primary" type="submit" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VeterinaryForm;
