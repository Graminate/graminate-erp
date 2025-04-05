import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import TextField from "@/components/ui/TextField";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import { GENDER } from "@/constants/options";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { SidebarProp } from "@/types/card-props";

const LabourForm = ({ onClose, formTitle }: SidebarProp) => {
  const router = useRouter();
  const { user_id } = router.query;
  const [labourValues, setLabourValues] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    role: "",
    contactNumber: "",
    aadharCardNumber: "",
    address: "",
  });
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setAnimate(true);
  }, []);
  const handleClose = () => {
    onClose();
  };
  const handleSubmitLabour = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      user_id: user_id,
      full_name: labourValues.fullName,
      date_of_birth: labourValues.dateOfBirth,
      gender: labourValues.gender,
      role: labourValues.role,
      contact_number: labourValues.contactNumber,
      aadhar_card_number: labourValues.aadharCardNumber,
      address: labourValues.address,
    };
    try {
      await axios.post("http://localhost:3001/api/labour/add", payload);
      setLabourValues({
        fullName: "",
        dateOfBirth: "",
        gender: "",
        role: "",
        contactNumber: "",
        aadharCardNumber: "",
        address: "",
      });
      handleClose();
      window.location.reload();
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred";
      console.error("Error adding labour:", message);
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
              {formTitle ? formTitle : "Create Labour"}
            </h2>
            <button
              className="text-gray-300 hover:text-gray-100"
              onClick={handleClose}
            >
              <FontAwesomeIcon icon={faX} className="w-5 h-5" />
            </button>
          </div>
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
              label="Designation"
              placeholder="Role of the Employee"
              value={labourValues.role}
              onChange={(val: string) =>
                setLabourValues({ ...labourValues, role: val })
              }
            />
            <TextField
              label="Contact Number"
              placeholder="e.g. 91 XXXXX XXX XX"
              value={labourValues.contactNumber}
              onChange={(val: string) =>
                setLabourValues({ ...labourValues, contactNumber: val })
              }
            />
            <TextField
              label="Aadhar Card Number"
              placeholder="e.g. XXX XXX XXX XXX"
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
        </div>
      </div>
    </div>
  );
};

export default LabourForm;
