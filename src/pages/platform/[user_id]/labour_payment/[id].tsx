import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import axios from "axios";
import Button from "@/components/ui/Button";
import Table from "@/components/tables/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faMobileScreen,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import SalaryModal from "@/components/modals/SalaryModal";
import { API_BASE_URL } from "@/constants/constants";

type PaymentRecord = {
  payment_id: number;
  labour_id: number;
  payment_date: string;
  salary_paid: number;
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
  const [contact, setContact] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const PAGINATION_ITEMS = ["25 per page", "50 per page", "100 per page"];

  useEffect(() => {
    if (!router.isReady || !parsedUserId || !parsedLabourId) return;

    const fetchData = async () => {
      try {
        const laboursRes = await axios.get(
          `${API_BASE_URL}/labour/${parsedUserId}`
        );
        const labours = laboursRes.data.labours || [];
        const labour = labours.find((l: any) => l.labour_id == parsedLabourId);

        if (labour) {
          setLabourName(labour.full_name);
          setContact(labour.contact_number || "");
          setAddress(
            [
              labour.address_line_1,
              labour.address_line_2,
              labour.city,
              labour.state,
              labour.postal_code,
            ]
              .filter(Boolean)
              .join(", ")
          );
        }

        try {
          const paymentsRes = await axios.get(
            `${API_BASE_URL}/labour_payment/${parsedLabourId}`
          );
          setPaymentRecords(paymentsRes.data.payments || []);
        } catch (err: any) {
          console.warn(
            "No payments found:",
            err.response?.data?.error || err.message
          );
          setPaymentRecords([]);
        }
      } catch (error: any) {
        console.error(
          "Error fetching data:",
          error.response?.data?.error || error.message
        );
      }
    };

    fetchData();
  }, [router.isReady, parsedUserId, parsedLabourId]);

  const tableData = useMemo(() => {
    return {
      columns: [
        "Payment Date",
        "Salary Paid",
        "Bonus",
        "Overtime Pay",
        "Housing Allowance",
        "Travel Allowance",
        "Meal Allowance",
        "Total Salary",
        "Payment Status",
      ],
      rows: paymentRecords.map((p) => [
        new Date(p.payment_date).toLocaleDateString(),
        p.salary_paid,
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
        <title>Graminate | Salary Details</title>
      </Head>
      <Button text="Back" style="ghost" arrow="left" onClick={goBack} />
      <div className="min-h-screen container mx-auto px-4">
        <div className="flex flex-row items-start justify-between mt-4">
          <h1 className="text-lg font-semibold dark:text-white">
            Salary Details
          </h1>
          <Button
            text="Add Salary"
            style="primary"
            add
            onClick={() => {
              setSelectedRecord(null);
              setShowSalaryModal(true);
            }}
          />
        </div>

        <div className="flex flex-row gap-6 items-start mt-2 space-y-1">
          <p className="text-sm text-dark dark:text-light">
            <span className="font-semibold mr-2">
              <FontAwesomeIcon icon={faUser} />
            </span>
            {labourName}
          </p>
          <p className="text-sm text-dark dark:text-light">
            <span className="font-semibold mr-2">
              <FontAwesomeIcon icon={faMobileScreen} />
            </span>
            {contact}
          </p>
          <p className="text-sm text-dark dark:text-light">
            <span className="font-semibold mr-2">
              <FontAwesomeIcon icon={faHome} />
            </span>
            {address}
          </p>
        </div>

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
          onRowClick={(row) => {
            const payment = paymentRecords.find(
              (p) => new Date(p.payment_date).toLocaleDateString() === row[0]
            );
            if (payment) {
              setSelectedRecord(payment);
              setShowSalaryModal(true);
            }
          }}
          reset={false}
          hideChecks={true}
        />

        {showSalaryModal && (
          <SalaryModal
            labourId={parsedLabourId || ""}
            editMode={!!selectedRecord}
            initialData={selectedRecord || undefined}
            onClose={() => {
              setShowSalaryModal(false);
              setSelectedRecord(null);
            }}
            onSuccess={() => router.replace(router.asPath)}
          />
        )}
      </div>
    </PlatformLayout>
  );
};

export default LabourPaymentDetails;
