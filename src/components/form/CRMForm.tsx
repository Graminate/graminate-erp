import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import TextField from "@/components/ui/TextField";
import TextArea from "@/components/ui/TextArea";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import Button from "@/components/ui/Button";
import CustomTable from "@/components/tables/CustomTable";
import { CONTACT_TYPES, CONTRACT_STATUS } from "@/constants/options";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";
import { triggerToast } from "@/stores/toast";

type Item = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

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
      setSuggestions(subTypes);
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

  const isValidE164 = (phone: string) => /^\+?[0-9]{10,15}$/.test(phone);

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
    contactPerson: "",
    email: "",
    phoneNumber: "",
    type: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    website: "",
    industry: "",
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
    category: "",
    priority: "Medium",
  });

  const initialReceiptItem: Item = {
    description: "",
    quantity: 1,
    rate: 0,
    amount: 0,
  };
  const [receiptsValues, setReceiptsValues] = useState({
    title: "",
    receiptNumber: "",
    billTo: "",
    dueDate: "",
    paymentTerms: "",
    notes: "",
    tax: "0",
    discount: "0",
    shipping: "0",
    billToAddressLine1: "",
    billToAddressLine2: "",
    billToCity: "",
    billToState: "",
    billToPostalCode: "",
    billToCountry: "",
    items: [initialReceiptItem],
  });
  const [receiptErrors, setReceiptErrors] = useState({
    title: "",
    receiptNumber: "",
    billTo: "",
    dueDate: "",
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

  useAnimatePanel(setAnimate);
  useClickOutside(panelRef, handleCloseAnimation);

  const handleClose = () => handleCloseAnimation();

  const validateContactAddress = () => {
    const errors = { address_line_1: "", city: "", state: "", postal_code: "" };
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
      triggerToast("Please correct the errors in the form.", "error");
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
      triggerToast("Contact added successfully!", "success");
      handleClose();
      window.location.reload();
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      triggerToast(`Error: ${message}`, "error");
    }
  };

  const handleSubmitCompanies = async (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = [
      "companyName",
      "contactPerson",
      "address_line_1",
      "city",
      "state",
      "postal_code",
    ];
    const missingFields = requiredFields.filter(
      (field) => !companyValues[field as keyof typeof companyValues]?.trim()
    );
    if (missingFields.length > 0) {
      triggerToast(
        `Please fill in required fields: ${missingFields.join(", ")}`,
        "error"
      );
      return;
    }
    if (companyValues.phoneNumber && !isValidE164(companyValues.phoneNumber)) {
      setCompanyErrors({
        ...companyErrors,
        phoneNumber: "Please enter a valid phone number (e.g. +1234567890)",
      });
      triggerToast("Invalid company phone number.", "error");
      return;
    } else {
      setCompanyErrors({ ...companyErrors, phoneNumber: "" });
    }
    if (
      companyValues.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyValues.email)
    ) {
      triggerToast("Please enter a valid email address.", "error");
      return;
    }
    const payload = {
      user_id: user_id,
      company_name: companyValues.companyName,
      contact_person: companyValues.contactPerson,
      email: companyValues.email || null,
      phone_number: companyValues.phoneNumber || null,
      type: companyValues.type || null,
      address_line_1: companyValues.address_line_1,
      address_line_2: companyValues.address_line_2 || null,
      city: companyValues.city,
      state: companyValues.state,
      postal_code: companyValues.postal_code,
      website: companyValues.website || null,
      industry: companyValues.industry || null,
    };
    try {
      const response = await axiosInstance.post("/companies/add", payload);
      if (response.status === 201) {
        setCompanyValues({
          companyName: "",
          contactPerson: "",
          email: "",
          phoneNumber: "",
          type: "",
          address_line_1: "",
          address_line_2: "",
          city: "",
          state: "",
          postal_code: "",
          website: "",
          industry: "",
        });
        triggerToast("Company added successfully!", "success");
        handleClose();
        window.location.reload();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to add company";
      triggerToast(`Error: ${message}`, "error");
    }
  };

  const handleSubmitContracts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !contractsValues.dealName ||
      !contractsValues.status ||
      !contractsValues.amountPaid
    ) {
      triggerToast("Please fill in Contract Name, Stage, and Amount.", "error");
      return;
    }
    const payload = {
      user_id: user_id,
      deal_name: contractsValues.dealName,
      partner: contractsValues.dealPartner,
      amount: contractsValues.amountPaid,
      stage: contractsValues.status,
      start_date: contractsValues.contractStartDate || null,
      end_date: contractsValues.contractEndDate || null,
      category: contractsValues.category,
      priority: contractsValues.priority,
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
        category: "",
        priority: "Medium",
      });
      triggerToast("Contract added successfully!", "success");
      handleClose();
      window.location.reload();
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      triggerToast(`Error: ${message}`, "error");
    }
  };

  const validateReceiptForm = () => {
    const errors = { title: "", receiptNumber: "", billTo: "", dueDate: "" };
    let isValid = true;
    if (!receiptsValues.title.trim()) {
      errors.title = "Title is required.";
      isValid = false;
    }
    if (!receiptsValues.receiptNumber.trim()) {
      errors.receiptNumber = "Invoice Number is required.";
      isValid = false;
    }
    if (!receiptsValues.billTo.trim()) {
      errors.billTo = "Bill To (Customer) is required.";
      isValid = false;
    }
    if (!receiptsValues.dueDate.trim()) {
      errors.dueDate = "Due Date is required.";
      isValid = false;
    }
    setReceiptErrors(errors);
    return isValid;
  };

  const handleReceiptItemsChange = (newItems: Item[]) => {
    setReceiptsValues((prev) => ({ ...prev, items: newItems }));
  };

  const handleSubmitReceipts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReceiptForm()) {
      triggerToast("Please fill all required invoice fields.", "error");
      return;
    }
    const payload = {
      user_id,
      title: receiptsValues.title,
      bill_to: receiptsValues.billTo,
      due_date: receiptsValues.dueDate,
      receipt_number: receiptsValues.receiptNumber,
      payment_terms: receiptsValues.paymentTerms || null,
      notes: receiptsValues.notes || null,
      tax: parseFloat(receiptsValues.tax) || 0,
      discount: parseFloat(receiptsValues.discount) || 0,
      shipping: parseFloat(receiptsValues.shipping) || 0,
      bill_to_address_line1: receiptsValues.billToAddressLine1 || null,
      bill_to_address_line2: receiptsValues.billToAddressLine2 || null,
      bill_to_city: receiptsValues.billToCity || null,
      bill_to_state: receiptsValues.billToState || null,
      bill_to_postal_code: receiptsValues.billToPostalCode || null,
      bill_to_country: receiptsValues.billToCountry || null,
      items: receiptsValues.items
        .map(({ amount, ...rest }) => ({
          description: rest.description,
          quantity: Number(rest.quantity) || 0,
          rate: Number(rest.rate) || 0,
        }))
        .filter((item) => item.description && item.description.trim() !== ""),
    };
    try {
      await axiosInstance.post("/receipts/add", payload);
      setReceiptsValues({
        title: "",
        receiptNumber: "",
        billTo: "",
        dueDate: "",
        paymentTerms: "",
        notes: "",
        tax: "0",
        discount: "0",
        shipping: "0",
        billToAddressLine1: "",
        billToAddressLine2: "",
        billToCity: "",
        billToState: "",
        billToPostalCode: "",
        billToCountry: "",
        items: [initialReceiptItem],
      });
      setReceiptErrors({
        title: "",
        receiptNumber: "",
        billTo: "",
        dueDate: "",
      });
      triggerToast("Invoice added successfully!", "success");
      handleClose();
      window.location.reload();
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      if (error.response?.status === 409) {
        triggerToast("Error: Invoice number already exists.", "error");
        setReceiptErrors((prev) => ({
          ...prev,
          receiptNumber: "This invoice number is already in use.",
        }));
      } else {
        triggerToast(`Error: ${message}`, "error");
      }
    }
  };

  const handleSubmitTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskValues.project || !taskValues.task) {
      triggerToast(
        "Please fill in Task Category and Task description.",
        "error"
      );
      return;
    }
    const payload = {
      user_id,
      project: taskValues.project,
      task: taskValues.task,
      status: "To Do",
      priority: taskValues.priority || "Medium",
      deadline: taskValues.deadline || null,
    };
    try {
      const response = await axiosInstance.post("/tasks/add", payload);
      if (response.data && response.data.task) {
        setTaskValues({
          project: "",
          task: "",
          status: "To Do",
          priority: "Medium",
          deadline: "",
        });
        triggerToast("Task added successfully!", "success");
        handleClose();
        window.location.reload();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create task. Please try again.";
      triggerToast(`Error: ${message}`, "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full md:w-[650px] bg-light dark:bg-gray-800 shadow-lg dark:border-l border-gray-700 overflow-y-auto" // Increased width for better invoice layout
        style={{
          transform: animate ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-out",
        }}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-400 dark:border-gray-200">
            <h2 className="text-xl font-semibold text-dark dark:text-light">
              {formTitle
                ? formTitle
                : `Create ${
                    view === "receipts" // Use "Invoice" for receipts view
                      ? "Invoice"
                      : view
                      ? view.charAt(0).toUpperCase() + view.slice(1)
                      : ""
                  }`}
            </h2>
            <button
              className="text-gray-300 hover:text-gray-200 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              onClick={handleClose}
              aria-label="Close panel"
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-6">
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
                    setContactValues({ ...contactValues, phoneNumber: val });
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
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-400 dark:border-gray-200">
                  <Button
                    text="Cancel"
                    style="secondary"
                    onClick={handleClose}
                  />
                  <Button text="Create Contact" style="primary" type="submit" />
                </div>
              </form>
            )}
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
                  label="Contact Person"
                  placeholder="e.g. John Doe"
                  value={companyValues.contactPerson}
                  onChange={(val: string) =>
                    setCompanyValues({ ...companyValues, contactPerson: val })
                  }
                />
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
                <DropdownLarge
                  items={companyType}
                  selectedItem={companyValues.type}
                  onSelect={(value: string) =>
                    setCompanyValues({ ...companyValues, type: value })
                  }
                  type="form"
                  label="Type"
                  width="full"
                />
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
                <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-400 dark:border-gray-200">
                  <Button
                    text="Cancel"
                    style="secondary"
                    onClick={handleClose}
                  />
                  <Button text="Create Company" style="primary" type="submit" />
                </div>
              </form>
            )}
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
                  label="Category"
                  placeholder="Contract category"
                  value={contractsValues.category}
                  onChange={(val: string) =>
                    setContractsValues({ ...contractsValues, category: val })
                  }
                />
                <DropdownLarge
                  label="Contract Stage"
                  items={CONTRACT_STATUS}
                  selectedItem={contractsValues.status}
                  onSelect={(val: string) =>
                    setContractsValues({ ...contractsValues, status: val })
                  }
                  type="form"
                  width="full"
                />
                <TextField
                  label="Amount (₹)"
                  placeholder="Budget involved"
                  value={contractsValues.amountPaid}
                  onChange={(val: string) =>
                    setContractsValues({ ...contractsValues, amountPaid: val })
                  }
                />
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
                    label="End Date"
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
                <TextField
                  label="Contract With"
                  placeholder="Company, Business owner"
                  value={contractsValues.dealPartner}
                  onChange={(val: string) =>
                    setContractsValues({ ...contractsValues, dealPartner: val })
                  }
                />
                <DropdownLarge
                  label="Priority"
                  items={["Low", "Medium", "High"]}
                  selectedItem={contractsValues.priority}
                  onSelect={(val: string) =>
                    setContractsValues({ ...contractsValues, priority: val })
                  }
                  type="form"
                  width="full"
                />
                <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-400 dark:border-gray-200">
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
            {view === "receipts" && (
              <form
                className="flex flex-col gap-6 w-full" // Increased gap between sections
                onSubmit={handleSubmitReceipts}
              >
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Invoice Details
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        label="Invoice Title*"
                        placeholder="e.g. Web Development Services"
                        value={receiptsValues.title}
                        onChange={(val: string) =>
                          setReceiptsValues({ ...receiptsValues, title: val })
                        }
                        type={receiptErrors.title ? "error" : ""}
                        errorMessage={receiptErrors.title}
                      />
                      <TextField
                        label="Invoice Number*"
                        placeholder="e.g. INV-2024-001"
                        value={receiptsValues.receiptNumber}
                        onChange={(val: string) =>
                          setReceiptsValues({
                            ...receiptsValues,
                            receiptNumber: val,
                          })
                        }
                        type={receiptErrors.receiptNumber ? "error" : ""}
                        errorMessage={receiptErrors.receiptNumber}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        label="Bill To (Customer Name)*"
                        placeholder="e.g. Acme Corp"
                        value={receiptsValues.billTo}
                        onChange={(val: string) =>
                          setReceiptsValues({ ...receiptsValues, billTo: val })
                        }
                        type={receiptErrors.billTo ? "error" : ""}
                        errorMessage={receiptErrors.billTo}
                      />
                      <TextField
                        label="Due Date*"
                        placeholder="YYYY-MM-DD"
                        value={receiptsValues.dueDate}
                        onChange={(val: string) =>
                          setReceiptsValues({ ...receiptsValues, dueDate: val })
                        }
                        calendar
                        type={receiptErrors.dueDate ? "error" : ""}
                        errorMessage={receiptErrors.dueDate}
                      />
                    </div>
                    <TextField
                      label="Payment Terms"
                      placeholder="e.g. Net 30, Due on Receipt"
                      value={receiptsValues.paymentTerms}
                      onChange={(val: string) =>
                        setReceiptsValues({
                          ...receiptsValues,
                          paymentTerms: val,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Billing Address
                  </h3>
                  <div className="space-y-4">
                    <TextField
                      label="Address Line 1"
                      placeholder="Customer's street address"
                      value={receiptsValues.billToAddressLine1}
                      onChange={(val: string) =>
                        setReceiptsValues({
                          ...receiptsValues,
                          billToAddressLine1: val,
                        })
                      }
                    />
                    <TextField
                      label="Address Line 2 (Optional)"
                      placeholder="Apartment, suite, etc."
                      value={receiptsValues.billToAddressLine2}
                      onChange={(val: string) =>
                        setReceiptsValues({
                          ...receiptsValues,
                          billToAddressLine2: val,
                        })
                      }
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        label="City"
                        placeholder="Customer's city"
                        value={receiptsValues.billToCity}
                        onChange={(val: string) =>
                          setReceiptsValues({
                            ...receiptsValues,
                            billToCity: val,
                          })
                        }
                      />
                      <TextField
                        label="State / Province"
                        placeholder="Customer's state"
                        value={receiptsValues.billToState}
                        onChange={(val: string) =>
                          setReceiptsValues({
                            ...receiptsValues,
                            billToState: val,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        label="Postal Code"
                        placeholder="Customer's postal code"
                        value={receiptsValues.billToPostalCode}
                        onChange={(val: string) =>
                          setReceiptsValues({
                            ...receiptsValues,
                            billToPostalCode: val,
                          })
                        }
                      />
                      <TextField
                        label="Country"
                        placeholder="Customer's country"
                        value={receiptsValues.billToCountry}
                        onChange={(val: string) =>
                          setReceiptsValues({
                            ...receiptsValues,
                            billToCountry: val,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>



                <div className="flex justify-end gap-3 mt-auto pt-6 border-t border-gray-400 dark:border-gray-200">
                  <Button
                    text="Cancel"
                    style="secondary"
                    onClick={handleClose}
                  />
                  <Button text="Create Invoice" style="primary" type="submit" />
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
                    placeholder="e.g. Poultry"
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
                      <p className="text-xs p-2 text-gray-300">
                        Suggestions...
                      </p>
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
                <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-400 dark:border-gray-200">
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
