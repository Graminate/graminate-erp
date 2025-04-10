import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import DropdownLarge from "../ui/Dropdown/DropdownLarge";
import NavPanel from "../layout/NavPanel";
import TextArea from "../ui/TextArea";
import axios from "axios";

interface PoultryFormData {
  totalChicks: number;
  flockId: string;
  breedType: string;
  flockAgeDays: number;
  expectedMarketDate: string;
  mortalityRate24h: number;
  vaccineStatus: string;
  nextVisit: string;
  totalEggsStock: number;
  dailyFeedConsumption: number;
  feedInventoryDays: number;
}

interface AddPoultryDataModalProps {
  formData: PoultryFormData;
  onClose: () => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  userId: string;
  refreshHealthRecords: () => Promise<void>;
}

const AddPoultryDataModal = ({
  formData,
  onClose,
  onChange,
  onSubmit,
  userId,
  refreshHealthRecords,
}: AddPoultryDataModalProps) => {
  const [activeView, setActiveView] = useState("flock");

  const [vetForm, setVetForm] = useState({
    date: "",
    veterinaryName: "",
    birdType: "Chicken",
    purpose: "Broiler",
    birdsIn: 0,
    birdsDied: 0,
    vaccines: "", // previously: [] as string[]
    deworming: "Yes",
    symptoms: "",
    medications: "",
    actionsTaken: "",
    remarks: "",
  });

  const handleVetChange = (field: string, value: any) => {
    setVetForm((prev) => ({ ...prev, [field]: value }));
  };

  const navButtons = [
    { name: "Flock Data", view: "flock" },
    { name: "Veterinary", view: "vet" },
    { name: "Egg Production", view: "eggs" },
    { name: "Food Supply", view: "feed" },
  ];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (activeView === "vet") {
      // Validation: Required fields only
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
        await axios.post("http://localhost:3001/api/poultry_health", {
          user_id: userId,
          date: vetForm.date,
          veterinary_name: vetForm.veterinaryName,
          bird_type: vetForm.birdType,
          purpose: vetForm.purpose,
          birds_in: vetForm.birdsIn,
          birds_died: vetForm.birdsDied,
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
        console.log("Veterinary data submitted successfully");
      } catch (error) {
        console.error("Error submitting veterinary data:", error);
      }
    }

    onSubmit(e);
    await refreshHealthRecords();
    onClose();

    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-2 pb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Enter/Update Poultry Data
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-3xl font-light leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* NavPanel */}
        <div className="mb-4">
          <NavPanel
            buttons={navButtons}
            activeView={activeView}
            onNavigate={(view) => setActiveView(view)}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Flock Data */}
          {activeView === "flock" && (
            <fieldset className="p-4">
              <legend className="text-lg font-medium px-2 text-gray-800 dark:text-gray-300 -ml-2">
                Flock Details
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-3">
                <TextField
                  label="Flock ID"
                  value={formData.flockId}
                  onChange={(val) =>
                    onChange({
                      target: { name: "flockId", value: val, type: "text" },
                    } as any)
                  }
                />
                <TextField
                  label="Breed Type"
                  value={formData.breedType}
                  onChange={(val) =>
                    onChange({
                      target: { name: "breedType", value: val, type: "text" },
                    } as any)
                  }
                />
                <TextField
                  label="Total Birds"
                  number
                  value={formData.totalChicks.toString()}
                  onChange={(val) =>
                    onChange({
                      target: {
                        name: "totalChicks",
                        value: val,
                        type: "number",
                      },
                    } as any)
                  }
                />
                <TextField
                  label="Flock Age (Days)"
                  number
                  value={formData.flockAgeDays.toString()}
                  onChange={(val) =>
                    onChange({
                      target: {
                        name: "flockAgeDays",
                        value: val,
                        type: "number",
                      },
                    } as any)
                  }
                />
                <TextField
                  label="Expected Market Date"
                  calendar
                  value={formData.expectedMarketDate}
                  onChange={(val) =>
                    onChange({
                      target: {
                        name: "expectedMarketDate",
                        value: val,
                        type: "date",
                      },
                    } as any)
                  }
                />
              </div>
            </fieldset>
          )}

          {/* Veterinary */}
          {activeView === "vet" && (
            <fieldset className="p-4">
              <legend className="text-lg font-medium px-2 text-gray-800 dark:text-gray-300 -ml-2">
                Health & Veterinary
              </legend>
              <div className="grid grid-rows-1 gap-6">
                <div className="flex flex-row gap-2">
                  <TextField
                    label="Appointment Visit Date"
                    calendar
                    value={vetForm.date}
                    onChange={(val) => handleVetChange("date", val)}
                  />
                  <TextField
                    label="Veterinary Name"
                    value={vetForm.veterinaryName}
                    onChange={(val) => handleVetChange("veterinaryName", val)}
                  />
                </div>

                <div className="flex flex-row gap-2 justify-center">
                  <DropdownLarge
                    items={["Chicken", "Duck"]}
                    selectedItem={vetForm.birdType}
                    onSelect={(val) => handleVetChange("birdType", val)}
                    label="Bird Type"
                    type="form"
                    width="full"
                  />
                  <DropdownLarge
                    items={["Broiler", "Layer"]}
                    selectedItem={vetForm.purpose}
                    onSelect={(val) => handleVetChange("purpose", val)}
                    label="Purpose"
                    type="form"
                    width="full"
                  />
                  <DropdownLarge
                    items={["Yes", "No"]}
                    selectedItem={vetForm.deworming}
                    onSelect={(val) => handleVetChange("deworming", val)}
                    label="Deworming"
                    type="form"
                    width="full"
                  />
                </div>

                <div className="flex flex-row gap-2">
                  <TextField
                    label="Birds In"
                    number
                    value={vetForm.birdsIn.toString()}
                    onChange={(val) => handleVetChange("birdsIn", Number(val))}
                  />
                  <TextField
                    label="Birds Died"
                    number
                    value={vetForm.birdsDied.toString()}
                    onChange={(val) =>
                      handleVetChange("birdsDied", Number(val))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mt-4">
                <TextArea
                  label="Vaccines"
                  placeholder="Enter vaccine details"
                  value={vetForm.vaccines}
                  onChange={(val) => handleVetChange("vaccines", val)}
                />
                <TextArea
                  label="Symptoms"
                  placeholder="List of symptoms observed"
                  value={vetForm.symptoms}
                  onChange={(val) => handleVetChange("symptoms", val)}
                />
                <TextArea
                  label="Medications"
                  value={vetForm.medications}
                  placeholder="List of medications for your poultry"
                  onChange={(val) => handleVetChange("medications", val)}
                />
                <TextArea
                  label="Actions Taken"
                  value={vetForm.actionsTaken}
                  placeholder="Actions taken by veterinary or to be taken on veterinary advice"
                  onChange={(val) => handleVetChange("actionsTaken", val)}
                />
                <TextArea
                  label="Remarks"
                  value={vetForm.remarks}
                  placeholder="Any additional remarks or notes"
                  onChange={(val) => handleVetChange("remarks", val)}
                />
              </div>
            </fieldset>
          )}

          {/* Egg Production */}
          {activeView === "eggs" && (
            <fieldset className="p-4">
              <legend className="text-lg font-medium px-2 text-gray-800 dark:text-gray-300 -ml-2">
                Egg Production
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-3">
                <TextField
                  label="Total Eggs in Stock"
                  number
                  value={formData.totalEggsStock.toString()}
                  onChange={(val) =>
                    onChange({
                      target: {
                        name: "totalEggsStock",
                        value: val,
                        type: "number",
                      },
                    } as any)
                  }
                />
              </div>
            </fieldset>
          )}

          {/* Food Supply */}
          {activeView === "feed" && (
            <fieldset className="p-4">
              <legend className="text-lg font-medium px-2 text-gray-800 dark:text-gray-300 -ml-2">
                Feed & Nutrition
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-3">
                <TextField
                  label="Daily Feed (kg)"
                  number
                  value={formData.dailyFeedConsumption.toString()}
                  onChange={(val) =>
                    onChange({
                      target: {
                        name: "dailyFeedConsumption",
                        value: val,
                        type: "number",
                      },
                    } as any)
                  }
                />
                <TextField
                  label="Feed Inventory (Days Left)"
                  number
                  value={formData.feedInventoryDays.toString()}
                  onChange={(val) =>
                    onChange({
                      target: {
                        name: "feedInventoryDays",
                        value: val,
                        type: "number",
                      },
                    } as any)
                  }
                />
              </div>
            </fieldset>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button text="Cancel" style="secondary" onClick={onClose} />
            <Button text="Save" style="primary" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPoultryDataModal;
