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
  company_name: string;
  owner_name?: string;
  email?: string;
  phone_number?: string;
  type?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
};

type Form = {
  companyName: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  type: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

const initialFormState: Form = {
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
};

const CompanyDetails = () => {
  const router = useRouter();
  const { user_id, data } = router.query;

  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<Form>(initialFormState);
  const [initialFormData, setInitialFormData] =
    useState<Form>(initialFormState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      try {
        const parsedCompany: Company = JSON.parse(data as string);
        setCompany(parsedCompany);

        const newFormValues: Form = {
          companyName: parsedCompany.company_name || "",
          ownerName: parsedCompany.owner_name || "",
          email: parsedCompany.email || "",
          phoneNumber: parsedCompany.phone_number || "",
          type: parsedCompany.type || "",
          addressLine1: parsedCompany.address_line_1 || "",
          addressLine2: parsedCompany.address_line_2 || "",
          city: parsedCompany.city || "",
          state: parsedCompany.state || "",
          postalCode: parsedCompany.postal_code || "",
        };
        setFormData(newFormValues);
        setInitialFormData(newFormValues);
      } catch (error) {
        console.error("Error parsing company data:", error);
      }
    }
  }, [data]);

  const handleInputChange = (field: keyof Form, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!company) return <p>Loading...</p>;

  const hasChanges = Object.keys(formData).some(
    (key) => formData[key as keyof Form] !== initialFormData[key as keyof Form]
  );

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);

    const payload = {
      id: company.company_id,
      company_name: formData.companyName,
      owner_name: formData.ownerName,
      email: formData.email,
      phone_number: formData.phoneNumber,
      address_line_1: formData.addressLine1,
      address_line_2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postalCode,
      type: formData.type,
    };

    try {
      const response = await axiosInstance.put<{ company: Company }>(
        "/companies/update",
        payload
      );
      triggerToast("Company updated successfully", "success");

      const updatedCompany = response.data.company;
      setCompany(updatedCompany);

      const updatedFormValues: Form = {
        companyName: updatedCompany.company_name || "",
        ownerName: updatedCompany.owner_name || "",
        email: updatedCompany.email || "",
        phoneNumber: updatedCompany.phone_number || "",
        type: updatedCompany.type || "",
        addressLine1: updatedCompany.address_line_1 || "",
        addressLine2: updatedCompany.address_line_2 || "",
        city: updatedCompany.city || "",
        state: updatedCompany.state || "",
        postalCode: updatedCompany.postal_code || "",
      };
      setFormData(updatedFormValues);
      setInitialFormData(updatedFormValues);
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
          <title>Company | {initialFormData.companyName || "Details"}</title>
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
            <h1 className="text-2xl font-bold mb-6">
              {initialFormData.companyName || "Company Details"}
            </h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-400">
                Company Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(val) => handleInputChange("companyName", val)}
                  width="large"
                />
                <TextField
                  label="Owner Name"
                  value={formData.ownerName}
                  onChange={(val) => handleInputChange("ownerName", val)}
                  width="large"
                />
                <TextField
                  label="Email"
                  value={formData.email}
                  onChange={(val) => handleInputChange("email", val)}
                  width="large"
                />
                <TextField
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(val) => handleInputChange("phoneNumber", val)}
                  width="large"
                />
                <DropdownLarge
                  items={COMPANY_TYPES}
                  selectedItem={formData.type}
                  onSelect={(value: string) => handleInputChange("type", value)}
                  type="form"
                  label="Type"
                  width="full"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-400">
                Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Address Line 1"
                  value={formData.addressLine1}
                  onChange={(val) => handleInputChange("addressLine1", val)}
                  width="large"
                />
                <TextField
                  label="Address Line 2"
                  value={formData.addressLine2}
                  onChange={(val) => handleInputChange("addressLine2", val)}
                  width="large"
                />
                <TextField
                  label="City"
                  value={formData.city}
                  onChange={(val) => handleInputChange("city", val)}
                  width="large"
                />
                <TextField
                  label="State"
                  value={formData.state}
                  onChange={(val) => handleInputChange("state", val)}
                  width="large"
                />
                <TextField
                  label="Postal Code"
                  value={formData.postalCode}
                  onChange={(val) => handleInputChange("postalCode", val)}
                  width="large"
                />
              </div>
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
