import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import NavPanel from "../layout/NavPanel";
import axiosInstance from "@/lib/utils/axiosInstance";

type PoultryFormData = {
  totalChicks: number;
  flockId: string;
  breedType: string;
  flockAgeDays: number;
  expectedMarketDate: string;
  mortalityRate: number | null;
  vaccineStatus: string;
  nextVisit: string;
  totalEggsStock: number;
  dailyFeedConsumption: number;
  feedInventoryDays: number;
};

type AddPoultryDataModalProps = {
  formData: PoultryFormData;
  onClose: () => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  userId: string;
  refreshHealthRecords: () => Promise<void>;
};

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
    vaccines: "",
    deworming: "Yes",
    symptoms: "",
    medications: "",
    actionsTaken: "",
    remarks: "",
  });

  const navButtons = [
    { name: "Flock Data", view: "flock" },
    { name: "Egg Production", view: "eggs" },
    { name: "Food Supply", view: "feed" },
  ];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (activeView === "vet") {
      // Calculate the mortality rate
      const mortality =
        vetForm.birdsIn > 0
          ? Math.round((vetForm.birdsDied / vetForm.birdsIn) * 10000) / 100
          : null;

      onChange({
        target: {
          name: "mortalityRate24h",
          value: mortality,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>);

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
        await axiosInstance.post(`/poultry_health`, {
          user_id: userId,
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
                  onChange={(val) => {
                    const event = {
                      target: {
                        name: "flockId",
                        value: val,
                        type: typeof val === "number" ? "number" : "text",
                      },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <TextField
                  label="Breed Type"
                  value={formData.breedType}
                  onChange={(val) => {
                    const event = {
                      target: {
                        name: "breedType",
                        value: val,
                        type: "text",
                      },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <TextField
                  label="Total Birds"
                  number
                  value={formData.totalChicks.toString()}
                  onChange={(val) => {
                    const event = {
                      target: {
                        name: "totalChicks",
                        value: Number(val),
                        type: "number",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <TextField
                  label="Flock Age (Days)"
                  number
                  value={formData.flockAgeDays.toString()}
                  onChange={(val) => {
                    const event = {
                      target: {
                        name: "flockAgeDays",
                        value: Number(val),
                        type: "number",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <TextField
                  label="Expected Market Date"
                  calendar
                  value={formData.expectedMarketDate}
                  onChange={(val) => {
                    const event = {
                      target: {
                        name: "expectedMarketDate",
                        value: val,
                        type: "date",
                      },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
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
                  onChange={(val) => {
                    const event = {
                      target: {
                        name: "totalEggsStock",
                        value: Number(val),
                        type: "number",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
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
                  onChange={(val) => {
                    const event = {
                      target: {
                        name: "dailyFeedConsumption",
                        value: Number(val),
                        type: "number",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <TextField
                  label="Feed Inventory (Days Left)"
                  number
                  value={formData.feedInventoryDays.toString()}
                  onChange={(val) => {
                    const event = {
                      target: {
                        name: "feedInventoryDays",
                        value: Number(val),
                        type: "number",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
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
