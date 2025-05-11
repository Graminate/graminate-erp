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
import axiosInstance from "@/lib/utils/axiosInstance";
import { AxiosError } from "axios";

type Item = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

type ApiItem = {
  description: string;
  quantity: number;
  rate: number;
};

type Receipt = {
  invoice_id: string;
  title: string;
  receipt_number: string;
  total: number;
  items: Array<ApiItem>; // Items from API don't have 'amount'
  paymentMethod: "cash" | "card" | "other";
  receipt_date: string;
  bill_to: string;
  payment_terms: string | null;
  due_date: string;
  notes: string | null;
  tax: number;
  discount: number;
  shipping: number;
  bill_to_address_line1: string | null;
  bill_to_address_line2: string | null;
  bill_to_city: string | null;
  bill_to_state: string | null;
  bill_to_postal_code: string | null;
  bill_to_country: string | null;
  user_id: number;
};

const ReceiptDetails = () => {
  const router = useRouter();
  const { user_id, data } = router.query;
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const [invoiceIdForDisplay, setInvoiceIdForDisplay] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [mainTitle, setMainTitle] = useState("");
  const [editableReceiptTitle, setEditableReceiptTitle] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 },
  ]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  const [billToAddressLine1, setBillToAddressLine1] = useState("");
  const [billToAddressLine2, setBillToAddressLine2] = useState("");
  const [billToCity, setBillToCity] = useState("");
  const [billToState, setBillToState] = useState("");
  const [billToPostalCode, setBillToPostalCode] = useState("");
  const [billToCountry, setBillToCountry] = useState("");

  const [dbReceiptDate, setDbReceiptDate] = useState("");

  const [initialFormData, setInitialFormData] = useState({
    receiptNumber: "",
    editableReceiptTitle: "",
    customerName: "",
    paymentTerms: "",
    dueDate: "",
    notes: "",
    items: [] as Item[],
    tax: 0,
    discount: 0,
    shipping: 0,
    billToAddressLine1: "",
    billToAddressLine2: "",
    billToCity: "",
    billToState: "",
    billToPostalCode: "",
    billToCountry: "",
  });

  const [saving, setSaving] = useState(false);

  const transformApiItemsToLocalItems = (apiItems: ApiItem[]): Item[] => {
    return apiItems.map((item) => ({
      ...item,
      quantity: Number(item.quantity) || 0,
      rate: Number(item.rate) || 0,
      amount: (Number(item.quantity) || 0) * (Number(item.rate) || 0),
    }));
  };

  useEffect(() => {
    if (data) {
      try {
        const parsedReceipt = JSON.parse(data as string) as Receipt;
        setReceipt(parsedReceipt);
        setInvoiceIdForDisplay(parsedReceipt.invoice_id?.toString() || "");
        setMainTitle(parsedReceipt.title || "");
        setEditableReceiptTitle(parsedReceipt.title || "");
        setReceiptNumber(parsedReceipt.receipt_number || "");

        const formattedDueDate = parsedReceipt.due_date
          ? new Date(parsedReceipt.due_date).toISOString().split("T")[0]
          : "";
        setDueDate(formattedDueDate);
        setCustomerName(parsedReceipt.bill_to || "");
        setPaymentTerms(parsedReceipt.payment_terms || "");
        setNotes(parsedReceipt.notes || "");

        const localItems =
          parsedReceipt.items && parsedReceipt.items.length > 0
            ? transformApiItemsToLocalItems(parsedReceipt.items)
            : [{ description: "", quantity: 1, rate: 0, amount: 0 }];
        setItems(localItems);

        setTax(parsedReceipt.tax || 0);
        setDiscount(parsedReceipt.discount || 0);
        setShipping(parsedReceipt.shipping || 0);
        setDbReceiptDate(parsedReceipt.receipt_date || "");

        setBillToAddressLine1(parsedReceipt.bill_to_address_line1 || "");
        setBillToAddressLine2(parsedReceipt.bill_to_address_line2 || "");
        setBillToCity(parsedReceipt.bill_to_city || "");
        setBillToState(parsedReceipt.bill_to_state || "");
        setBillToPostalCode(parsedReceipt.bill_to_postal_code || "");
        setBillToCountry(parsedReceipt.bill_to_country || "");

        setInitialFormData({
          receiptNumber: parsedReceipt.receipt_number || "",
          editableReceiptTitle: parsedReceipt.title || "",
          customerName: parsedReceipt.bill_to || "",
          paymentTerms: parsedReceipt.payment_terms || "",
          dueDate: formattedDueDate,
          notes: parsedReceipt.notes || "",
          items: localItems,
          tax: parsedReceipt.tax || 0,
          discount: parsedReceipt.discount || 0,
          shipping: parsedReceipt.shipping || 0,
          billToAddressLine1: parsedReceipt.bill_to_address_line1 || "",
          billToAddressLine2: parsedReceipt.bill_to_address_line2 || "",
          billToCity: parsedReceipt.bill_to_city || "",
          billToState: parsedReceipt.bill_to_state || "",
          billToPostalCode: parsedReceipt.bill_to_postal_code || "",
          billToCountry: parsedReceipt.bill_to_country || "",
        });
      } catch (error) {
        console.error("Error parsing receipt data:", error);
        triggerToast("Error loading receipt data.", "error");
      }
    }
  }, [data]);

  if (!receipt)
    return (
      <PlatformLayout>
        <p className="p-6">Loading receipt details...</p>
      </PlatformLayout>
    );

  const hasChanges =
    receiptNumber !== initialFormData.receiptNumber ||
    editableReceiptTitle !== initialFormData.editableReceiptTitle ||
    customerName !== initialFormData.customerName ||
    paymentTerms !== initialFormData.paymentTerms ||
    dueDate !== initialFormData.dueDate ||
    notes !== initialFormData.notes ||
    tax !== initialFormData.tax ||
    discount !== initialFormData.discount ||
    shipping !== initialFormData.shipping ||
    billToAddressLine1 !== initialFormData.billToAddressLine1 ||
    billToAddressLine2 !== initialFormData.billToAddressLine2 ||
    billToCity !== initialFormData.billToCity ||
    billToState !== initialFormData.billToState ||
    billToPostalCode !== initialFormData.billToPostalCode ||
    billToCountry !== initialFormData.billToCountry ||
    JSON.stringify(
      items.map(({ amount, ...rest }) => ({
        ...rest,
        quantity: Number(rest.quantity),
        rate: Number(rest.rate),
      }))
    ) !== // Ensure consistent types for comparison
      JSON.stringify(
        initialFormData.items.map(({ amount, ...rest }) => ({
          ...rest,
          quantity: Number(rest.quantity),
          rate: Number(rest.rate),
        }))
      );

  const calculateAmounts = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.rate),
      0
    );
    const taxAmount = Math.max(0, (subtotal * Number(tax)) / 100);
    const total = Math.max(
      0,
      subtotal + taxAmount - Number(discount) + Number(shipping)
    );
    return { subtotal, total };
  };

  const handleSave = async () => {
    if (!receipt) return;
    setSaving(true);

    const payload = {
      invoice_id: receipt.invoice_id,
      user_id: receipt.user_id,
      title: editableReceiptTitle,
      receipt_number: receiptNumber,
      bill_to: customerName,
      payment_terms: paymentTerms,
      due_date: dueDate,
      notes,
      tax: Number(tax),
      discount: Number(discount),
      shipping: Number(shipping),
      items: items.map(({ amount, ...rest }) => ({
        // Send to API without 'amount'
        description: rest.description,
        quantity: Number(rest.quantity),
        rate: Number(rest.rate),
      })),
      bill_to_address_line1: billToAddressLine1,
      bill_to_address_line2: billToAddressLine2,
      bill_to_city: billToCity,
      bill_to_state: billToState,
      bill_to_postal_code: billToPostalCode,
      bill_to_country: billToCountry,
    };

    try {
      const response = await axiosInstance.put("/receipts/update", payload);
      triggerToast("Receipt updated successfully", "success");

      const updatedReceipt = response.data.invoice as Receipt; // API response still uses ApiItem for items
      setReceipt(updatedReceipt);
      setMainTitle(updatedReceipt.title || "");

      const updatedLocalItems = transformApiItemsToLocalItems(
        updatedReceipt.items || []
      );
      setItems(updatedLocalItems); // Update items state with calculated amounts

      setInitialFormData({
        receiptNumber,
        editableReceiptTitle,
        customerName,
        paymentTerms,
        dueDate,
        notes,
        items: updatedLocalItems, // Correctly use items with 'amount' for initialFormData
        tax: Number(tax),
        discount: Number(discount),
        shipping: Number(shipping),
        billToAddressLine1,
        billToAddressLine2,
        billToCity,
        billToState,
        billToPostalCode,
        billToCountry,
      });
    } catch (error: unknown) {
      console.error("Error updating receipt:", error);
      const axiosError = error as AxiosError;
      const errorMessage =
        (axiosError.response?.data as { error?: string })?.error ||
        "An error occurred while updating the receipt.";
      triggerToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleItemsChange = (newItemsFromTable: Partial<Item>[]) => {
    const newItemsWithAmount = newItemsFromTable.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      return {
        description: item.description || "",
        quantity: quantity,
        rate: rate,
        amount: quantity * rate,
      };
    });
    setItems(newItemsWithAmount);
  };

  const handleDownload = async () => {
    const element = document.getElementById("receipt-container");
    if (!element) return;

    const buttons = document.querySelectorAll(".exclude-from-pdf");
    buttons.forEach((btn) => ((btn as HTMLElement).style.display = "none"));

    try {
      const imgData = await domtoimage.toPng(element, {
        quality: 0.95,
        bgcolor: "#ffffff",
      });
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      const img = new Image();
      img.src = imgData;
      img.onload = () => {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const ratio = imgWidth / imgHeight;
        let pdfImgWidth = pdfWidth - 40;
        let pdfImgHeight = pdfImgWidth / ratio;
        const pageHeight = pdf.internal.pageSize.getHeight() - 40;

        let heightLeft = pdfImgHeight;
        let position = 20;

        pdf.addImage(imgData, "PNG", 20, position, pdfImgWidth, pdfImgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pdfImgHeight + 20;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 20, position, pdfImgWidth, pdfImgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(`${receiptNumber || "receipt"}.pdf`);
      };
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
        <title>{mainTitle || "Receipt"} | CRM</title>
      </Head>
      <div className="px-6 pb-10" id="receipt-container">
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
            <h1 className="text-2xl font-bold mb-4">{mainTitle}</h1>
            <div className="text-right text-gray-600">
              <h1 className="text-sm">
                Invoice ID:{" "}
                <span className="font-semibold">{receiptNumber}</span>
              </h1>
              <h1 className="text-sm">
                Date:{" "}
                <span className="font-semibold">
                  {dbReceiptDate
                    ? new Date(dbReceiptDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <TextField
              label="Receipt Title"
              value={editableReceiptTitle}
              onChange={setEditableReceiptTitle}
              width="large"
            />
            <TextField
              label="Receipt Number"
              value={receiptNumber}
              onChange={setReceiptNumber}
              width="large"
              placeholder="Enter unique receipt number"
            />
            <TextField
              label="Bill To (Customer Name)"
              value={customerName}
              onChange={setCustomerName}
              width="large"
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

            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">
                Billing Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label="Address Line 1"
                  value={billToAddressLine1}
                  onChange={setBillToAddressLine1}
                  width="large"
                />
                <TextField
                  label="Address Line 2 (Optional)"
                  value={billToAddressLine2}
                  onChange={setBillToAddressLine2}
                  width="large"
                />
                <TextField
                  label="City"
                  value={billToCity}
                  onChange={setBillToCity}
                  width="large"
                />
                <TextField
                  label="State / Province"
                  value={billToState}
                  onChange={setBillToState}
                  width="large"
                />
                <TextField
                  label="Postal Code"
                  value={billToPostalCode}
                  onChange={setBillToPostalCode}
                  width="large"
                />
                <TextField
                  label="Country"
                  value={billToCountry}
                  onChange={setBillToCountry}
                  width="large"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <TextArea label="Notes" value={notes} onChange={setNotes} />
            </div>

            <div className="col-span-1 md:col-span-2">
              <CustomTable items={items} onItemsChange={handleItemsChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
              <TextField
                label="Tax (%)"
                value={tax.toString()}
                onChange={(val) => setTax(Number(val))}
                width="large"
              />
              <TextField
                label="Discount (flat amount)"
                value={discount.toString()}
                onChange={(val) => setDiscount(Number(val))}
                width="large"
              />
              <TextField
                label="Shipping Charges"
                value={shipping.toString()}
                onChange={(val) => setShipping(Number(val))}
                width="large"
              />
            </div>
          </div>
          <div className="mt-8 border-t pt-4">
            <div className="flex justify-end items-center text-gray-700 space-y-2 flex-col">
              <div className="flex justify-between w-full max-w-xs">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  ₹{calculateAmounts().subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between w-full max-w-xs">
                <span>Tax Amount:</span>
                <span className="font-semibold">
                  ₹{((calculateAmounts().subtotal * tax) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between w-full max-w-xs">
                <span>Discount:</span>
                <span className="font-semibold">
                  ₹{Number(discount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between w-full max-w-xs">
                <span>Shipping:</span>
                <span className="font-semibold">
                  ₹{Number(shipping).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between w-full max-w-xs text-xl font-bold">
                <span>Total:</span>
                <span>₹{calculateAmounts().total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-row mt-10 space-x-4 exclude-from-pdf">
            <Button
              text={saving ? "Updating..." : "Update Receipt"}
              style="primary"
              onClick={handleSave}
              isDisabled={!hasChanges || saving}
            />
            <Button
              text="Download PDF"
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
