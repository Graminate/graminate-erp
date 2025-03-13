import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import SearchDropdown from "@/components/ui/SearchDropdown";
import DataForm from "@/components/form/DataForm";
import Table from "@/components/tables/Table";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";

type View = "contacts" | "companies" | "contracts" | "receipts" | "tickets";

const ContactsPage = () => {
  const router = useRouter();
  const { user_id, view: queryView } = router.query;
  const view: View =
    typeof queryView === "string" ? (queryView as View) : "contacts";

  const [contactsData, setContactsData] = useState<any[]>([]);
  const [companiesData, setCompaniesData] = useState<any[]>([]);
  const [contractsData, setContractsData] = useState<any[]>([]);
  const [receiptsData, setReceiptsData] = useState<any[]>([]);
  const [ticketsData, setTicketsData] = useState<any[]>([]);
  // Data to display based on the view
  const [fetchedData, setFetchedData] = useState<any[]>([]);

  // UI state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownItems = [
    { label: "Contacts", view: "contacts" },
    { label: "Companies", view: "companies" },
    { label: "Contracts", view: "contracts" },
    { label: "Receipts", view: "receipts" },
    { label: "Tickets", view: "tickets" },
  ];

  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const paginationItems = ["25 per page", "50 per page", "100 per page"];
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all data on mount (once the router is ready)
  useEffect(() => {
    if (!router.isReady || !user_id) return;

    Promise.all([
      fetch(`/api/contacts/${user_id}`),
      fetch(`/api/companies/${user_id}`),
      fetch(`/api/contracts/${user_id}`),
      fetch(`/api/receipts/${user_id}`),
      fetch(`/api/tickets/${user_id}`),
    ])
      .then(
        async ([
          contactsRes,
          companiesRes,
          contractsRes,
          receiptsRes,
          ticketsRes,
        ]) => {
          if (contactsRes.ok) {
            const data = await contactsRes.json();
            setContactsData(data.contacts || []);
          }
          if (companiesRes.ok) {
            const data = await companiesRes.json();
            setCompaniesData(data.companies || []);
          }
          if (contractsRes.ok) {
            const data = await contractsRes.json();
            setContractsData(data.contracts || []);
          }
          if (receiptsRes.ok) {
            const data = await receiptsRes.json();
            setReceiptsData(data.receipts || []);
          }
          if (ticketsRes.ok) {
            const data = await ticketsRes.json();
            setTicketsData(data.tickets || []);
          }
        }
      )
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [router.isReady, user_id]);

  // Update the displayed data based on the current view
  useEffect(() => {
    switch (view) {
      case "contacts":
        setFetchedData(contactsData);
        break;
      case "companies":
        setFetchedData(companiesData);
        break;
      case "contracts":
        setFetchedData(contractsData);
        break;
      case "receipts":
        setFetchedData(receiptsData);
        break;
      case "tickets":
        setFetchedData(ticketsData);
        break;
      default:
        setFetchedData([]);
    }
  }, [
    view,
    contactsData,
    companiesData,
    contractsData,
    receiptsData,
    ticketsData,
  ]);

  // Derive table data based on the view and fetched data
  const tableData = useMemo(() => {
    switch (view) {
      case "contacts":
        if (fetchedData.length === 0) {
          return { columns: [], rows: [] };
        }
        return {
          columns: [
            "First Name",
            "Last Name",
            "Email",
            "Phone Number",
            "Type",
            "Address",
            "Created / Updated On",
          ],
          rows: fetchedData.map((item) => [
            item.contact_id,
            item.first_name,
            item.last_name,
            item.email,
            item.phone_number,
            item.type,
            item.address,
            new Date(item.created_at).toDateString(),
          ]),
        };
      case "companies":
        if (fetchedData.length === 0) {
          return { columns: [], rows: [] };
        }
        return {
          columns: [
            "Company Name",
            "Owner Name",
            "Email",
            "Phone Number",
            "Address",
            "Type",
          ],
          rows: fetchedData.map((item) => [
            item.company_id,
            item.company_name,
            item.owner_name,
            item.email,
            item.phone_number,
            item.address,
            item.type,
          ]),
        };
      case "contracts":
        if (fetchedData.length === 0) {
          return { columns: [], rows: [] };
        }
        return {
          columns: [
            "Deal Name",
            "Partner / Client",
            "Amount",
            "Status",
            "Start Date",
            "End Date",
          ],
          rows: fetchedData.map((item) => [
            item.deal_id,
            item.deal_name,
            item.partner,
            item.amount,
            item.stage,
            new Date(item.start_date).toDateString(),
            new Date(item.end_date).toDateString(),
          ]),
        };
      case "receipts":
        if (fetchedData.length === 0) {
          return { columns: [], rows: [] };
        }
        return {
          columns: [
            "ID",
            "Title",
            "Bill To",
            "Date Created",
            "Amount Paid",
            "Amount Due",
            "Due Date",
            "Status",
          ],
          rows: [
            [
              "001",
              "Fertilizer Subscription",
              "Jensen Fertilizers",
              "2024-11-01",
              "$200",
              "$50",
              "2024-12-01",
              "Unpaid",
            ],
          ],
        };
      case "tickets":
        return {
          columns: [
            "ID",
            "Title",
            "Crop",
            "Status",
            "Budget",
            "Created On",
            "End Date",
          ],
          rows: [
            [
              "001",
              "Summer Farm",
              "Green Tea",
              "Active",
              "40,000",
              "2024-11-01",
              "2025-07-01",
            ],
          ],
        };
      default:
        return { columns: [], rows: [] };
    }
  }, [fetchedData, view]);

  // Filter rows based on the search query
  const filteredRows = useMemo(() => {
    if (!searchQuery) return tableData.rows;
    return tableData.rows.filter((row) =>
      row.some((cell) =>
        cell.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [tableData, searchQuery]);

  // Apply pagination to the filtered rows
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  const totalRecordCount = filteredRows.length;

  // Function to update the URL with a new view parameter
  const navigateTo = (newView: string) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("view", newView);
    router.push(currentUrl.toString());
    setDropdownOpen(false);
  };

  const handleRowClick = (row: any[]) => {
    const id = row[0];
    const rowData = JSON.stringify(row);

    if (view === "contacts") {
      router.push({
        pathname: `/platform/${user_id}/contacts/${id}`,
        query: { data: rowData },
      });
    } else if (view === "companies") {
      router.push({
        pathname: `/platform/${user_id}/companies/${id}`,
        query: { data: rowData },
      });
    } else if (view === "contracts") {
      router.push({
        pathname: `/platform/${user_id}/contracts/${id}`,
        query: { data: rowData },
      });
    } else if (view === "receipts") {
      router.push({
        pathname: `/platform/${user_id}/invoice/${id}`,
        query: { data: rowData },
      });
    } else if (view === "tickets") {
      router.push({
        pathname: `/platform/${user_id}/ticket/${id}`,
        query: { data: rowData },
      });
    }
  };

  // Handle form submission (for create actions)
  const handleFormSubmit = (values: Record<string, string>) => {
    console.log("Form submitted:", values);
    setIsSidebarOpen(false);
  };

  const formTitle = useMemo(() => {
    if (view === "contacts") return "Create Contact";
    if (view === "companies") return "Create Company";
    if (view === "tickets") return "Create Ticket";
    return "";
  }, [view]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | CRM</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        {/* Header with dropdown and create button */}
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div className="relative">
            <button
              className="flex items-center text-lg font-semibold dark:text-white rounded focus:outline-none"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {view === "contacts" && "Contacts"}
              {view === "companies" && "Companies"}
              {view === "contracts" && "Contracts"}
              {view === "receipts" && "Receipts"}
              {view === "tickets" && "Tickets"}
              <svg
                className="ml-2 w-4 h-4 transform transition-transform"
                style={{
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {dropdownOpen && (
              <SearchDropdown items={dropdownItems} navigateTo={navigateTo} />
            )}
            <p className="text-xs text-gray-100">
              {totalRecordCount} Record(s)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              text={`Create ${view.charAt(0).toUpperCase() + view.slice(1)}`}
              style="primary"
              onClick={() => setIsSidebarOpen(true)}
            />
          </div>
        </div>

        <Table
          data={{ ...tableData, rows: paginatedRows }}
          filteredRows={filteredRows}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          paginationItems={paginationItems}
          searchQuery={searchQuery}
          totalRecordCount={totalRecordCount}
          onRowClick={handleRowClick}
          view={view}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={() => {}}
          setSearchQuery={setSearchQuery}
        />

        {/* Sidebar form for creating new entries */}
        {isSidebarOpen && (
          <DataForm
            view={view}
            onClose={() => setIsSidebarOpen(false)}
            onSubmit={handleFormSubmit}
            formTitle={formTitle}
          />
        )}
      </div>
    </PlatformLayout>
  );
};

export default ContactsPage;
