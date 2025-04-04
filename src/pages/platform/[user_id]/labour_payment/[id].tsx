import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import axios from "axios";
import Button from "@/components/ui/Button";
import Table from "@/components/tables/Table";

interface PaymentRecord {
  payment_id: number;
  labour_id: number;
  payment_date: string;
  base_salary: number;
  bonus: number;
  overtime_pay: number;
  housing_allowance: number;
  travel_allowance: number;
  meal_allowance: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

const LabourPaymentDetails = () => {
  const router = useRouter();
  const { user_id, id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const parsedLabourId = Array.isArray(id) ? id[0] : id;

  const [labourName, setLabourName] = useState<string>("");
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);

  // Table state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const PAGINATION_ITEMS = ["25 per page", "50 per page", "100 per page"];

  useEffect(() => {
    if (!router.isReady || !parsedUserId || !parsedLabourId) return;

    const fetchData = async () => {
      try {
        const [paymentsRes, laboursRes] = await Promise.all([
          axios.get(
            `http://localhost:3001/api/labour_payment/${parsedLabourId}`
          ),
          axios.get(`http://localhost:3001/api/labour/${parsedUserId}`),
        ]);

        setPaymentRecords(paymentsRes.data.payments || []);

        const labours = laboursRes.data.labours || [];
        const labour = labours.find((l: any) => l.labour_id == parsedLabourId);
        if (labour) setLabourName(labour.full_name);
      } catch (error: any) {
        console.error(
          "Error fetching data:",
          error.response?.data?.error || error.message
        );
      }
    };

    fetchData();
  }, [router.isReady, parsedUserId, parsedLabourId]);

  // Table structure
  const tableData = useMemo(() => {
    return {
      columns: [
        "Payment Date",
        "Base Salary",
        "Bonus",
        "Overtime Pay",
        "Housing Allowance",
        "Travel Allowance",
        "Meal Allowance",
        "Total Amount",
        "Payment Status",
      ],
      rows: paymentRecords.map((p) => [
        new Date(p.payment_date).toLocaleDateString(),
        p.base_salary,
        p.bonus,
        p.overtime_pay,
        p.housing_allowance,
        p.travel_allowance,
        p.meal_allowance,
        p.total_amount,
        p.payment_status,
      ]),
    };
  }, [paymentRecords]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return tableData.rows;
    return tableData.rows.filter((row) =>
      row.some((cell) =>
        String(cell).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, tableData.rows]);

  const goBack = () => {
    router.push(`/platform/${parsedUserId}/labour_payment`);
  };


  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Labour Payment Details</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        <Button text="Back" style="ghost" arrow="left" onClick={goBack} />
        <h1 className="text-2xl font-bold mb-4">
          Payment Details for {labourName || `Labour ID: ${parsedLabourId}`}
        </h1>

        <Table
          view="labour_payment"
          data={tableData}
          filteredRows={filteredRows}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          paginationItems={PAGINATION_ITEMS}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalRecordCount={tableData.rows.length}
          onRowClick={() => {}}
          reset={false}
          hideChecks={true}
        />
      </div>
    </PlatformLayout>
  );
};

export default LabourPaymentDetails;
