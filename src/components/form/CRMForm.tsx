import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import TextField from "@/components/ui/TextField";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import Button from "@/components/ui/Button";
import {
  CONTACT_TYPES,
  CONTRACT_STATUS,
  PAYMENT_STATUS,
} from "@/constants/options";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";

const CRMForm = ({ view, onClose, formTitle }: SidebarProp) => {
  const router = useRouter();
  const { user_id } = router.query;

  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [isLoadingSubTypes, setIsLoadingSubTypes] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUserSubTypes = async () => {
      setIsLoadingSubTypes(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        const response = await axiosInstance.get(`/user/${user_id}`);

        const user = response.data?.data?.user ?? response.data?.user;
        if (!user) throw new Error("User payload missing");

        setSubTypes(Array.isArray(user.sub_type) ? user.sub_type : []);
      } catch (err) {
        console.error("Error fetching user sub_types:", err);
        setSubTypes([]);
      } finally {
        setIsLoadingSubTypes(false);
      }
    };

    if (user_id) {
      fetchUserSubTypes();
    }
  }, [user_id]);

  const handleProjectInputChange = (val: string) => {
    setTaskValues({ ...taskValues, project: val });

    if (val.length > 0) {
      const filtered = subTypes.filter((subType) =>
        subType.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions(subTypes); // Show all suggestions when input is empty
      setShowSuggestions(true);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setTaskValues({ ...taskValues, project: suggestion });
    setShowSuggestions(false);
  };

  const handleProjectInputFocus = () => {
    if (subTypes.length > 0) {
      setSuggestions(subTypes);
      setShowSuggestions(true);
    }
  };

  useEffect(() => {
    const fetchUserSubTypes = async () => {
      setIsLoadingSubTypes(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        const response = await axiosInstance.get(`/user/${user_id}`);

        // Adjust this path based on your API response structure
        const user = response.data?.data?.user ?? response.data?.user;
        if (!user) throw new Error("User payload missing");

        setSubTypes(Array.isArray(user.sub_type) ? user.sub_type : []);
      } catch (err) {
        console.error("Error fetching user sub_types:", err);
        setSubTypes([]);
      } finally {
        setIsLoadingSubTypes(false);
      }
    };

    if (user_id) {
      fetchUserSubTypes();
    }
  }, [user_id]);

  const isValidE164 = (phone: string) => {
    return /^\+?[0-9]{10,15}$/.test(phone);
  };

  const [contactValues, setContactValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    type: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
  });
  const [contactErrors, setContactErrors] = useState({
    phoneNumber: "",
    address_line_1: "",
    city: "",
    state: "",
    postal_code: "",
  });

  const [companyValues, setCompanyValues] = useState({
    companyName: "",
    companyOwner: "",
    email: "",
    phoneNumber: "",
    type: "",

    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
  });
  const [companyErrors, setCompanyErrors] = useState({
    phoneNumber: "",
    address_line_1: "",
    city: "",
    state: "",
    postal_code: "",
  });

  const [contractsValues, setContractsValues] = useState({
    dealName: "",
    dealPartner: "",
    amountPaid: "",
    status: "",
    contractStartDate: "",
    contractEndDate: "",
  });
  const [receiptsValues, setReceiptsValues] = useState({
    title: "",
    billTo: "",
    amount_paid: "",
    amount_due: "",
    due_date: "",
    status: "",
  });
  const [taskValues, setTaskValues] = useState({
    project: "",
    task: "",
    status: "To Do",
    priority: "Medium",
    deadline: "",
  });
  const companyType = ["Supplier", "Distributor", "Factories", "Buyer"];
  const [animate, setAnimate] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleCloseAnimation = () => {
    setAnimate(false);
    setTimeout(() => onClose(), 300);
  };

  // hooks
  useAnimatePanel(setAnimate);
  useClickOutside(panelRef, handleCloseAnimation);

  const handleClose = () => {
    handleCloseAnimation();
  };

  // --- Validation Helper Functions ---
  const validateContactAddress = () => {
    const errors = {
      address_line_1: "",
      city: "",
      state: "",
      postal_code: "",
    };
    let isValid = true;

    if (!contactValues.address_line_1.trim()) {
      errors.address_line_1 = "Address Line 1 is required.";
      isValid = false;
    }
    if (!contactValues.city.trim()) {
      errors.city = "City is required.";
      isValid = false;
    }
    if (!contactValues.state.trim()) {
      errors.state = "State is required.";
      isValid = false;
    }
    if (!contactValues.postal_code.trim()) {
      errors.postal_code = "Postal Code is required.";
      isValid = false;
    }

    return { errors, isValid };
  };

  const validateCompanyAddress = () => {
    const errors = {
      address_line_1: "",
      city: "",
      state: "",
      postal_code: "",
    };
    let isValid = true;

    if (!companyValues.address_line_1.trim()) {
      errors.address_line_1 = "Address Line 1 is required.";
      isValid = false;
    }
    if (!companyValues.city.trim()) {
      errors.city = "City is required.";
      isValid = false;
    }
    if (!companyValues.state.trim()) {
      errors.state = "State is required.";
      isValid = false;
    }
    if (!companyValues.postal_code.trim()) {
      errors.postal_code = "Postal Code is required.";
      isValid = false;
    }

    return { errors, isValid };
  };

  const handleSubmitContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    const addressValidation = validateContactAddress();
    const phoneValid =
      isValidE164(contactValues.phoneNumber) || !contactValues.phoneNumber;
    const phoneErrorMsg = !phoneValid ? "Phone number is not valid" : "";

    setContactErrors({
      ...contactErrors,
      ...addressValidation.errors,
      phoneNumber: phoneErrorMsg,
    });

    if (!addressValidation.isValid || !phoneValid) {
      console.log("Contact form validation failed:", {
        ...addressValidation.errors,
        phoneNumber: phoneErrorMsg,
      });
      return;
    }

    const payload = {
      user_id: user_id,
      first_name: contactValues.firstName,
      last_name: contactValues.lastName,
      email: contactValues.email,
      phone_number: contactValues.phoneNumber,
      type: contactValues.type,
      address_line_1: contactValues.address_line_1,
      address_line_2: contactValues.address_line_2,
      city: contactValues.city,
      state: contactValues.state,
      postal_code: contactValues.postal_code,
    };
    try {
      await axiosInstance.post("/contacts/add", payload);
      setContactValues({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        type: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
      });
      setContactErrors({
        phoneNumber: "",
        address_line_1: "",
        city: "",
        state: "",
        postal_code: "",
      });
      handleClose();
      window.location.reload();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error adding contact:", message);
      alert(message);
    }
  };

  const handleSubmitCompanies = async (e: React.FormEvent) => {
    e.preventDefault();

    const addressValidation = validateCompanyAddress();
    const phoneValid =
      isValidE164(companyValues.phoneNumber) || !companyValues.phoneNumber;
    const phoneErrorMsg = !phoneValid ? "Add a valid phone number" : "";

    setCompanyErrors({
      ...companyErrors,
      ...addressValidation.errors,
      phoneNumber: phoneErrorMsg,
    });

    if (!addressValidation.isValid || !phoneValid) {
      console.log("Company form validation failed:", {
        ...addressValidation.errors,
        phoneNumber: phoneErrorMsg,
      });
      return;
    }
    const payload = {
      user_id: user_id,
      company_name: companyValues.companyName,
      owner_name: companyValues.companyOwner,
      email: companyValues.email,
      phone_number: companyValues.phoneNumber,
      type: companyValues.type,
      address_line_1: companyValues.address_line_1,
      address_line_2: companyValues.address_line_2,
      city: companyValues.city,
      state: companyValues.state,
      postal_code: companyValues.postal_code,
    };
    try {
      await axiosInstance.post("/companies/add", payload);
      setCompanyValues({
        companyName: "",
        companyOwner: "",
        email: "",
        phoneNumber: "",
        type: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
      });
      setCompanyErrors({
        phoneNumber: "",
        address_line_1: "",
        city: "",
        state: "",
        postal_code: "",
      });
      handleClose();
      window.location.reload();
    } catch (error: any) {
      if (error.response) {
        console.error("Error details:", error.response.data);
        alert(error.response.data?.error || "Failed to add company");
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("No response from server");
      } else {
        console.error("Request setup error:", error.message);
        alert("Request failed: " + error.message);
      }
    }
  };

  const handleSubmitContracts = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      user_id: user_id,
      deal_name: contractsValues.dealName,
      partner: contractsValues.dealPartner,
      amount: contractsValues.amountPaid,
      stage: contractsValues.status,
      start_date: contractsValues.contractStartDate,
      end_date: contractsValues.contractEndDate,
    };
    try {
      await axiosInstance.post("/contracts/add", payload);
      setContractsValues({
        dealName: "",
        dealPartner: "",
        amountPaid: "",
        status: "",
        contractStartDate: "",
        contractEndDate: "",
      });
      handleClose();
      window.location.reload();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error adding new contract:", message);
      alert(message);
    }
  };

  const handleSubmitReceipts = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      user_id,
      title: receiptsValues.title,
      bill_to: receiptsValues.billTo,
      amount_paid: receiptsValues.amount_paid,
      amount_due: receiptsValues.amount_due,
      due_date: receiptsValues.due_date,
      status: receiptsValues.status,
    };
    try {
      await axiosInstance.post("/receipts/add", payload);
      setReceiptsValues({
        title: "",
        billTo: "",
        amount_paid: "",
        amount_due: "",
        due_date: "",
        status: "",
      });
      handleClose();
      window.location.reload();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error adding new receipt:", message);
      alert(message);
    }
  };

  const handleSubmitTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      user_id,
      project: taskValues.project,
      task: taskValues.task,
      status: "To Do", // Changed from "Pending" to "To Do"
      priority: taskValues.priority || "Medium",
      deadline: taskValues.deadline,
    };

    try {
      const response = await axiosInstance.post("/tasks/add", payload);
      if (response.data && response.data.task) {
        setTaskValues({
          project: "",
          task: "",
          status: "To Do", // Also update the reset value here
          priority: "Medium",
          deadline: "",
        });
        handleClose();
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding new task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-light dark:bg-gray-800 shadow-lg dark:border-l border-gray-700 overflow-y-auto" // Adjusted width, added overflow
        style={{
          transform: animate ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-out",
        }}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-dark dark:text-light">
              {formTitle
                ? formTitle
                : `Create ${view.charAt(0).toUpperCase() + view.slice(1)}`}
            </h2>
            <button
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              onClick={handleClose}
              aria-label="Close panel"
            >
              <FontAwesomeIcon icon={faX} className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto pr-2 -mr-2">
            {view === "contacts" && (
              <form
                className="flex flex-col gap-4 w-full"
                onSubmit={handleSubmitContacts}
                noValidate
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <TextField
                    label="First Name"
                    placeholder="e.g. John"
                    value={contactValues.firstName}
                    onChange={(val: string) =>
                      setContactValues({ ...contactValues, firstName: val })
                    }
                  />
                  <TextField
                    label="Last Name"
                    placeholder="e.g. Doe"
                    value={contactValues.lastName}
                    onChange={(val: string) =>
                      setContactValues({ ...contactValues, lastName: val })
                    }
                  />
                </div>
                <TextField
                  label="Email"
                  placeholder="e.g. john.doe@gmail.com"
                  value={contactValues.email}
                  onChange={(val: string) =>
                    setContactValues({ ...contactValues, email: val })
                  }
                />
                <TextField
                  label="Phone Number"
                  placeholder="eg. +91 XXXXX XXXXX"
                  value={contactValues.phoneNumber}
                  onChange={(val: string) => {
                    setContactValues({
                      ...contactValues,
                      phoneNumber: val,
                    });

                    if (val && !isValidE164(val)) {
                      setContactErrors({
                        ...contactErrors,
                        phoneNumber: "Contact number not valid",
                      });
                    } else {
                      setContactErrors({ ...contactErrors, phoneNumber: "" });
                    }
                  }}
                  type={contactErrors.phoneNumber ? "error" : ""}
                  errorMessage={contactErrors.phoneNumber}
                />
                <DropdownLarge
                  items={CONTACT_TYPES}
                  selectedItem={contactValues.type}
                  onSelect={(value: string) =>
                    setContactValues({ ...contactValues, type: value })
                  }
                  type="form"
                  label="Type"
                  width="full"
                />

                {/* --- Address Fields with Validation --- */}
                <TextField
                  label="Address Line 1"
                  placeholder="e.g. Flat No. 203, Building C"
                  value={contactValues.address_line_1}
                  onChange={(val: string) =>
                    setContactValues({ ...contactValues, address_line_1: val })
                  }
                  type={contactErrors.address_line_1 ? "error" : ""}
                  errorMessage={contactErrors.address_line_1}
                />
                <TextField
                  label="Address Line 2 (Optional)"
                  placeholder="e.g. Green View Apartments, 5th Cross"
                  value={contactValues.address_line_2}
                  onChange={(val: string) =>
                    setContactValues({ ...contactValues, address_line_2: val })
                  }
                />
                <TextField
                  label="City"
                  placeholder="e.g. Bengaluru"
                  value={contactValues.city}
                  onChange={(val: string) =>
                    setContactValues({ ...contactValues, city: val })
                  }
                  type={contactErrors.city ? "error" : ""}
                  errorMessage={contactErrors.city}
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <TextField
                    label="State"
                    placeholder="e.g. Karnataka"
                    value={contactValues.state}
                    onChange={(val: string) =>
                      setContactValues({ ...contactValues, state: val })
                    }
                    type={contactErrors.state ? "error" : ""}
                    errorMessage={contactErrors.state}
                  />
                  <TextField
                    label="Postal Code"
                    placeholder="e.g. 560076"
                    value={contactValues.postal_code}
                    onChange={(val: string) =>
                      setContactValues({ ...contactValues, postal_code: val })
                    }
                    type={contactErrors.postal_code ? "error" : ""}
                    errorMessage={contactErrors.postal_code}
                  />
                </div>
                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    text="Cancel"
                    style="secondary"
                    onClick={handleClose}
                  />
                  <Button text="Create Contact" style="primary" type="submit" />
                </div>
              </form>
            )}
            {/* --- Companies Form --- */}
            {view === "companies" && (
              <form
                className="flex flex-col gap-4 w-full"
                onSubmit={handleSubmitCompanies}
                noValidate
              >
                <TextField
                  label="Company Name"
                  placeholder="Enter company name"
                  value={companyValues.companyName}
                  onChange={(val: string) =>
                    setCompanyValues({ ...companyValues, companyName: val })
                  }
                />
                <TextField
                  label="Owner Name"
                  placeholder="e.g. John Doe"
                  value={companyValues.companyOwner}
                  onChange={(val: string) =>
                    setCompanyValues({ ...companyValues, companyOwner: val })
                  }
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <TextField
                    label="Company Email"
                    placeholder="e.g. contact@company.com"
                    value={companyValues.email}
                    onChange={(val: string) =>
                      setCompanyValues({ ...companyValues, email: val })
                    }
                  />
                  <TextField
                    label="Company Phone"
                    placeholder="e.g. +91 XXXXX XXXXX"
                    value={companyValues.phoneNumber}
                    onChange={(val: string) => {
                      setCompanyValues({ ...companyValues, phoneNumber: val });
                      if (val && !isValidE164(val)) {
                        setCompanyErrors({
                          ...companyErrors,
                          phoneNumber: "Company phone invalid",
                        });
                      } else {
                        setCompanyErrors({ ...companyErrors, phoneNumber: "" });
                      }
                    }}
                    type={companyErrors.phoneNumber ? "error" : ""}
                    errorMessage={companyErrors.phoneNumber}
                  />
                </div>
                <DropdownLarge
                  items={companyType}
                  selectedItem={companyValues.type}
                  onSelect={(value: string) =>
                    setCompanyValues({ ...companyValues, type: value })
                  }
                  type="form"
                  label="Company Type"
                  width="full"
                />

                {/* --- Address Fields with Validation --- */}
                <TextField
                  label="Address Line 1"
                  placeholder="e.g. Head Office, Tower B"
                  value={companyValues.address_line_1}
                  onChange={(val: string) =>
                    setCompanyValues({ ...companyValues, address_line_1: val })
                  }
                  type={companyErrors.address_line_1 ? "error" : ""}
                  errorMessage={companyErrors.address_line_1}
                />
                <TextField
                  label="Address Line 2 (Optional)"
                  placeholder="e.g. Street Name, Area"
                  value={companyValues.address_line_2}
                  onChange={(val: string) =>
                    setCompanyValues({ ...companyValues, address_line_2: val })
                  }
                />
                <TextField
                  label="City"
                  placeholder="e.g. Mumbai"
                  value={companyValues.city}
                  onChange={(val: string) =>
                    setCompanyValues({ ...companyValues, city: val })
                  }
                  type={companyErrors.city ? "error" : ""}
                  errorMessage={companyErrors.city}
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <TextField
                    label="State"
                    placeholder="e.g. Maharashtra"
                    value={companyValues.state}
                    onChange={(val: string) =>
                      setCompanyValues({ ...companyValues, state: val })
                    }
                    type={companyErrors.state ? "error" : ""}
                    errorMessage={companyErrors.state}
                  />
                  <TextField
                    label="Postal Code"
                    placeholder="e.g. 400001"
                    value={companyValues.postal_code}
                    onChange={(val: string) =>
                      setCompanyValues({ ...companyValues, postal_code: val })
                    }
                    type={companyErrors.postal_code ? "error" : ""}
                    errorMessage={companyErrors.postal_code}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    text="Cancel"
                    style="secondary"
                    onClick={handleClose}
                  />
                  <Button text="Create Company" style="primary" type="submit" />
                </div>
              </form>
            )}
            {/* --- Contracts Form --- */}
            {view === "contracts" && (
              <form
                className="flex flex-col gap-4 w-full"
                onSubmit={handleSubmitContracts}
              >
                <TextField
                  label="Contract Name"
                  placeholder="Name of your Contract"
                  value={contractsValues.dealName}
                  onChange={(val: string) =>
                    setContractsValues({ ...contractsValues, dealName: val })
                  }
                />
                <TextField
                  label="Partner Name"
                  placeholder="Company, Business owner"
                  value={contractsValues.dealPartner}
                  onChange={(val: string) =>
                    setContractsValues({ ...contractsValues, dealPartner: val })
                  }
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <TextField
                    label="Amount Involved (₹)"
                    placeholder="Budget involved"
                    value={contractsValues.amountPaid}
                    onChange={(val: string) =>
                      setContractsValues({
                        ...contractsValues,
                        amountPaid: val,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <DropdownLarge
                    label="Status"
                    items={CONTRACT_STATUS}
                    selectedItem={contractsValues.status}
                    onSelect={(val: string) =>
                      setContractsValues({ ...contractsValues, status: val })
                    }
                    type="form"
                    width="full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <TextField
                    label="Start Date"
                    placeholder="YYYY-MM-DD"
                    value={contractsValues.contractStartDate}
                    onChange={(val: string) =>
                      setContractsValues({
                        ...contractsValues,
                        contractStartDate: val,
                      })
                    }
                    calendar
                  />
                  <TextField
                    label="Contract End Date"
                    placeholder="YYYY-MM-DD"
                    value={contractsValues.contractEndDate}
                    onChange={(val: string) =>
                      setContractsValues({
                        ...contractsValues,
                        contractEndDate: val,
                      })
                    }
                    calendar
                  />
                </div>
                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    text="Cancel"
                    style="secondary"
                    onClick={handleClose}
                  />
                  <Button
                    text="Create Contract"
                    style="primary"
                    type="submit"
                  />
                </div>
              </form>
            )}
            {/* --- Receipts Form --- */}
            {view === "receipts" && (
              <form
                className="flex flex-col gap-4 w-full"
                onSubmit={handleSubmitReceipts}
              >
                <TextField
                  label="Receipt Title"
                  placeholder="Name of your receipt / invoice"
                  value={receiptsValues.title}
                  onChange={(val: string) =>
                    setReceiptsValues({ ...receiptsValues, title: val })
                  }
                />
                <TextField
                  label="Bill To"
                  placeholder="Customer Details"
                  value={receiptsValues.billTo}
                  onChange={(val: string) =>
                    setReceiptsValues({ ...receiptsValues, billTo: val })
                  }
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <TextField
                    label="Paid (₹)"
                    placeholder="Amount Paid"
                    value={receiptsValues.amount_paid}
                    onChange={(val: string) =>
                      setReceiptsValues({ ...receiptsValues, amount_paid: val })
                    }
                  />
                  <TextField
                    label="Amount Due (₹)"
                    placeholder="Amount yet to be paid"
                    value={receiptsValues.amount_due}
                    onChange={(val: string) =>
                      setReceiptsValues({ ...receiptsValues, amount_due: val })
                    }
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <TextField
                    label="Due Date"
                    placeholder="YYYY-MM-DD"
                    value={receiptsValues.due_date}
                    onChange={(val: string) =>
                      setReceiptsValues({ ...receiptsValues, due_date: val })
                    }
                    calendar
                  />
                  <DropdownLarge
                    items={PAYMENT_STATUS}
                    selectedItem={receiptsValues.status}
                    onSelect={(value: string) =>
                      setReceiptsValues({ ...receiptsValues, status: value })
                    }
                    type="form"
                    label="Status"
                    width="full"
                  />
                </div>
                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    text="Cancel"
                    style="secondary"
                    onClick={handleClose}
                  />
                  <Button text="Create Receipt" style="primary" type="submit" />
                </div>
              </form>
            )}
            {view === "tasks" && (
              <form
                className="flex flex-col gap-4 w-full"
                onSubmit={handleSubmitTasks}
              >
                <div className="relative">
                  <TextField
                    label="Task Category"
                    placeholder="e.g. Poultry / Animal Husbandry / Apiculture"
                    value={taskValues.project}
                    onChange={handleProjectInputChange}
                    onFocus={handleProjectInputFocus}
                    isLoading={isLoadingSubTypes}
                  />
                  {suggestions.length > 0 && showSuggestions && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-md shadow-lg"
                    >
                     <p className="text-xs p-2 text-gray-300">Suggestions...</p>
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-light dark:hover:bg-gray-800 text-sm cursor-pointer"
                          onClick={() => selectSuggestion(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <TextField
                  label="Task"
                  placeholder="Your task here"
                  value={taskValues.task}
                  onChange={(val: string) =>
                    setTaskValues({ ...taskValues, task: val })
                  }
                />

                <DropdownLarge
                  items={["Low", "Medium", "High"]}
                  selectedItem={taskValues.priority}
                  onSelect={(value: string) =>
                    setTaskValues({ ...taskValues, priority: value })
                  }
                  type="form"
                  label="Priority"
                  width="full"
                />

                <TextField
                  label="Deadline"
                  placeholder="YYYY-MM-DD"
                  value={taskValues.deadline}
                  onChange={(val: string) =>
                    setTaskValues({ ...taskValues, deadline: val })
                  }
                  calendar
                />

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    text="Cancel"
                    style="secondary"
                    onClick={handleClose}
                  />
                  <Button text="Create Task" style="primary" type="submit" />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMForm;
