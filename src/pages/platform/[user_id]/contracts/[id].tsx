import Button from "@/components/ui/Button";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import TextArea from "@/components/ui/TextArea";
import TextField from "@/components/ui/TextField";
import PlatformLayout from "@/layout/PlatformLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const contractStatusOptions = [
  "Negotiation",
  "Pending Approval",
  "Signed",
  "Completed",
  "Terminated",
];

const ContractDetails = () => {
  const router = useRouter();
  const { user_id, data } = router.query;
  const [contract, setContract] = useState<any | null>(null);

  // Editable fields state
  const [contractName, setContractName] = useState("");
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

  useEffect(() => {
    if (data) {
      try {
        const parsedContract = JSON.parse(data as string);
        setContract(parsedContract);
        const initDealName = parsedContract[1] || "";
        const initPartnerClient = parsedContract[2] || "";
        const initAmount = parsedContract[3] || "";
        const initStatus = parsedContract[4] || "";
        const initStartDate = parsedContract[5] || "";
        const initEndDate = parsedContract[6] || "";
        setContractName(initDealName);
        setPartnerClient(initPartnerClient);
        setAmount(initAmount);
        setStatus(initStatus);
        setStartDate(initStartDate);
        setEndDate(initEndDate);
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
    setSaving(true);

    const payload = {
      id: contract[0],
      contract_name: contractName,
      partner_client: partnerClient,
      amount: amount,
      status: status,
      start_date: startDate,
      end_date: endDate,
    };

    console.log("Sending update request with payload:", payload);

    try {
      const response = await fetch("/api/contracts/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Response from API:", result);

      if (response.ok) {
        Swal.fire("Success", "Contract updated successfully", "success");
        setContract(result.contract);
        setInitialFormData({
          contractName,
          partnerClient,
          amount,
          status,
          startDate,
          endDate,
        });
      } else {
        Swal.fire(
          "Error",
          result.error || "Failed to update contract",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating contract:", error);
      Swal.fire(
        "Error",
        "An error occurred while updating the contract.",
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
          onClick={() => router.push(`/platform/${user_id}/crm?view=contracts`)}
        />
        <div className="pt-4">
          <h1 className="text-2xl font-bold mb-4">{contractName}</h1>
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
              items={contractStatusOptions}
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
