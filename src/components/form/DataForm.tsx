import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TextField from "@/components/ui/TextField";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import type { DataForm } from "@/types/card-props";

import { CONTACT_TYPES, PAYMENT_STATUS, GENDER } from "@/constants/options";

const DataForm = ({
  view,
  onClose,
  onSubmit = () => {
    console.warn("onSubmit is not provided");
  },
  formTitle,
}: DataForm) => {
  const router = useRouter();
  const { user_id } = router.query;

  // Form state for each view
  const [contactValues, setContactValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    type: "",
    address: "",
  });

  const [companyValues, setCompanyValues] = useState({
    companyName: "",
    companyOwner: "",
    email: "",
    phoneNumber: "",
    type: "",
    address: "",
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
    taskName: "",
    category: "",
    status: "",
    industry: "",
    type: "",
  });

  const [labourValues, setLabourValues] = useState({
    fullName: "",
    guardianName: "",
    dateOfBirth: "",
    gender: "",
    role: "",
    contactNumber: "",
    aadharCardNumber: "",
    address: "",
  });

  const companyType = ["Supplier", "Distributor", "Factories", "Buyer"];
  const taskStatus = ["Active", "Completed", "On Hold"];

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleSubmitContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({
      user_id: user_id,
      first_name: contactValues.firstName,
      last_name: contactValues.lastName,
      email: contactValues.email,
      phone_number: contactValues.phoneNumber,
      type: contactValues.type,
      address: contactValues.address,
    });
    try {
      const response = await fetch("/api/contacts/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      const result = await response.json();
      if (response.ok) {
        setContactValues({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          type: "",
          address: "",
        });
        handleClose();
        window.location.reload();
      } else {
        alert(result.error || "Failed to add contact");
      }
    } catch (error) {
      console.error("Error adding contact:", error);
      alert("An unexpected error occurred");
    }
  };

  const handleSubmitCompanies = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({
      user_id: user_id,
      company_name: companyValues.companyName,
      owner_name: companyValues.companyOwner,
      email: companyValues.email,
      phone_number: companyValues.phoneNumber,
      type: companyValues.type,
      address: companyValues.address,
    });
    try {
      const response = await fetch("/api/companies/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      const result = await response.json();
      if (response.ok) {
        setCompanyValues({
          companyName: "",
          companyOwner: "",
          email: "",
          phoneNumber: "",
          type: "",
          address: "",
        });
        handleClose();
        window.location.reload();
      } else {
        alert(result.error || "Failed to add company");
      }
    } catch (error) {
      console.error("Error adding company:", error);
      alert("An unexpected error occurred");
    }
  };

  const handleSubmitContracts = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({
      user_id: user_id,
      contract_name: contractsValues.dealName,
      partner: contractsValues.dealPartner,
      amount: contractsValues.amountPaid,
      stage: contractsValues.status,
      start_date: contractsValues.contractStartDate,
      end_date: contractsValues.contractEndDate,
    });
    try {
      const response = await fetch("/api/contracts/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          deal_name: contractsValues.dealName,
          partner: contractsValues.dealPartner,
          amount: contractsValues.amountPaid,
          stage: contractsValues.status,
          start_date: contractsValues.contractStartDate,
          end_date: contractsValues.contractEndDate,
        }),
      });

      const result = await response.json();
      console.log("API Response:", result); // Debugging
      if (response.ok) {
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
      } else {
        alert(result.error || "Failed to add new Contract");
      }
    } catch (error) {
      console.error("Error adding new contract:", error);
      alert("An unexpected error occurred");
    }
  };

  const handleSubmitReceipts = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({
      user_id,
      title: receiptsValues.title,
      bill_to: receiptsValues.billTo,
      amount_paid: receiptsValues.amount_paid,
      amount_due: receiptsValues.amount_due,
      due_date: receiptsValues.due_date,
      status: receiptsValues.status,
    });
    try {
      const response = await fetch("/api/receipts/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          title: receiptsValues.title,
          bill_to: receiptsValues.billTo,
          amount_paid: receiptsValues.amount_paid,
          amount_due: receiptsValues.amount_due,
          due_date: receiptsValues.due_date,
          status: receiptsValues.status,
        }),
      });

      const result = await response.json();
      console.log("API Response:", result);
      if (response.ok) {
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
      } else {
        alert(result.error || "Failed to add new Receipt");
      }
    } catch (error) {
      console.error("Error adding new receipt:", error);
      alert("An unexpected error occurred");
    }
  };

  const handleSubmitTasks = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(taskValues);
  };

  const handleSubmitLabour = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({
      user_id: user_id,
      full_name: labourValues.fullName,
      guardian_name: labourValues.guardianName,
      date_of_birth: labourValues.dateOfBirth,
      gender: labourValues.gender,
      role: labourValues.role,
      contact_number: labourValues.contactNumber,
      aadhar_card_number: labourValues.aadharCardNumber,
      address: labourValues.address,
    });

    try {
      const response = await fetch("/api/labour/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      const result = await response.json();
      if (response.ok) {
        setLabourValues({
          fullName: "",
          guardianName: "",
          dateOfBirth: "",
          gender: "",
          role: "",
          contactNumber: "",
          aadharCardNumber: "",
          address: "",
        });
        handleClose();
        window.location.reload();
      } else {
        alert(result.error || "Failed to add labour");
      }
    } catch (error) {
      console.error("Error adding labour:", error);
      alert("An unexpected error occurred");
    }
  };

  return (
    <div
      className="fixed top-0 right-0 h-full w-full md:w-1/3 bg-light dark:bg-gray-800 shadow-lg dark:border-l border-gray-200 z-50"
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
            className="text-gray-400 hover:text-gray-600"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {/* Form for Contacts */}
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
                  setContactValues({
                    ...contactValues,
                    firstName: val,
                  })
                }
              />
              <TextField
                label="Last Name"
                placeholder="e.g. Doe"
                value={contactValues.lastName}
                onChange={(val: string) =>
                  setContactValues({
                    ...contactValues,
                    lastName: val,
                  })
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
              placeholder="e.g. +91 XXXXX XXX XX"
              value={contactValues.phoneNumber}
              onChange={(val: string) =>
                setContactValues({
                  ...contactValues,
                  phoneNumber: val,
                })
              }
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
            <TextArea
              label="Client Address (Optional)"
              placeholder="Address (optional)"
              value={contactValues.address}
              onChange={(val: string) =>
                setContactValues({ ...contactValues, address: val })
              }
            />
            <div className="flex justify-end gap-4 mt-2">
              <Button text="Create" style="primary" type="submit" />
              <Button text="Cancel" style="secondary" onClick={handleClose} />
            </div>
          </form>
        )}

        {/* Form for Companies */}
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
                setCompanyValues({
                  ...companyValues,
                  companyName: val,
                })
              }
            />
            <TextField
              label="Owner Name"
              placeholder="e.g. John Doe"
              value={companyValues.companyOwner}
              onChange={(val: string) =>
                setCompanyValues({
                  ...companyValues,
                  companyOwner: val,
                })
              }
            />
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
              placeholder="e.g. +91 XXXXX XXX XX"
              value={companyValues.phoneNumber}
              onChange={(val: string) =>
                setCompanyValues({
                  ...companyValues,
                  phoneNumber: val,
                })
              }
            />
            <TextArea
              label="Client Address (Optional)"
              placeholder="Address (optional)"
              value={companyValues.address}
              onChange={(val: string) =>
                setCompanyValues({ ...companyValues, address: val })
              }
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
            <div className="flex justify-end gap-4 mt-2">
              <Button text="Create" style="primary" type="submit" />
              <Button text="Cancel" style="secondary" onClick={handleClose} />
            </div>
          </form>
        )}

        {/* Form for Contract */}
        {view === "contracts" && (
          <form
            className="flex flex-col gap-4 w-full flex-grow"
            onSubmit={handleSubmitContracts}
          >
            <TextField
              label="Deal Name"
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

        {/* Form for Receipts */}
        {view === "receipts" && (
          <form
            className="flex flex-col gap-4 w-full flex-grow"
            onSubmit={handleSubmitReceipts}
          >
            {/* Title */}
            <TextField
              label="Receipt Title"
              placeholder="Name of your receipt / invoice"
              value={receiptsValues.title}
              onChange={(val: string) =>
                setReceiptsValues({ ...receiptsValues, title: val })
              }
            />
            {/* Bill To */}
            <TextField
              label="Bill To"
              placeholder="Customer Details"
              value={receiptsValues.billTo}
              onChange={(val: string) =>
                setReceiptsValues({ ...receiptsValues, billTo: val })
              }
            />

            {/* Amount Paid */}
            <div className="flex flex-col gap-2">
              <TextField
                label="Paid (₹)"
                placeholder="Amount Paid"
                value={receiptsValues.amount_paid}
                onChange={(val: string) =>
                  setReceiptsValues({ ...receiptsValues, amount_paid: val })
                }
              />
              {/* Amount Due */}
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
              {/* Due Date */}
              <TextField
                label="Due Date"
                placeholder="YYYY-MM-DD"
                value={receiptsValues.due_date}
                onChange={(val: string) =>
                  setReceiptsValues({
                    ...receiptsValues,
                    due_date: val,
                  })
                }
                calendar
              />

              {/*  Receipt Status*/}
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

        {/* Form for Tasks */}
        {view === "tasks" && (
          <form
            className="flex flex-col gap-4 w-full flex-grow"
            onSubmit={handleSubmitTasks}
          >
            <TextField
              label="Farming Project"
              placeholder="Green Tea Production"
              value={taskValues.taskName}
              onChange={(val: string) =>
                setTaskValues({ ...taskValues, taskName: val })
              }
            />
            <TextField
              label="Work Category"
              placeholder="e.g. Your work"
              value={taskValues.category}
              onChange={(val: string) =>
                setTaskValues({ ...taskValues, category: val })
              }
            />
            <DropdownLarge
              items={taskStatus}
              selectedItem={taskValues.status}
              onSelect={(value: string) =>
                setTaskValues({ ...taskValues, status: value })
              }
              type="form"
              label="Task Status"
              width="full"
            />
            <TextField
              label="Industry"
              placeholder="Enter industry"
              value={taskValues.industry}
              onChange={(val: string) =>
                setTaskValues({ ...taskValues, industry: val })
              }
            />
            <DropdownLarge
              items={CONTACT_TYPES}
              selectedItem={taskValues.type}
              onSelect={(value: string) =>
                setTaskValues({ ...taskValues, type: value })
              }
              type="form"
              label="Type"
              width="full"
            />
            <div className="flex justify-end gap-4 mt-2">
              <Button text="Create" style="primary" type="submit" />
              <Button text="Cancel" style="secondary" onClick={handleClose} />
            </div>
          </form>
        )}

        {/* Form for Labours */}
        {view === "labours" && (
          <form
            className="flex flex-col gap-4 w-full flex-grow"
            onSubmit={handleSubmitLabour}
          >
            <TextField
              label="Full Name"
              placeholder="e.g. John Doe"
              value={labourValues.fullName}
              onChange={(val: string) =>
                setLabourValues({ ...labourValues, fullName: val })
              }
            />
            <TextField
              label="Guardian Name"
              placeholder="e.g. Parent/Guardian Name"
              value={labourValues.guardianName}
              onChange={(val: string) =>
                setLabourValues({ ...labourValues, guardianName: val })
              }
            />
            <TextField
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
              value={labourValues.dateOfBirth}
              onChange={(val: string) =>
                setLabourValues({ ...labourValues, dateOfBirth: val })
              }
              calendar
            />
            <DropdownLarge
              items={GENDER}
              selectedItem={labourValues.gender}
              onSelect={(value: string) =>
                setLabourValues({ ...labourValues, gender: value })
              }
              type="form"
              label="Gender"
              width="full"
            />
            <TextField
              label="Role"
              placeholder="e.g. Farmer, Labourer"
              value={labourValues.role}
              onChange={(val: string) =>
                setLabourValues({ ...labourValues, role: val })
              }
            />
            <TextField
              label="Contact Number"
              placeholder="e.g. +91 XXXXX XXX XX"
              value={labourValues.contactNumber}
              onChange={(val: string) =>
                setLabourValues({ ...labourValues, contactNumber: val })
              }
            />
            <TextField
              label="Aadhar Card Number"
              placeholder="e.g. 1234 5678 9012"
              value={labourValues.aadharCardNumber}
              onChange={(val: string) =>
                setLabourValues({ ...labourValues, aadharCardNumber: val })
              }
            />
            <TextArea
              label="Address"
              placeholder="Enter full address"
              value={labourValues.address}
              onChange={(val: string) =>
                setLabourValues({ ...labourValues, address: val })
              }
            />
            <div className="flex justify-end gap-4 mt-2">
              <Button text="Create" style="primary" type="submit" />
              <Button text="Cancel" style="secondary" onClick={handleClose} />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DataForm;
