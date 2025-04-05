import Button from "@/components/ui/Button";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import TextArea from "@/components/ui/TextArea";
import TextField from "@/components/ui/TextField";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { GENDER, YESNO } from "@/constants/options";
import axios from "axios";

const LabourDetails = () => {
  const router = useRouter();
  const [labour, setLabour] = useState<any | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [aadharCardNumber, setAadharCardNumber] = useState("");
  const [address, setAddress] = useState("");
  const [queryData, setQueryData] = useState<string | null>(null);
  const [role, setRole] = useState("");

  // Optional fields
  const [rationCard, setRationCard] = useState("");
  const [panCard, setPanCard] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [mnregaJobCardNumber, setMnregaJobCardNumber] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [disabilityStatus, setDisabilityStatus] = useState("");

  const [epfo, setEpfo] = useState("");
  const [esic, setEsic] = useState("");
  const [pmKisan, setPmKisan] = useState("");

  const [baseSalary, setBaseSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [overtimePay, setOvertimePay] = useState("");
  const [housingAllowance, setHousingAllowance] = useState("");
  const [travelAllowance, setTravelAllowance] = useState("");
  const [mealAllowance, setMealAllowance] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("");

  const [initialFormData, setInitialFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    contactNumber: "",
    aadharCardNumber: "",
    address: "",
    rationCard: "",
    panCard: "",
    drivingLicense: "",
    mnregaJobCardNumber: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    bankBranch: "",
    disabilityStatus: "",
    role: "",
    epfo: "",
    esic: "",
    pmKisan: "",
    baseSalary: "",
    bonus: "",
    overtimePay: "",
    housingAllowance: "",
    travelAllowance: "",
    mealAllowance: "",
    paymentFrequency: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.data) {
      setQueryData(router.query.data as string);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!queryData) return;
    try {
      const parsedLabour = JSON.parse(queryData);
      setLabour(parsedLabour);
      setDisplayName(`${parsedLabour.full_name} (${parsedLabour.role})`); // Point to remember
      setFullName(parsedLabour.full_name || "");
      setDateOfBirth(
        new Date(parsedLabour.date_of_birth).toLocaleDateString() || ""
      );
      setGender(parsedLabour.gender || "");
      setContactNumber(parsedLabour.contact_number || "");
      setAadharCardNumber(parsedLabour.aadhar_card_number || "");
      setAddress(parsedLabour.address || "");
      setRole(parsedLabour.role || "");

      setRationCard(parsedLabour.ration_card ?? "");
      setPanCard(parsedLabour.pan_card ?? "");
      setDrivingLicense(parsedLabour.driving_license ?? "");
      setMnregaJobCardNumber(parsedLabour.mnrega_job_card_number ?? "");
      setBankAccountNumber(parsedLabour.bank_account_number ?? "");
      setIfscCode(parsedLabour.ifsc_code ?? "");
      setBankName(parsedLabour.bank_name ?? "");
      setBankBranch(parsedLabour.bank_branch ?? "");
      setDisabilityStatus(parsedLabour.disability_status ? "Yes" : "No");
      setEpfo(parsedLabour.epfo ?? "");
      setEsic(parsedLabour.esic ?? "");
      setPmKisan(parsedLabour.pm_kisan ? "Yes" : "No");
      setBaseSalary(parsedLabour.base_salary?.toString() || "");
      setBonus(parsedLabour.bonus?.toString() || "");
      setOvertimePay(parsedLabour.overtime_pay?.toString() || "");
      setHousingAllowance(parsedLabour.housing_allowance?.toString() || "");
      setTravelAllowance(parsedLabour.travel_allowance?.toString() || "");
      setMealAllowance(parsedLabour.meal_allowance?.toString() || "");
      setPaymentFrequency(parsedLabour.payment_frequency || "Monthly");

      setInitialFormData({
        fullName: parsedLabour.full_name || "",
        dateOfBirth:
          new Date(parsedLabour.date_of_birth).toLocaleDateString() || "",
        gender: parsedLabour.gender || "",
        contactNumber: parsedLabour.contact_number || "",
        aadharCardNumber: parsedLabour.aadhar_card_number || "",
        address: parsedLabour.address || "",
        rationCard: parsedLabour.ration_card || "",
        panCard: parsedLabour.pan_card || "",
        drivingLicense: parsedLabour.driving_license || "",
        mnregaJobCardNumber: parsedLabour.mnrega_job_card_number || "",
        bankAccountNumber: parsedLabour.bank_account_number || "",
        ifscCode: parsedLabour.ifsc_code || "",
        bankName: parsedLabour.bank_name || "",
        bankBranch: parsedLabour.bank_branch || "",
        disabilityStatus: parsedLabour.disability_status ? "Yes" : "No",
        role: parsedLabour.role || "",
        epfo: parsedLabour.epfo || "",
        esic: parsedLabour.esic || "",
        pmKisan: parsedLabour.pm_kisan ? "Yes" : "No",
        baseSalary: parsedLabour.base_salary?.toString() || "",
        bonus: parsedLabour.bonus?.toString() || "",
        overtimePay: parsedLabour.overtime_pay?.toString() || "",
        housingAllowance: parsedLabour.housing_allowance?.toString() || "",
        travelAllowance: parsedLabour.travel_allowance?.toString() || "",
        mealAllowance: parsedLabour.meal_allowance?.toString() || "",
        paymentFrequency: parsedLabour.payment_frequency || "Monthly",
      });
    } catch (error) {
      console.error("Error parsing labour data:", error);
    }
  }, [queryData]);

  const hasChanges =
    fullName !== initialFormData.fullName ||
    dateOfBirth !== initialFormData.dateOfBirth ||
    gender !== initialFormData.gender ||
    contactNumber !== initialFormData.contactNumber ||
    aadharCardNumber !== initialFormData.aadharCardNumber ||
    address !== initialFormData.address ||
    rationCard !== initialFormData.rationCard ||
    panCard !== initialFormData.panCard ||
    drivingLicense !== initialFormData.drivingLicense ||
    mnregaJobCardNumber !== initialFormData.mnregaJobCardNumber ||
    bankAccountNumber !== initialFormData.bankAccountNumber ||
    ifscCode !== initialFormData.ifscCode ||
    bankName !== initialFormData.bankName ||
    bankBranch !== initialFormData.bankBranch ||
    disabilityStatus !== initialFormData.disabilityStatus ||
    role !== initialFormData.role ||
    epfo !== initialFormData.epfo ||
    esic !== initialFormData.esic ||
    pmKisan !== initialFormData.pmKisan ||
    baseSalary !== initialFormData.baseSalary ||
    bonus !== initialFormData.bonus ||
    overtimePay !== initialFormData.overtimePay ||
    housingAllowance !== initialFormData.housingAllowance ||
    travelAllowance !== initialFormData.travelAllowance ||
    mealAllowance !== initialFormData.mealAllowance ||
    paymentFrequency !== initialFormData.paymentFrequency;

  const handleSave = async () => {
    setSaving(true);

    if (!labour || !labour.labour_id) {
      Swal.fire("Error", "Labour ID is missing. Cannot update.", "error");
      setSaving(false);
      return;
    }

    const payload = {
      labour_id: labour.labour_id,
      full_name: fullName,
      date_of_birth: dateOfBirth,
      gender: gender,
      contact_number: contactNumber,
      aadhar_card_number: aadharCardNumber,
      address: address,

      // Government Data
      ration_card: rationCard,
      pan_card: panCard,
      driving_license: drivingLicense,
      mnrega_job_card_number: mnregaJobCardNumber,

      // Bank Data
      bank_account_number: bankAccountNumber,
      ifsc_code: ifscCode,
      bank_name: bankName,
      bank_branch: bankBranch,

      // Other optional fields
      disability_status: disabilityStatus === "Yes",
      role: role,
      epfo: epfo,
      esic: esic,
      pm_kisan: pmKisan === "Yes",

      base_salary: parseFloat(baseSalary),
      bonus: parseFloat(bonus),
      overtime_pay: parseFloat(overtimePay),
      housing_allowance: parseFloat(housingAllowance),
      travel_allowance: parseFloat(travelAllowance),
      meal_allowance: parseFloat(mealAllowance),
      payment_frequency: paymentFrequency,
    };

    console.log("Sending update request with payload:", payload);

    try {
      const response = await axios.put(
        "http://localhost:3001/api/labour/update",
        payload
      );

      console.log("Response from API:", response.data);

      Swal.fire("Success", "Labour updated successfully", "success");

      setLabour(response.data.updatedLabour);
      setInitialFormData({
        fullName: payload.full_name,
        dateOfBirth: payload.date_of_birth,
        gender: payload.gender,
        contactNumber: payload.contact_number,
        aadharCardNumber: payload.aadhar_card_number,
        address: payload.address,
        rationCard: payload.ration_card,
        panCard: payload.pan_card,
        drivingLicense: payload.driving_license,
        mnregaJobCardNumber: payload.mnrega_job_card_number,
        bankAccountNumber: payload.bank_account_number,
        ifscCode: payload.ifsc_code,
        bankName: payload.bank_name,
        bankBranch: payload.bank_branch,
        disabilityStatus: payload.disability_status ? "Yes" : "No",
        role: payload.role,
        epfo: payload.epfo,
        esic: payload.esic,
        pmKisan: payload.pm_kisan ? "Yes" : "No",
        baseSalary: payload.base_salary?.toString() || "",
        bonus: payload.bonus?.toString() || "",
        overtimePay: payload.overtime_pay?.toString() || "",
        housingAllowance: payload.housing_allowance?.toString() || "",
        travelAllowance: payload.travel_allowance?.toString() || "",
        mealAllowance: payload.meal_allowance?.toString() || "",
        paymentFrequency: payload.payment_frequency || "Monthly",
      });
    } catch (error: any) {
      console.error("Error updating labour:", error);
      Swal.fire(
        "Error",
        error.response?.data?.error ||
          "An error occurred while updating the labour.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Graminate | Employee Database</title>
      </Head>
      <PlatformLayout>
        <div className="px-6">
          <Button
            text="Back"
            style="ghost"
            arrow="left"
            onClick={() =>
              router.push(`/platform/${router.query.user_id}/labour_database`)
            }
          />
          <div className="pt-4">
            <h1 className="text-2xl font-bold mb-6">{displayName}</h1>

            {/* Personal Data Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-400">
                Personal Data
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Full Name"
                  value={fullName}
                  onChange={(val) => setFullName(val)}
                  width="large"
                />
                <TextField
                  label="Date of Birth"
                  value={dateOfBirth}
                  onChange={(val) => setDateOfBirth(val)}
                  width="large"
                />
                <DropdownLarge
                  items={GENDER}
                  selectedItem={gender}
                  onSelect={(value: string) => setGender(value)}
                  type="form"
                  label="Gender"
                  width="full"
                />

                <TextField
                  label="Contact Number"
                  value={contactNumber}
                  onChange={(val) => setContactNumber(val)}
                  width="large"
                />
                <TextField
                  label="Aadhar Card"
                  value={aadharCardNumber}
                  onChange={(val) => setAadharCardNumber(val)}
                  width="large"
                />
                <TextField
                  label="Role"
                  value={role}
                  onChange={(val) => setRole(val)}
                  width="large"
                />
                <div className="col-span-2">
                  <TextArea
                    label="Address"
                    placeholder="Address"
                    value={address}
                    onChange={(val: string) => setAddress(val)}
                  />
                </div>
              </div>
            </div>

            {/* Salary Data Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-400">
                Salary Data
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Basic Salary (₹)"
                  value={baseSalary}
                  onChange={setBaseSalary}
                  width="large"
                />
                <DropdownLarge
                  label="Payment Frequency"
                  items={["Monthly", "Weekly", "Bi-weekly", "Daily"]}
                  selectedItem={paymentFrequency}
                  onSelect={(value) => setPaymentFrequency(value)}
                  type="form"
                  width="full"
                />
                <TextField
                  label="Bonus (₹)"
                  value={bonus}
                  onChange={setBonus}
                  width="large"
                />
                <TextField
                  label="Overtime Pay (₹)"
                  value={overtimePay}
                  onChange={setOvertimePay}
                  width="large"
                />
                <TextField
                  label="Housing Allowance (Optional) (₹)"
                  value={housingAllowance}
                  onChange={setHousingAllowance}
                  width="large"
                />
                <TextField
                  label="Travel Allowance (Optional) (₹)"
                  value={travelAllowance}
                  onChange={setTravelAllowance}
                  width="large"
                />
                <TextField
                  label="Meal Allowance (Optional) (₹)"
                  value={mealAllowance}
                  onChange={setMealAllowance}
                  width="large"
                />
              </div>
            </div>

            {/* Government Compliance Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-400">
                Government Compliance Data
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Ration Card"
                  value={rationCard}
                  onChange={(val) => setRationCard(val)}
                  width="large"
                />

                <TextField
                  label="PAN Card"
                  value={panCard}
                  onChange={(val) => setPanCard(val)}
                  width="large"
                />

                <TextField
                  label="Driving License"
                  value={drivingLicense}
                  onChange={(val) => setDrivingLicense(val)}
                  width="large"
                />

                <TextField
                  label="MNREGA Job Card Number"
                  value={mnregaJobCardNumber}
                  onChange={(val) => setMnregaJobCardNumber(val)}
                  width="large"
                />

                <DropdownLarge
                  items={YESNO}
                  selectedItem={disabilityStatus} // Will default to "" if no data is found
                  onSelect={(value: string) => setDisabilityStatus(value)}
                  type="form"
                  label="Disability Status"
                  width="full"
                />

                <TextField
                  label="EPFO"
                  value={epfo}
                  onChange={(val) => setEpfo(val)}
                  width="large"
                />

                <TextField
                  label="ESIC"
                  value={esic}
                  onChange={(val) => setEsic(val)}
                  width="large"
                />

                <DropdownLarge
                  items={YESNO}
                  selectedItem={pmKisan}
                  onSelect={(value: string) => setPmKisan(value)}
                  type="form"
                  label="PM-KISAN"
                  width="full"
                />
              </div>
            </div>

            {/* Bank Data Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-400">
                Bank Data
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Bank Account Number"
                  value={bankAccountNumber}
                  onChange={(val) => setBankAccountNumber(val)}
                  width="large"
                />
                <TextField
                  label="IFSC Code"
                  value={ifscCode}
                  onChange={(val) => setIfscCode(val)}
                  width="large"
                />
                <TextField
                  label="Bank Name"
                  value={bankName}
                  onChange={(val) => setBankName(val)}
                  width="large"
                />
                <TextField
                  label="Bank Branch"
                  value={bankBranch}
                  onChange={(val) => setBankBranch(val)}
                  width="large"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row mt-6 space-x-4">
              <Button
                text={saving ? "Updating..." : "Update"}
                style="primary"
                onClick={handleSave}
                isDisabled={!hasChanges || saving}
              />
              <Button
                text="Cancel"
                style="secondary"
                onClick={() =>
                  router.push(
                    `/platform/${router.query.user_id}/labour_database`
                  )
                }
              />
            </div>
          </div>
        </div>
      </PlatformLayout>
    </>
  );
};

export default LabourDetails;
