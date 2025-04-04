import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";

type PaymentData = {
  payment_id: number;
  labour_id: number;
  payment_date: string;
  base_salary: number;
  bonus: number;
  overtime_pay: number;
  housing_allowance: number;
  travel_allowance: number;
  meal_allowance: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
};

type SalaryModalProps = {
  labourId: number | string;
  onClose: () => void;
  onSuccess: () => void;
  editMode?: boolean;
  initialData?: PaymentData;
};

const SalaryModal = ({
  labourId,
  onClose,
  onSuccess,
  editMode = false,
  initialData,
}: SalaryModalProps) => {
  const [paymentDate, setPaymentDate] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [overtimePay, setOvertimePay] = useState("");
  const [housingAllowance, setHousingAllowance] = useState("");
  const [travelAllowance, setTravelAllowance] = useState("");
  const [mealAllowance, setMealAllowance] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode && initialData) {
      setPaymentDate(initialData.payment_date.slice(0, 10));
      setBaseSalary(initialData.base_salary.toString());
      setBonus(initialData.bonus.toString());
      setOvertimePay(initialData.overtime_pay.toString());
      setHousingAllowance(initialData.housing_allowance.toString());
      setTravelAllowance(initialData.travel_allowance.toString());
      setMealAllowance(initialData.meal_allowance.toString());
      setPaymentStatus(initialData.payment_status);
    } else {
      setPaymentDate("");
      setBaseSalary("");
      setBonus("");
      setOvertimePay("");
      setHousingAllowance("");
      setTravelAllowance("");
      setMealAllowance("");
      setPaymentStatus("Pending");
    }
  }, [editMode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentDate || !baseSalary) {
      Swal.fire(
        "Error",
        "Payment Date and Base Salary are required.",
        "warning"
      );
      return;
    }

    setLoading(true);

    const parseOrDefault = (value: string) => parseFloat(value) || 0;

    const payload = {
      labour_id: labourId,
      payment_date: paymentDate,
      base_salary: parseOrDefault(baseSalary),
      bonus: parseOrDefault(bonus),
      overtime_pay: parseOrDefault(overtimePay),
      housing_allowance: parseOrDefault(housingAllowance),
      travel_allowance: parseOrDefault(travelAllowance),
      meal_allowance: parseOrDefault(mealAllowance),
      payment_status: paymentStatus,
    };

    try {
      if (editMode && initialData) {
        await axios.put("http://localhost:3001/api/labour_payment/update", {
          ...payload,
          payment_id: initialData.payment_id,
        });
      } else {
        await axios.post(
          "http://localhost:3001/api/labour_payment/add",
          payload
        );
      }
      await Swal.fire(
        "Success",
        editMode
          ? "Salary updated successfully!"
          : "Salary added successfully!",
        "success"
      );
      onClose();
      onSuccess();
      window.location.reload();
    } catch (error) {
      console.error("Error submitting salary data:", error);
      const errorMessage =
        (error as any).response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out">
      <div className="bg-white dark:bg-gray-800 w-full max-w-3xl max-h-[90vh] my-auto overflow-y-auto p-8 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-600">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editMode ? "Update Salary" : "Add New Salary"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Payment Date *"
              calendar
              value={paymentDate}
              onChange={setPaymentDate}
              width="large"
            />
            <TextField
              label="Base Salary *"
              number
              value={baseSalary}
              onChange={setBaseSalary}
              width="large"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Bonus"
              number
              value={bonus}
              onChange={setBonus}
              width="large"
              placeholder="0.00"
            />
            <TextField
              label="Overtime Pay"
              number
              value={overtimePay}
              onChange={setOvertimePay}
              width="large"
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TextField
              label="Housing Allowance"
              number
              value={housingAllowance}
              onChange={setHousingAllowance}
              width="large"
              placeholder="0.00"
            />
            <TextField
              label="Travel Allowance"
              number
              value={travelAllowance}
              onChange={setTravelAllowance}
              width="large"
              placeholder="0.00"
            />
            <TextField
              label="Meal Allowance"
              number
              value={mealAllowance}
              onChange={setMealAllowance}
              width="large"
              placeholder="0.00"
            />
          </div>

          <DropdownLarge
            items={["Pending", "Paid"]}
            selectedItem={paymentStatus}
            onSelect={setPaymentStatus}
            label="Payment Status"
            type="form"
            width="full"
          />

          <div className="flex justify-end gap-4 pt-6 mt-8">
            <Button
              text="Cancel"
              style="secondary"
              onClick={onClose}
              type="button"
              isDisabled={loading}
            />
            <Button
              text={
                loading
                  ? editMode
                    ? "Updating..."
                    : "Adding..."
                  : editMode
                  ? "Update Salary"
                  : "Add Salary"
              }
              style="primary"
              type="submit"
              isDisabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryModal;
