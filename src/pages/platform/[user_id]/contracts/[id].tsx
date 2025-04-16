import Button from "@/components/ui/Button";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import TextField from "@/components/ui/TextField";
import { CONTRACT_STATUS } from "@/constants/options";
import PlatformLayout from "@/layout/PlatformLayout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { triggerToast } from "@/stores/toast";
import Head from "next/head";
import { API_BASE_URL } from "@/constants/constants";
import { fetchCsrfToken } from "@/lib/utils/loadCsrf";

const ContractDetails = () => {
  const router = useRouter();
  const { user_id, data } = router.query;
  const [contract, setContract] = useState<any | null>(null);

  // Editable fields state
  const [contractName, setContractName] = useState("");
  const [displayContractName, setDisplayContractName] = useState("");
  const [partnerClient, setPartnerClient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Keep initial values for change detection
  const [initialFormData, setInitialFormData] = useState({
    contractName: "",
    partnerClient: "",
    amount: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  // Saving state for update request
  const [saving, setSaving] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (data) {
      try {
        const parsedContract = JSON.parse(data as string);
        setContract(parsedContract);
        const initDealName = parsedContract[1] || "";
        const initPartnerClient = parsedContract[2] || "";
        const initAmount = parsedContract[3] || "";
        const initStatus = parsedContract[4] || "";
        const initStartDate = parsedContract[5]
          ? formatDate(parsedContract[5])
          : "";
        const initEndDate = parsedContract[6]
          ? formatDate(parsedContract[6])
          : "";
        setContractName(initDealName);
        setPartnerClient(initPartnerClient);
        setAmount(initAmount);
        setStatus(initStatus);
        setStartDate(initStartDate);
        setEndDate(initEndDate);
        setDisplayContractName(initDealName);
        setInitialFormData({
          contractName: initDealName,
          partnerClient: initPartnerClient,
          amount: initAmount,
          status: initStatus,
          startDate: initStartDate,
          endDate: initEndDate,
        });
      } catch (error) {
        console.error("Error parsing contract data:", error);
      }
    }
  }, [data]);

  if (!contract) return <p>Loading...</p>;

  const hasChanges =
    contractName !== initialFormData.contractName ||
    partnerClient !== initialFormData.partnerClient ||
    amount !== initialFormData.amount ||
    status !== initialFormData.status ||
    startDate !== initialFormData.startDate ||
    endDate !== initialFormData.endDate;

  const handleSave = async () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      triggerToast("End Date of Contract cannot be before Start Date", "error");
      return;
    }

    setSaving(true);

    const payload = {
      id: contract[0],
      deal_name: contractName,
      partner: partnerClient,
      amount: amount,
      stage: status,
      start_date: startDate,
      end_date: endDate,
    };

    try {
      const csrfToken = await fetchCsrfToken();
      const response = await axios.put(
        `${API_BASE_URL}/contracts/update`,
        payload,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );

      console.log("Response from API:", response.data);

      triggerToast("Contract updated successfully", "success");

      setDisplayContractName(contractName);
      setInitialFormData({
        contractName,
        partnerClient,
        amount,
        status,
        startDate,
        endDate,
      });
    } catch (error: any) {
      triggerToast(
        error.response?.data?.error ||
          "An error occurred while updating the contract.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PlatformLayout>
      <Head>
        <title>Contract | {displayContractName}</title>
      </Head>
      <div className="px-6">
        <Button
          text="Back"
          style="ghost"
          arrow="left"
          onClick={() => router.push(`/platform/${user_id}/crm?view=contracts`)}
        />
        <div className="pt-4">
          <h1 className="text-2xl font-bold mb-4">{displayContractName}</h1>
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <TextField
              label="Contract Name"
              value={contractName}
              onChange={(val) => setContractName(val)}
              width="large"
            />
            <TextField
              label="Partner / Client"
              value={partnerClient}
              onChange={(val) => setPartnerClient(val)}
              width="large"
            />
            <TextField
              label="Amount"
              value={amount}
              onChange={(val) => setAmount(val)}
              width="large"
            />
            <DropdownLarge
              items={CONTRACT_STATUS}
              selectedItem={status}
              onSelect={(value: string) => setStatus(value)}
              type="form"
              label="Stage"
              width="full"
            />
            <TextField
              label="Start Date"
              value={startDate}
              onChange={(val) => setStartDate(val)}
              width="large"
              calendar
            />
            <TextField
              label="End Date"
              value={endDate}
              onChange={(val) => setEndDate(val)}
              width="large"
              calendar
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
                router.push(`/platform/${user_id}/crm?view=contracts`)
              }
            />
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default ContractDetails;
