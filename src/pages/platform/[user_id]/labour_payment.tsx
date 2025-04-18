import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import Table from "@/components/tables/Table";
import axiosInstance from "@/lib/utils/axiosInstance";

const LabourPayment = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;

  const [labourList, setLabourList] = useState<any[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");

  const tableData = useMemo(() => {
    return {
      columns: [
        "#",
        "Employee",
        "Basic Salary",
        "Phone No.",
        "Aadhar",
        "Address",
      ],
      rows: labourList.map((labour) => [
        labour.labour_id,
        labour.full_name,

        labour.base_salary,
        labour.contact_number,
        labour.aadhar_card_number,
        [
          labour.address_line_1,
          labour.address_line_2,
          labour.city,
          labour.state,
          labour.postal_code,
        ]
          .filter(Boolean)
          .join(", "),
      ]),
    };
  }, [labourList]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return tableData.rows;
    return tableData.rows.filter((row) =>
      row.some((cell) =>
        String(cell).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, tableData.rows]);

  const PAGINATION_ITEMS = ["25 per page", "50 per page", "100 per page"];

  useEffect(() => {
    if (!router.isReady || !parsedUserId) return;

    const fetchLabourList = async () => {
      try {
        const response = await axiosInstance.get(`/labour/${parsedUserId}`);

        setLabourList(response.data.labours || []);
      } catch (error: any) {
        console.error(
          "Error fetching labours:",
          error.response?.data?.error || error.message
        );
      }
    };

    const fetchAllPayments = async () => {
      try {
        const response = await axiosInstance.get(`/labour/${parsedUserId}`);
        const labours = response.data.labours || [];
        const allPayments: any[] = [];

        for (const labour of labours) {
          const response = await axiosInstance.get(
            `/labour_payment/${labour.labour_id}`
          );
          allPayments.push(...(response.data.payments || []));
        }

        setPaymentRecords(allPayments);
      } catch (error: any) {
        console.error("Error fetching payment records:", error.message);
      }
    };

    fetchLabourList();
    fetchAllPayments();
  }, [router.isReady, parsedUserId]);

  const totalPaid = useMemo(() => {
    return paymentRecords
      .filter((p) => (p.payment_status || "").toLowerCase() === "paid")
      .reduce((sum, p) => {
        const salary = parseFloat(p.salary_paid as any);
        return sum + (isNaN(salary) ? 0 : salary);
      }, 0);
  }, [paymentRecords]);

  const currentMonthLabours = labourList.filter((labour) => {
    const date = new Date(labour.created_at);
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  const salaryToPay = currentMonthLabours.reduce(
    (sum, labour) => sum + Number(labour.base_salary || 0),
    0
  );

  const remainingToPay = Math.max(salaryToPay - totalPaid, 0);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Employee Payroll</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-lg font-semibold dark:text-white">
              Salary Manager
            </h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow flex-1">
            <h2 className="text-lg font-semibold">Salary to Pay</h2>
            <p className="text-lg text-dark dark:text-white">
              ₹ {salaryToPay.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow flex-1">
            <h2 className="text-lg font-semibold">Salary Paid </h2>
            <p className="text-lg text-dark dark:text-white">
              ₹ {totalPaid.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow flex-1">
            <h2 className="text-lg font-semibold">Pending Salary</h2>
            <p className="text-lg text-dark dark:text-white">
              ₹ {remainingToPay.toFixed(2)}
            </p>
          </div>
        </div>

        <Table
          view="labour"
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
          onRowClick={(row) => {
            const labourId = row[0];
            router.push({
              pathname: `/platform/${parsedUserId}/labour_payment/${labourId}`,
            });
          }}
          reset={false}
          hideChecks={true}
        />
      </div>
    </PlatformLayout>
  );
};

export default LabourPayment;
