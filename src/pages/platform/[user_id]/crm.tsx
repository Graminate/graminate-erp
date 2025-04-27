import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import SearchDropdown from "@/components/ui/SearchDropdown";
import Table from "@/components/tables/Table";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import { PAGINATION_ITEMS } from "@/constants/options";
import CRMForm from "@/components/form/CRMForm";
import axiosInstance from "@/lib/utils/axiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

type View = "contacts" | "companies" | "contracts" | "receipts" | "tasks";

const CRM = () => {
  const router = useRouter();
  const { user_id, view: queryView } = router.query;
  const view: View =
    typeof queryView === "string" ? (queryView as View) : "contacts";

  const [loading, setLoading] = useState(true);
  const [contactsData, setContactsData] = useState<any[]>([]);
  const [companiesData, setCompaniesData] = useState<any[]>([]);
  const [contractsData, setContractsData] = useState<any[]>([]);
  const [receiptsData, setReceiptsData] = useState<any[]>([]);
  const [tasksData, setTasksData] = useState<any[]>([]);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownItems = [
    { label: "Contacts", view: "contacts" },
    { label: "Companies", view: "companies" },
    { label: "Contracts", view: "contracts" },
    { label: "Receipts", view: "receipts" },
    { label: "Tasks", view: "tasks" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!router.isReady || !user_id) return;

    setLoading(true);

    Promise.all([
      axiosInstance.get(`/contacts/${user_id}`),
      axiosInstance.get(`/companies/${user_id}`),
      axiosInstance.get(`/contracts/${user_id}`),
      axiosInstance.get(`/receipts/${user_id}`),
      axiosInstance.get(`/tasks/${user_id}`),
    ])
      .then(
        ([contactsRes, companiesRes, contractsRes, receiptsRes, tasksRes]) => {
          setContactsData(contactsRes.data.contacts || []);
          setCompaniesData(companiesRes.data.companies || []);
          setContractsData(contractsRes.data.contracts || []);
          setReceiptsData(receiptsRes.data.receipts || []);
          setTasksData(tasksRes.data.tasks || []);
        }
      )
      .catch((error) => {
        console.error(
          "Error fetching data:",
          error.response?.data || error.message
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router.isReady, user_id]);

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
      case "tasks":
        setFetchedData(tasksData);
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
    tasksData,
  ]);

  const tableData = useMemo(() => {
    switch (view) {
      case "contacts":
        if (fetchedData.length === 0) return { columns: [], rows: [] };
        return {
          columns: [
            "ID",
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
            [
              item.address_line_1,
              item.address_line_2,
              item.city,
              item.state,
              item.postal_code,
            ]
              .filter(Boolean)
              .join(", "),
            new Date(item.created_at).toDateString(),
          ]),
        };
      case "companies":
        if (fetchedData.length === 0) return { columns: [], rows: [] };
        return {
          columns: [
            "ID",
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
            [
              item.address_line_1,
              item.address_line_2,
              item.city,
              item.state,
              item.postal_code,
            ]
              .filter(Boolean)
              .join(", "),
            item.type,
          ]),
        };
      case "contracts":
        if (fetchedData.length === 0) return { columns: [], rows: [] };
        return {
          columns: [
            "ID",
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
        if (fetchedData.length === 0) return { columns: [], rows: [] };
        return {
          columns: [
            "ID",
            "Title",
            "Bill To",
            "Amount Paid",
            "Amount Due",
            "Due Date",
            "Status",
          ],
          rows: fetchedData.map((item) => [
            item.invoice_id,
            item.title,
            item.bill_to,
            item.amount_paid,
            item.amount_due,
            new Date(item.due_date).toDateString(),
            item.status,
          ]),
        };
      case "tasks":
        return {
          columns: [
            "ID",
            "Project / Category",
            "Task",
            "Status",
            "Description",
            "Priority",
            "Deadline",
            "Created On",
          ],
          rows: fetchedData.map((item) => [
            item.task_id,
            item.project,
            item.task,
            item.status,
            item.description,
            item.priority,
            item.deadline ? new Date(item.deadline).toDateString() : "",
            new Date(item.created_on).toDateString(),
          ]),
        };
      default:
        return { columns: [], rows: [] };
    }
  }, [fetchedData, view]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return tableData.rows;
    return tableData.rows.filter((row) =>
      row.some((cell) =>
        cell.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [tableData, searchQuery]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  const totalRecordCount = filteredRows.length;
  const navigateTo = (newView: string) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("view", newView);
    router.push(currentUrl.toString());
    setDropdownOpen(false);
  };

  const handleRowClick = (row: any[]) => {
    const id = row[0];
    let fullData = null;
    if (view === "receipts") {
      fullData = fetchedData.find((item) => item.invoice_id === id);
    } else if (view === "contacts") {
      fullData = fetchedData.find((item) => item.contact_id === id);
    } else if (view === "companies") {
      fullData = fetchedData.find((item) => item.company_id === id);
    }

    const rowData = JSON.stringify(fullData || row);

    const validViews = [
      "contacts",
      "companies",
      "contracts",
      "receipts",
      "tasks",
    ];

    if (validViews.includes(view)) {
      router.push({
        pathname: `/platform/${user_id}/${view}/${id}`,
        query: { data: rowData },
      });
    }
  };

  const handleFormSubmit = (values: Record<string, string>) => {
    console.log("Form submitted:", values);
    setIsSidebarOpen(false);
  };

  const formTitle = useMemo(() => {
    if (view === "contacts") return "Create Contact";
    if (view === "companies") return "Create Company";
    if (view === "receipts") return "Create Receipt";
    if (view === "tasks") return "Create Task";
    return "";
  }, [view]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | CRM</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
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
              {view === "tasks" && "Tasks"}
              <FontAwesomeIcon
                icon={dropdownOpen ? faChevronUp : faChevronDown}
                className="ml-2 w-4 h-4"
              />
            </button>
            {dropdownOpen && (
              <SearchDropdown items={dropdownItems} navigateTo={navigateTo} />
            )}
            <p className="text-xs text-dark dark:text-light">
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
          paginationItems={PAGINATION_ITEMS}
          searchQuery={searchQuery}
          totalRecordCount={totalRecordCount}
          onRowClick={handleRowClick}
          view={view}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={() => {}}
          setSearchQuery={setSearchQuery}
          loading={loading}
        />

        {isSidebarOpen && (
          <CRMForm
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

export default CRM;
