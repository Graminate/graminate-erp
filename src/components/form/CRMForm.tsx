import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import TextField from "@/components/ui/TextField";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import { CONTACT_TYPES, PAYMENT_STATUS } from "@/constants/options";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { SidebarProp } from "@/types/card-props";

const CRMForm = ({ view, onClose, formTitle }: SidebarProp) => {
  const isValidE164 = (phone: string) => {
    return /^\+?[1-9][0-9]{1,14}$/.test(phone);
  };
  const router = useRouter();
  const { user_id } = router.query;
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
  });

  const [companyErrors, setCompanyErrors] = useState({
    phoneNumber: "",
  });

  const [companyValues, setCompanyValues] = useState({
    companyName: "",
    companyOwner: "",
    email: "",
    phoneNumber: "",
    type: "",
    address: "",
    address_line_1: "",
    address_line_2: "",
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
  const companyType = ["Supplier", "Distributor", "Factories", "Buyer"];
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setAnimate(true);
  }, []);
  const handleClose = () => {
    onClose();
  };
  const handleSubmitContacts = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await axios.post("http://localhost:3001/api/contacts/add", payload);
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
      handleClose();
      window.location.reload();
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred";
      console.error("Error adding contact:", message);
      alert(message);
    }
  };
  const handleSubmitCompanies = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await axios.post("http://localhost:3001/api/companies/add", payload);
      setCompanyValues({
        companyName: "",
        companyOwner: "",
        email: "",
        phoneNumber: "",
        type: "",
        address: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
      });
      handleClose();
      window.location.reload();
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred";
      console.error("Error adding company:", message);
      alert(message);
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
      const response = await axios.post(
        "http://localhost:3001/api/contracts/add",
        payload
      );
      console.log("API Response:", response.data);
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
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred";
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
      const response = await axios.post(
        "http://localhost:3001/api/receipts/add",
        payload
      );
      console.log("API Response:", response.data);
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
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred";
      console.error("Error adding new receipt:", message);
      alert(message);
    }
  };
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setAnimate(false);
        setTimeout(() => handleClose(), 300);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);
  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full md:w-1/3 bg-light dark:bg-gray-800 shadow-lg dark:border-l border-gray-200"
        style={{
          transform: animate ? "translateX(0)" : "translateX(500px)",
          transition: "transform 300ms",
        }}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-dark dark:text-light">
              {formTitle
                ? formTitle
                : "Create " + view.charAt(0).toUpperCase() + view.slice(1)}
            </h2>
            <button
              className="text-gray-300 hover:text-gray-100"
              onClick={handleClose}
            >
              <FontAwesomeIcon icon={faX} className="w-5 h-5" />
            </button>
          </div>
          {view === "contacts" && (
            <form
              className="flex flex-col gap-4 w-full flex-grow"
              onSubmit={handleSubmitContacts}
            >
              <div className="flex flex-row gap-2">
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
                placeholder="e.g. +91 XXXXXXXX"
                value={contactValues.phoneNumber}
                onChange={(val: string) => {
                  setContactValues({ ...contactValues, phoneNumber: val });

                  if (!isValidE164(val)) {
                    setContactErrors({
                      ...contactErrors,
                      phoneNumber: "Phone number must be in E.164 format",
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
                value={contactValues.address_line_1 || ""}
                onChange={(val: string) =>
                  setContactValues({ ...contactValues, address_line_1: val })
                }
              />

              {/* Address Line 2 */}
              <TextField
                label="Address Line 2"
                placeholder="e.g. Green View Apartments, 5th Cross"
                value={contactValues.address_line_2 || ""}
                onChange={(val: string) =>
                  setContactValues({ ...contactValues, address_line_2: val })
                }
              />

              <div className="flex flex-row gap-2">
                {/* City */}
                <TextField
                  label="City"
                  placeholder="e.g. Bengaluru"
                  value={contactValues.city || ""}
                  onChange={(val: string) =>
                    setContactValues({ ...contactValues, city: val })
                  }
                />
              </div>

              <div className="flex flex-row gap-2">
                {/* State */}
                <TextField
                  label="State"
                  placeholder="e.g. Karnataka"
                  value={contactValues.state || ""}
                  onChange={(val: string) =>
                    setContactValues({ ...contactValues, state: val })
                  }
                />

                {/* Postal Code */}
                <TextField
                  label="Postal Code"
                  placeholder="e.g. 560076"
                  value={contactValues.postal_code || ""}
                  onChange={(val: string) =>
                    setContactValues({ ...contactValues, postal_code: val })
                  }
                />
              </div>
              <div className="flex justify-end gap-4 mt-2">
                <Button text="Create" style="primary" type="submit" />
                <Button text="Cancel" style="secondary" onClick={handleClose} />
              </div>
            </form>
          )}
          {view === "companies" && (
            <form
              className="flex flex-col gap-4 w-full flex-grow"
              onSubmit={handleSubmitCompanies}
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
              <div className="flex flex-auto gap-2">
                <TextField
                  label="Email"
                  placeholder="e.g. john.doe@gmail.com"
                  value={companyValues.email}
                  onChange={(val: string) =>
                    setCompanyValues({ ...companyValues, email: val })
                  }
                />
                <TextField
                  label="Phone Number"
                  placeholder="e.g. +49 XXXXXXXX"
                  value={companyValues.phoneNumber}
                  onChange={(val: string) => {
                    setCompanyValues({ ...companyValues, phoneNumber: val });

                    if (!isValidE164(val)) {
                      setCompanyErrors({
                        ...companyErrors,
                        phoneNumber: "Add a valid phone number",
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
                label="Type"
                width="full"
              />
              <TextField
                label="Address Line 1"
                placeholder="e.g. Head Office, Tower B"
                value={companyValues.address_line_1 || ""}
                onChange={(val: string) =>
                  setCompanyValues({ ...companyValues, address_line_1: val })
                }
              />
              <TextField
                label="Address Line 2"
                placeholder="e.g. Street Name, Area"
                value={companyValues.address_line_2 || ""}
                onChange={(val: string) =>
                  setCompanyValues({ ...companyValues, address_line_2: val })
                }
              />
              <div className="flex flex-row gap-2">
                <TextField
                  label="City"
                  placeholder="e.g. Mumbai"
                  value={companyValues.city || ""}
                  onChange={(val: string) =>
                    setCompanyValues({ ...companyValues, city: val })
                  }
                />
                <TextField
                  label="State"
                  placeholder="e.g. Maharashtra"
                  value={companyValues.state || ""}
                  onChange={(val: string) =>
                    setCompanyValues({ ...companyValues, state: val })
                  }
                />
              </div>
              <TextField
                label="Postal Code"
                placeholder="e.g. 400001"
                value={companyValues.postal_code || ""}
                onChange={(val: string) =>
                  setCompanyValues({ ...companyValues, postal_code: val })
                }
              />

              <div className="flex justify-end gap-4 mt-2">
                <Button text="Create" style="primary" type="submit" />
                <Button text="Cancel" style="secondary" onClick={handleClose} />
              </div>
            </form>
          )}
          {view === "contracts" && (
            <form
              className="flex flex-col gap-4 w-full flex-grow"
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
              <div className="flex flex-col gap-2">
                <TextField
                  label="Amount Involved (₹)"
                  placeholder="Budget involved"
                  value={contractsValues.amountPaid}
                  onChange={(val: string) =>
                    setContractsValues({ ...contractsValues, amountPaid: val })
                  }
                />
                <TextField
                  label="State of Contract"
                  placeholder="e.g. Initialised, In Process, Completed"
                  value={contractsValues.status}
                  onChange={(val: string) =>
                    setContractsValues({ ...contractsValues, status: val })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
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
                  width="large"
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
                  width="large"
                  calendar
                />
              </div>
              <div className="flex justify-end gap-4 mt-2">
                <Button text="Create" style="primary" type="submit" />
                <Button text="Cancel" style="secondary" onClick={handleClose} />
              </div>
            </form>
          )}
          {view === "receipts" && (
            <form
              className="flex flex-col gap-4 w-full flex-grow"
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
              <div className="flex flex-col gap-2">
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
              <div className="flex flex-col gap-2">
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
              <div className="flex justify-end gap-4 mt-2">
                <Button text="Create" style="primary" type="submit" />
                <Button text="Cancel" style="secondary" onClick={handleClose} />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMForm;
