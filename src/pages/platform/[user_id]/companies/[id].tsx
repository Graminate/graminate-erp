import Button from "@/components/ui/Button";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import TextField from "@/components/ui/TextField";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { triggerToast } from "@/stores/toast";
import { COMPANY_TYPES } from "@/constants/options";
import axiosInstance from "@/lib/utils/axiosInstance";

type Company = {
  company_id: string;
  name: string;
}

const CompanyDetails = () => {
  const router = useRouter();
  const { user_id, data } = router.query;
  const [company, setCompany] = useState<Company | null>(null);

  const [initialCompanyName, setInitialCompanyName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [type, setType] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [initialFormData, setInitialFormData] = useState({
    companyName: "",
    ownerName: "",
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
        const parsedCompany = JSON.parse(data as string);
        setCompany(parsedCompany);
        const initCompanyName = parsedCompany.company_name || "";
        const initOwnerName = parsedCompany.owner_name || "";
        const initEmail = parsedCompany.email || "";
        const initPhoneNumber = parsedCompany.phone_number || "";
        const initType = parsedCompany.type || "";
        const line1 = parsedCompany.address_line_1 || "";
        const line2 = parsedCompany.address_line_2 || "";
        const cityVal = parsedCompany.city || "";
        const stateVal = parsedCompany.state || "";
        const postalVal = parsedCompany.postal_code || "";

        setInitialCompanyName(initCompanyName);
        setCompanyName(initCompanyName);
        setOwnerName(initOwnerName);
        setEmail(initEmail);
        setPhoneNumber(initPhoneNumber);
        setAddressLine1(line1);
        setAddressLine2(line2);
        setCity(cityVal);
        setState(stateVal);
        setPostalCode(postalVal);
        setType(initType);
        setInitialFormData({
          companyName: initCompanyName,
          ownerName: initOwnerName,
          email: initEmail,
          phoneNumber: initPhoneNumber,
          addressLine1: line1 || "",
          addressLine2: line2 || "",
          city: cityVal || "",
          state: stateVal || "",
          postalCode: postalVal || "",
          type: initType,
        });
      } catch (error) {
        console.error("Error parsing company data:", error);
      }
    }
  }, [data]);

  if (!company) return <p>Loading...</p>;

  const hasChanges =
    companyName !== initialFormData.companyName ||
    ownerName !== initialFormData.ownerName ||
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
      id: company.company_id,
      company_name: companyName,
      owner_name: ownerName,
      email: email,
      phone_number: phoneNumber,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city: city,
      state: state,
      postal_code: postalCode,
      type: type,
    };

    try {
      const response = await axiosInstance.put("/companies/update", payload);
      triggerToast("Company updated successfully", "success");
      const updated = response.data.company;

      setCompany(updated);
      setInitialCompanyName(updated.company_name);
      setCompanyName(updated.company_name);
      setOwnerName(updated.owner_name);
      setEmail(updated.email);
      setPhoneNumber(updated.phone_number);
      setAddressLine1(updated.address_line_1 || "");
      setAddressLine2(updated.address_line_2 || "");
      setCity(updated.city || "");
      setState(updated.state || "");
      setPostalCode(updated.postal_code || "");
      setType(updated.type);

      setInitialFormData({
        companyName: updated.company_name,
        ownerName: updated.owner_name,
        email: updated.email,
        phoneNumber: updated.phone_number,
        addressLine1: updated.address_line_1 || "",
        addressLine2: updated.address_line_2 || "",
        city: updated.city || "",
        state: updated.state || "",
        postalCode: updated.postal_code || "",
        type: updated.type,
      });
    } catch (error: unknown) {
      console.error("Error updating company:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while updating the company.";
      triggerToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Graminate | Company Details</title>
      </Head>
      <PlatformLayout>
        <Head>
          <title>Company | {initialCompanyName}</title>
        </Head>
        <div className="px-6">
          <Button
            text="Back"
            style="ghost"
            arrow="left"
            onClick={() =>
              router.push(`/platform/${user_id}/crm?view=companies`)
            }
          />
          <div className="pt-4">
            <h1 className="text-2xl font-bold mb-6">{initialCompanyName}</h1>

            {/* Company Information Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-400">
                Company Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Company Name"
                  value={companyName}
                  onChange={(val) => setCompanyName(val)}
                  width="large"
                />
                <TextField
                  label="Owner Name"
                  value={ownerName}
                  onChange={(val) => setOwnerName(val)}
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
                  items={COMPANY_TYPES}
                  selectedItem={type}
                  onSelect={(value: string) => setType(value)}
                  type="form"
                  label="Type"
                  width="full"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-400">
                Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
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
                  router.push(`/platform/${user_id}/crm?view=companies`)
                }
              />
            </div>
          </div>
        </div>
      </PlatformLayout>
    </>
  );
};

export default CompanyDetails;
