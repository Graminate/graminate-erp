import Button from "@/components/ui/Button";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import TextField from "@/components/ui/TextField";
import PlatformLayout from "@/layout/PlatformLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { triggerToast } from "@/stores/toast";
import { CONTACT_TYPES } from "@/constants/options";
import Loader from "@/components/ui/Loader";
import Head from "next/head";
import axiosInstance from "@/lib/utils/axiosInstance";

type Contact = {
  contact_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  type?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

const ContactDetails = () => {
  const router = useRouter();
  const { user_id, data } = router.query;
  const [contact, setContact] = useState<Contact | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [initialFullName, setInitialFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [type, setType] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Initial data for change detection
  const [initialFormData, setInitialFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    type: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    if (data) {
      try {
        const parsedContact: Contact = JSON.parse(data as string);
        setContact(parsedContact);

        const initialData = {
          firstName: parsedContact.first_name || "",
          lastName: parsedContact.last_name || "",
          email: parsedContact.email || "",
          phoneNumber: parsedContact.phone_number || "",
          type: parsedContact.type || "",
          addressLine1: parsedContact.address_line_1 || "",
          addressLine2: parsedContact.address_line_2 || "",
          city: parsedContact.city || "",
          state: parsedContact.state || "",
          postalCode: parsedContact.postal_code || "",
        };

        setInitialFullName(`${initialData.firstName} ${initialData.lastName}`);
        setFirstName(initialData.firstName);
        setLastName(initialData.lastName);
        setEmail(initialData.email);
        setPhoneNumber(initialData.phoneNumber);
        setType(initialData.type);
        setAddressLine1(initialData.addressLine1);
        setAddressLine2(initialData.addressLine2);
        setCity(initialData.city);
        setState(initialData.state);
        setPostalCode(initialData.postalCode);
        setInitialFormData(initialData);
      } catch (error) {
        console.error("Error parsing contact data:", error);
        triggerToast("Invalid contact data format", "error");
      }
    }
  }, [data]);

  const hasChanges = Object.keys(initialFormData).some((key) => {
    const formKey = key as keyof typeof initialFormData;
    return (
      initialFormData[formKey] !==
      (formKey === "firstName"
        ? firstName
        : formKey === "lastName"
        ? lastName
        : formKey === "email"
        ? email
        : formKey === "phoneNumber"
        ? phoneNumber
        : formKey === "type"
        ? type
        : formKey === "addressLine1"
        ? addressLine1
        : formKey === "addressLine2"
        ? addressLine2
        : formKey === "city"
        ? city
        : formKey === "state"
        ? state
        : formKey === "postalCode"
        ? postalCode
        : undefined)
    );
  });

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      id: contact?.contact_id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      type,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city,
      state,
      postal_code: postalCode,
    };

    try {
      const response = await axiosInstance.put("/contacts/update", payload);
      triggerToast("Contact updated successfully", "success");

      const updated: Contact = response.data.contact;
      setContact(updated);

      // Update initial form data with new values
      setInitialFormData({
        firstName: updated.first_name,
        lastName: updated.last_name,
        email: updated.email || "",
        phoneNumber: updated.phone_number || "",
        type: updated.type || "",
        addressLine1: updated.address_line_1 || "",
        addressLine2: updated.address_line_2 || "",
        city: updated.city || "",
        state: updated.state || "",
        postalCode: updated.postal_code || "",
      });
    } catch (error: unknown) {
      console.error("Error updating contact:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!contact) return <Loader />;

  return (
    <PlatformLayout>
      <Head>
        <title>Contact | {initialFullName}</title>
      </Head>
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
              onChange={setFirstName}
              width="large"
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={setLastName}
              width="large"
            />
            <TextField
              label="Email"
              value={email}
              onChange={setEmail}
              width="large"
            />
            <TextField
              label="Phone Number"
              value={phoneNumber}
              onChange={setPhoneNumber}
              width="large"
            />
            <DropdownLarge
              items={CONTACT_TYPES}
              selectedItem={type}
              onSelect={setType}
              type="form"
              label="Type"
              width="full"
            />
            <TextField
              label="Address Line 1"
              value={addressLine1}
              onChange={setAddressLine1}
              width="large"
            />
            <TextField
              label="Address Line 2"
              value={addressLine2}
              onChange={setAddressLine2}
              width="large"
            />
            <TextField
              label="City"
              value={city}
              onChange={setCity}
              width="large"
            />
            <TextField
              label="State"
              value={state}
              onChange={setState}
              width="large"
            />
            <TextField
              label="Postal Code"
              value={postalCode}
              onChange={setPostalCode}
              width="large"
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
