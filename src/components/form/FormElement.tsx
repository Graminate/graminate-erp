import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TextField from "../ui/TextField";
import DropdownLarge from "../ui/Dropdown/DropdownLarge";
import Button from "../ui/Button";
import TextArea from "../ui/TextArea";

const genderOptions = ["Male", "Female", "Other"];

type Props = {
  view: string;
  onClose: () => void;
  onSubmit?: (values: Record<string, string>) => void;
  formTitle?: string;
};

const FormElement = ({
  view,
  onClose,
  onSubmit = () => {
    console.warn("onSubmit is not provided");
  },
  formTitle,
}: Props) => {
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

  const [ticketValues, setTicketValues] = useState({
    ticketName: "",
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

  const contactTypes = [
    "Supplier",
    "Distributor",
    "Factory",
    "Buyer",
    "Client",
  ];
  const companyType = ["Supplier", "Distributor", "Factories", "Buyer"];
  const ticketStatus = ["Active", "Completed", "On Hold"];

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

  const handleSubmitTickets = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(ticketValues);
  };

  const handleSubmitLabour = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({
      user_id: user_id,
      full_name: labourValues.fullName,
      guardian_name: labourValues.guardianName, // Added guardian_name field
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
      className="fixed top-0 right-0 h-full w-full md:w-1/3 bg-light dark:bg-dark shadow-lg z-50"
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
              items={contactTypes}
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

        {/* Form for Tickets */}
        {view === "tickets" && (
          <form
            className="flex flex-col gap-4 w-full flex-grow"
            onSubmit={handleSubmitTickets}
          >
            <TextField
              label="Farming Project"
              placeholder="Green Tea Production"
              value={ticketValues.ticketName}
              onChange={(val: string) =>
                setTicketValues({ ...ticketValues, ticketName: val })
              }
            />
            <TextField
              label="Work Category"
              placeholder="e.g. Your work"
              value={ticketValues.category}
              onChange={(val: string) =>
                setTicketValues({ ...ticketValues, category: val })
              }
            />
            <DropdownLarge
              items={ticketStatus}
              selectedItem={ticketValues.status}
              onSelect={(value: string) =>
                setTicketValues({ ...ticketValues, status: value })
              }
              type="form"
              label="Ticket Status"
              width="full"
            />
            <TextField
              label="Industry"
              placeholder="Enter industry"
              value={ticketValues.industry}
              onChange={(val: string) =>
                setTicketValues({ ...ticketValues, industry: val })
              }
            />
            <DropdownLarge
              items={contactTypes}
              selectedItem={ticketValues.type}
              onSelect={(value: string) =>
                setTicketValues({ ...ticketValues, type: value })
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
              items={genderOptions}
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

export default FormElement;
