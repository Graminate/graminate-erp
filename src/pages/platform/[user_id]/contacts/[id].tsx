import Button from "@/components/ui/Button";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import TextField from "@/components/ui/TextField";
import PlatformLayout from "@/layout/PlatformLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { showToast, toastMessage } from "@/stores/toast";
import { CONTACT_TYPES } from "@/constants/options";
import Loader from "@/components/ui/Loader";
import axios from "axios";

const ContactDetails = () => {
  const router = useRouter();
  const { user_id, data } = router.query;
  const [contact, setContact] = useState<any | null>(null);

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

  // Keep initial values for change detection
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

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      try {
        const parsedContact = JSON.parse(data as string);
        setContact(parsedContact);

        const initFirstName = parsedContact.first_name || "";
        const initLastName = parsedContact.last_name || "";
        const initEmail = parsedContact.email || "";
        const initPhoneNumber = parsedContact.phone_number || "";
        const initType = parsedContact.type || "";
        const line1 = parsedContact.address_line_1 || "";
        const line2 = parsedContact.address_line_2 || "";
        const cityVal = parsedContact.city || "";
        const stateVal = parsedContact.state || "";
        const postalVal = parsedContact.postal_code || "";

        setInitialFullName(`${initFirstName} ${initLastName}`);
        setFirstName(initFirstName);
        setLastName(initLastName);
        setEmail(initEmail);
        setPhoneNumber(initPhoneNumber);
        setType(initType);
        setAddressLine1(line1);
        setAddressLine2(line2);
        setCity(cityVal);
        setState(stateVal);
        setPostalCode(postalVal);

        setInitialFormData({
          firstName: initFirstName,
          lastName: initLastName,
          email: initEmail,
          phoneNumber: initPhoneNumber,
          type: initType,
          addressLine1: line1,
          addressLine2: line2,
          city: cityVal,
          state: stateVal,
          postalCode: postalVal,
        });
      } catch (error) {
        console.error("Error parsing contact data:", error);
      }
    }
  }, [data]);

  if (!contact) return <Loader />;

  const hasChanges =
    firstName !== initialFormData.firstName ||
    lastName !== initialFormData.lastName ||
    email !== initialFormData.email ||
    phoneNumber !== initialFormData.phoneNumber ||
    type !== initialFormData.type ||
    addressLine1 !== initialFormData.addressLine1 ||
    addressLine2 !== initialFormData.addressLine2 ||
    city !== initialFormData.city ||
    state !== initialFormData.state ||
    postalCode !== initialFormData.postalCode;

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      id: contact.contact_id || contact[0],
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phoneNumber,
      type: type,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city: city,
      state: state,
      postal_code: postalCode,
    };

    try {
      const response = await axios.put(
        "http://localhost:3001/api/contacts/update",
        payload
      );

      console.log("Response from API:", response.data);

      toastMessage.set("Contact updated successfully");
      showToast.set(true);

      const updated = response.data.contact;

      setContact([
        updated.contact_id,
        updated.first_name,
        updated.last_name,
        updated.email,
        updated.phone_number,
        updated.type,
        updated.addressLine1,
        updated.addressLine2,
        updated.city,
        updated.state,
        updated.postalCode,
      ]);

      setInitialFormData({
        firstName: updated.first_name,
        lastName: updated.last_name,
        email: updated.email,
        phoneNumber: updated.phone_number,
        type: updated.type,
        addressLine1: updated.address_line_1 || "",
        addressLine2: updated.address_line_2 || "",
        city: updated.city || "",
        state: updated.state || "",
        postalCode: updated.postal_code || "",
      });
    } catch (error: any) {
      console.error("Error updating contact:", error);
      toastMessage.set(
        error.response?.data?.error ||
          "An error occurred while updating the contact."
      );
      showToast.set(true);
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
            <TextField
              label="Address Line 1"
              value={addressLine1}
              onChange={(val) => setAddressLine1(val)}
              width="large"
            />
            <TextField
              label="Address Line 2"
              value={addressLine2}
              onChange={(val) => setAddressLine2(val)}
              width="large"
            />
            <TextField
              label="City"
              value={city}
              onChange={(val) => setCity(val)}
              width="large"
            />
            <TextField
              label="State"
              value={state}
              onChange={(val) => setState(val)}
              width="large"
            />
            <TextField
              label="Postal Code"
              value={postalCode}
              onChange={(val) => setPostalCode(val)}
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
