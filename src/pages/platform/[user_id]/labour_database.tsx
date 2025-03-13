import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import DataForm from "@/components/form/DataForm";
import Table from "@/components/tables/Table";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";

type View = "labours";

const LabourDatabase = () => {
  const router = useRouter();
  const { user_id, view: queryView } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const view: View =
    typeof queryView === "string" ? (queryView as View) : "labours";

  const [labourRecords, setLabourRecords] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const paginationItems = ["25 per page", "50 per page", "100 per page"];
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch labour data for the given user ID.
  useEffect(() => {
    if (!router.isReady || !parsedUserId) return;

    const fetchLabours = async () => {
      try {
        console.log("Fetching labour data for user:", parsedUserId);
        const response = await fetch(
          `/api/labour/${encodeURIComponent(parsedUserId)}`
        );
        const data = await response.json();
        console.log("Fetched Labour Data:", data);

        if (response.ok) {
          setLabourRecords(data.labours || []);
        } else {
          console.error("Failed to fetch labour data:", data.error);
        }
      } catch (error) {
        console.error("Error fetching labour data:", error);
      }
    };

    fetchLabours();
  }, [router.isReady, parsedUserId]);

  // Derive table data from the fetched labour records.
  const tableData = useMemo(() => {
    if (view === "labours" && labourRecords.length > 0) {
      return {
        columns: [
          "Full Name",
          "Date of Birth",
          "Gender",
          "Role",
          "Phone Number",
          "Aadhar Card",
          "Address",
          "Created On",
        ],
        rows: labourRecords.map((item) => [
          item.labour_id,
          item.full_name,
          new Date(item.date_of_birth).toLocaleDateString(),
          item.gender,
          item.role,
          item.contact_number,
          item.aadhar_card_number,
          item.address,
          new Date(item.created_at).toDateString(),
        ]),
      };
    }
    return { columns: [], rows: [] };
  }, [labourRecords, view]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Labour Database</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-lg font-semibold dark:text-white">
              Worker Database
            </h1>
            <p className="text-xs text-gray-100">
              {labourRecords.length} Record(s)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              text="Add Worker"
              style="primary"
              add
              onClick={() => setIsSidebarOpen(true)}
            />
          </div>
        </div>

        {/* Table displaying the labour data */}
        <Table
          data={{ ...tableData, rows: tableData.rows }}
          filteredRows={tableData.rows}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          paginationItems={paginationItems}
          searchQuery={searchQuery}
          totalRecordCount={tableData.rows.length}
          onRowClick={(row) => {
            const labourId = row[0];
            // Find the full labour record from labourRecords using labour_id
            const labour = labourRecords.find(
              (item) => item.labour_id === labourId
            );
            if (labour) {
              router.push({
                pathname: `/platform/${parsedUserId}/labour_database/${labourId}`,
                query: { data: JSON.stringify(labour) },
              });
            }
          }}
          view={view}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          setSearchQuery={setSearchQuery}
        />

        {/* Sidebar form for creating a new labour record */}
        {isSidebarOpen && (
          <DataForm
            view={view}
            onClose={() => setIsSidebarOpen(false)}
            onSubmit={(values: Record<string, string>) => {
              console.log("Form submitted:", values);
              setIsSidebarOpen(false);
            }}
            formTitle="Create Labour"
          />
        )}
      </div>
    </PlatformLayout>
  );
};

export default LabourDatabase;
