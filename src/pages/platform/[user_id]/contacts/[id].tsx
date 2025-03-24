import Button from "@/components/ui/Button";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import TextArea from "@/components/ui/TextArea";
import TextField from "@/components/ui/TextField";
import PlatformLayout from "@/layout/PlatformLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { CONTACT_TYPES } from "@/constants/options";

const ContactDetails = () => {
  const router = useRouter();
  const { user_id, data } = router.query;
  const [contact, setContact] = useState<any | null>(null);

  // Editable fields state
  const [initialFullName, setInitialFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");

  // Keep initial values for change detection
  const [initialFormData, setInitialFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    type: "",
    address: "",
  });

  // Saving state for update request
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      try {
        const parsedContact = JSON.parse(data as string);
        setContact(parsedContact);
        const initFirstName = parsedContact[1] || "";
        const initLastName = parsedContact[2] || "";
        const initEmail = parsedContact[3] || "";
        const initPhoneNumber = parsedContact[4] || "";
        const initType = parsedContact[5] || "";
        const initAddress = parsedContact[6] || "";
        setInitialFullName(`${initFirstName} ${initLastName}`);
        setFirstName(initFirstName);
        setLastName(initLastName);
        setEmail(initEmail);
        setPhoneNumber(initPhoneNumber);
        setType(initType);
        setAddress(initAddress);
        setInitialFormData({
          firstName: initFirstName,
          lastName: initLastName,
          email: initEmail,
          phoneNumber: initPhoneNumber,
          type: initType,
          address: initAddress,
        });
      } catch (error) {
        console.error("Error parsing contact data:", error);
      }
    }
  }, [data]);

  if (!contact) return <p>Loading...</p>;

  const hasChanges =
    firstName !== initialFormData.firstName ||
    lastName !== initialFormData.lastName ||
    email !== initialFormData.email ||
    phoneNumber !== initialFormData.phoneNumber ||
    type !== initialFormData.type ||
    address !== initialFormData.address;

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      id: contact[0],
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phoneNumber,
      type: type,
      address: address,
    };

    console.log("Sending update request with payload:", payload);

    try {
      const response = await fetch(
        "http://localhost:3001/api/contacts/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log("Response from API:", result);

      if (response.ok) {
        Swal.fire("Success", "Contact updated successfully", "success");
        setContact(result.contact);
        setInitialFormData({
          firstName,
          lastName,
          email,
          phoneNumber,
          type,
          address,
        });
      } else {
        Swal.fire("Error", result.error || "Failed to update contact", "error");
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      Swal.fire(
        "Error",
        "An error occurred while updating the contact.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PlatformLayout>
      <div className="px-6">
        <Button
          text="Back"
          style="ghost"
          arrow="left"
          onClick={() => router.push(`/platform/${user_id}/crm?view=contacts`)}
        />
        <div className="pt-4">
          <h1 className="text-2xl font-bold mb-4">{initialFullName}</h1>
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <TextField
              label="First Name"
              value={firstName}
              onChange={(val) => setFirstName(val)}
              width="large"
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(val) => setLastName(val)}
              width="large"
            />
            <TextField
              label="Email"
              value={email}
              onChange={(val) => setEmail(val)}
              width="large"
            />
            <TextField
              label="Phone Number"
              value={phoneNumber}
              onChange={(val) => setPhoneNumber(val)}
              width="large"
            />
            <DropdownLarge
              items={CONTACT_TYPES}
              selectedItem={type}
              onSelect={(value: string) => setType(value)}
              type="form"
              label="Type"
              width="full"
            />
            <TextArea
              label="Address"
              placeholder="Address (optional)"
              value={address}
              onChange={(val: string) => setAddress(val)}
            />
          </div>
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
                router.push(`/platform/${user_id}/crm?view=contacts`)
              }
            />
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default ContactDetails;
