import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TextArea from "@/components/ui/TextArea";
import CustomTable from "@/components/tables/CustomTable";
import PlatformLayout from "@/layout/PlatformLayout";
import { triggerToast } from "@/stores/toast";
import Head from "next/head";
import domtoimage from "dom-to-image";
import jsPDF from "jspdf";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import { PAYMENT_STATUS } from "@/constants/options";
import axiosInstance from "@/lib/utils/axiosInstance";

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
  const [receiptTitle, setReceiptTitle] = useState("");
  const [customer, setCustomer] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [status, setStatus] = useState("");
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
    receiptTitle: "",
    customer: "",
    shipTo: "",
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
        setReceiptTitle(parsedReceipt.title || "");
        setReceiptNumber(parsedReceipt.invoice_id?.toString() || "");
        const formattedDueDate = parsedReceipt.due_date
          ? new Date(parsedReceipt.due_date).toISOString().split("T")[0]
          : "";
        setDueDate(formattedDueDate);
        setCustomer(parsedReceipt.bill_to || "");
        setReceiptTitle(parsedReceipt.title || "");
        setPaymentTerms(parsedReceipt.payment_terms || "");
        setPoNumber(parsedReceipt.po_number || "");
        setShipTo(parsedReceipt.ship_to || "");
        setNotes(parsedReceipt.notes || "");
        setTerms(parsedReceipt.terms || "");
        setItems(
          parsedReceipt.items || [
            { description: "", quantity: 1, rate: 0, amount: 0 },
          ]
        );
        setTax(parsedReceipt.tax || 0);
        setDiscount(parsedReceipt.discount || 0);
        setShipping(parsedReceipt.shipping || 0);
        setAmountPaid(parsedReceipt.amount_paid || 0);
        setAmountPaid(parsedReceipt.amount_paid || 0);
        setAmountDue(parsedReceipt.amount_due || 0);
        setStatus(parsedReceipt.status || "");

        setInitialFormData({
          receiptNumber: parsedReceipt.invoice_id?.toString() || "",
          receiptTitle: parsedReceipt.title || "",
          customer: parsedReceipt.bill_to || "",
          shipTo: parsedReceipt.ship_to || "",
          paymentTerms: parsedReceipt.payment_terms || "",
          dueDate: formattedDueDate,
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

  const hasChanges =
    receiptNumber !== initialFormData.receiptNumber ||
    customer !== initialFormData.customer ||
    shipTo !== initialFormData.shipTo ||
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
      invoice_id: receipt.invoice_id,
      user_id,
      title: receiptTitle,
      bill_to: customer,
      ship_to: shipTo,
      payment_terms: paymentTerms,
      due_date: dueDate,
      po_number: poNumber,
      notes,
      terms,
      amount_paid: amountPaid,
      amount_due: calculateAmounts().balanceDue,
      status,
      tax,
      discount,
      shipping,
      items,
    };

    try {
      const response = await axiosInstance.put("/receipts/update", payload);
      triggerToast("Receipt updated successfully", "success");
      setInitialFormData({
        receiptNumber,
        receiptTitle,
        customer,
        shipTo,
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

      setReceipt(response.data.invoice);
    } catch (error: any) {
      console.error("Error updating receipt:", error);
      triggerToast(
        error.response?.data?.error ||
          "An error occurred while updating the receipt.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };
  const handleDownload = async () => {
    const element = document.getElementById("receipt-container");
    if (!element) return;

    const buttons = document.querySelectorAll(".exclude-from-pdf");
    buttons.forEach((btn) => ((btn as HTMLElement).style.display = "none"));

    try {
      const imgData = await domtoimage.toPng(element);
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("receipt.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      triggerToast("Could not generate PDF", "error");
    } finally {
      buttons.forEach((btn) => ((btn as HTMLElement).style.display = ""));
    }
  };
  return (
    <PlatformLayout>
      <Head>
        <title>Receipts | CRM</title>
      </Head>
      <div className="px-6" id="receipt-container">
        <div className="exclude-from-pdf">
          <Button
            text="Back"
            style="ghost"
            arrow="left"
            onClick={() =>
              router.push(`/platform/${user_id}/crm?view=receipts`)
            }
          />
        </div>

        <div className="pt-4">
          <div className="flex justify-between items-start pb-6">
            <h1 className="text-2xl font-bold mb-4">{receiptTitle}</h1>
            <div className="text-right text-gray-600">
              <h1 className="text-sm">
                Receipt Number:{" "}
                <span className="font-semibold">#{receiptNumber}</span>
              </h1>
              <h1 className="text-sm">
                Date Created:{" "}
                <span className="font-semibold">
                  {new Date(receipt.created_at).toLocaleDateString()}
                </span>
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-gray-600">
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
              label="Payment Installments"
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
            <TextField
              label="Amount Paid"
              value={amountPaid.toString()}
              onChange={(val) => setAmountPaid(Number(val))}
              width="large"
            />

            <TextField
              label="Amount Due"
              value={amountDue}
              onChange={setAmountDue}
              width="large"
            />

            <DropdownLarge
              label="Status"
              items={PAYMENT_STATUS}
              selectedItem={status}
              onSelect={setStatus}
              type="form"
              width="full"
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
          <div className="flex flex-row mt-6 space-x-4 exclude-from-pdf">
            <Button
              text={saving ? "Updating..." : "Update"}
              style="primary"
              onClick={handleSave}
              isDisabled={!hasChanges || saving}
            />
            <Button
              text="Download Receipt"
              style="primary"
              onClick={handleDownload}
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
