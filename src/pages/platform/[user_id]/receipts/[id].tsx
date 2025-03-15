import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TextArea from "@/components/ui/TextArea";
import CustomTable from "@/components/tables/CustomTable";
import PlatformLayout from "@/layout/PlatformLayout";
import Swal from "sweetalert2";
import Head from "next/head";

type Item = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

const ReceiptDetails = () => {
  const router = useRouter();
  const { user_id, data } = router.query;
  const [receipt, setReceipt] = useState<any | null>(null);

  const [receiptNumber, setReceiptNumber] = useState("");
  const [customer, setCustomer] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [dateCreated, setDateCreated] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 },
  ]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  // Keep a copy of the initial form data for change detection
  const [initialFormData, setInitialFormData] = useState({
    receiptNumber: "",
    customer: "",
    shipTo: "",
    dateCreated: "",
    paymentTerms: "",
    dueDate: "",
    poNumber: "",
    notes: "",
    terms: "",
    items: [] as Item[],
    tax: 0,
    discount: 0,
    shipping: 0,
    amountPaid: 0,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      try {
        const parsedReceipt = JSON.parse(data as string);
        setReceipt(parsedReceipt);
        // Map the database fields to the local state.
        // Use invoice_id as the Receipt Number.
        setReceiptNumber(parsedReceipt.invoice_id?.toString() || "");
        setCustomer(parsedReceipt.bill_to || "");
        // If your table stores a shipping address, use it; otherwise default to an empty string.
        setShipTo(parsedReceipt.ship_to || "");
        setDateCreated(parsedReceipt.date_created || "");
        setPaymentTerms(parsedReceipt.payment_terms || "");
        setDueDate(parsedReceipt.due_date || "");
        setPoNumber(parsedReceipt.po_number || "");
        setNotes(parsedReceipt.notes || "");
        setTerms(parsedReceipt.terms || "");
        // If your table doesn't store line items, you may be using defaults.
        setItems(
          parsedReceipt.items || [
            { description: "", quantity: 1, rate: 0, amount: 0 },
          ]
        );
        setTax(parsedReceipt.tax || 0);
        setDiscount(parsedReceipt.discount || 0);
        setShipping(parsedReceipt.shipping || 0);
        setAmountPaid(parsedReceipt.amount_paid || 0);
        setInitialFormData({
          receiptNumber: parsedReceipt.invoice_id?.toString() || "",
          customer: parsedReceipt.bill_to || "",
          shipTo: parsedReceipt.ship_to || "",
          dateCreated: parsedReceipt.date_created || "",
          paymentTerms: parsedReceipt.payment_terms || "",
          dueDate: parsedReceipt.due_date || "",
          poNumber: parsedReceipt.po_number || "",
          notes: parsedReceipt.notes || "",
          terms: parsedReceipt.terms || "",
          items: parsedReceipt.items || [],
          tax: parsedReceipt.tax || 0,
          discount: parsedReceipt.discount || 0,
          shipping: parsedReceipt.shipping || 0,
          amountPaid: parsedReceipt.amount_paid || 0,
        });
      } catch (error) {
        console.error("Error parsing receipt data:", error);
      }
    }
  }, [data]);

  if (!receipt) return <p>Loading...</p>;

  // Check if any field has changed from the initial values
  const hasChanges =
    receiptNumber !== initialFormData.receiptNumber ||
    customer !== initialFormData.customer ||
    shipTo !== initialFormData.shipTo ||
    dateCreated !== initialFormData.dateCreated ||
    paymentTerms !== initialFormData.paymentTerms ||
    dueDate !== initialFormData.dueDate ||
    poNumber !== initialFormData.poNumber ||
    notes !== initialFormData.notes ||
    terms !== initialFormData.terms ||
    tax !== initialFormData.tax ||
    discount !== initialFormData.discount ||
    shipping !== initialFormData.shipping ||
    amountPaid !== initialFormData.amountPaid ||
    JSON.stringify(items) !== JSON.stringify(initialFormData.items);

  const calculateAmounts = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    const taxAmount = Math.max(0, (subtotal * tax) / 100);
    const total = Math.max(0, subtotal + taxAmount - discount + shipping);
    const balanceDue = Math.max(0, total - amountPaid);
    return { subtotal, total, balanceDue };
  };

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      invoice_id: receipt.invoice_id, // using invoice_id as the receipt ID
      user_id,
      title: receiptNumber, // you may update this mapping as needed
      bill_to: customer,
      date_created: dateCreated,
      amount_paid: amountPaid,
      amount_due: calculateAmounts().balanceDue, // recalc amount due
      due_date: dueDate,
      status: "Pending", // adjust status if required
      notes,
      terms,
      items,
      tax,
      discount,
      shipping,
    };

    try {
      const response = await fetch("/api/receipts/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        Swal.fire("Success", "Receipt updated successfully", "success");
        setInitialFormData({
          receiptNumber,
          customer,
          shipTo,
          dateCreated,
          paymentTerms,
          dueDate,
          poNumber,
          notes,
          terms,
          items,
          tax,
          discount,
          shipping,
          amountPaid,
        });
      } else {
        Swal.fire("Error", result.error || "Failed to update receipt", "error");
      }
    } catch (error) {
      console.error("Error updating receipt:", error);
      Swal.fire(
        "Error",
        "An error occurred while updating the receipt.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PlatformLayout>
      <Head>
        <title>Receipts | CRM</title>
      </Head>
      <div className="px-6">
        <Button
          text="Back"
          style="ghost"
          arrow="left"
          onClick={() => router.push(`/platform/${user_id}/crm?view=receipts`)}
        />
        <div className="pt-4">
          <h1 className="text-2xl font-bold mb-4">
            {receiptNumber || "Receipt"}
          </h1>
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <TextField
              label="Receipt Number"
              value={receiptNumber}
              onChange={setReceiptNumber}
              width="large"
            />
            <TextField
              label="Bill To"
              value={customer}
              onChange={setCustomer}
              width="large"
            />
            <TextField
              label="Shipping Address"
              value={shipTo}
              onChange={setShipTo}
              width="large"
            />
            <TextField
              label="Date Created"
              value={dateCreated}
              onChange={setDateCreated}
              width="large"
              calendar
            />
            <TextField
              label="Payment Terms"
              value={paymentTerms}
              onChange={setPaymentTerms}
              width="large"
            />
            <TextField
              label="Due Date"
              value={dueDate}
              onChange={setDueDate}
              width="large"
              calendar
            />
            <TextField
              label="PO Number"
              value={poNumber}
              onChange={setPoNumber}
              width="large"
            />
            <TextArea label="Notes" value={notes} onChange={setNotes} />
            <TextArea label="Terms" value={terms} onChange={setTerms} />
            <CustomTable
              items={items}
              onItemsChange={(newItems) => setItems(newItems)}
            />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>₹{calculateAmounts().subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Total:</span>
              <span>₹{calculateAmounts().total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Balance Due:</span>
              <span>₹{calculateAmounts().balanceDue.toFixed(2)}</span>
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
                router.push(`/platform/${user_id}/crm?view=receipts`)
              }
            />
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default ReceiptDetails;
