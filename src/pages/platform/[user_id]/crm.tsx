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

type Contact = {
  contact_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  type: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  created_at: string;
};

type Company = {
  company_id: number;
  company_name: string;
  owner_name: string;
  email: string;
  phone_number: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  type: string;
};

type Contract = {
  deal_id: number;
  deal_name: string;
  partner: string;
  amount: number;
  stage: string;
  start_date: string;
  end_date: string;
};

type Receipt = {
  invoice_id: number;
  title: string;
  bill_to: string;
  amount_paid: number;
  amount_due: number;
  due_date: string;
  status: string;
}

type Task = {
  task_id: number;
  project: string;
  task: string;
  status: string;
  description: string;
  priority: string;
  deadline?: string;
  created_on: string;
}

type FetchedDataItem = Contact | Company | Contract | Receipt | Task;

const CRM = () => {
  const router = useRouter();
  const { user_id, view: queryView } = router.query;
  const view: View =
    typeof queryView === "string" &&
    ["contacts", "companies", "contracts", "receipts", "tasks"].includes(
      queryView
    )
      ? (queryView as View)
      : "contacts";

  const [loading, setLoading] = useState(true);
  const [contactsData, setContactsData] = useState<Contact[]>([]);
  const [companiesData, setCompaniesData] = useState<Company[]>([]);
  const [contractsData, setContractsData] = useState<Contract[]>([]);
  const [receiptsData, setReceiptsData] = useState<Receipt[]>([]);
  const [tasksData, setTasksData] = useState<Task[]>([]);
  const [fetchedData, setFetchedData] = useState<FetchedDataItem[]>([]); // Use the union type
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
    const userIdString = Array.isArray(user_id) ? user_id[0] : user_id;
    if (!userIdString) return;

    setLoading(true);

    Promise.all([
      axiosInstance.get<{ contacts: Contact[] }>(`/contacts/${userIdString}`),
      axiosInstance.get<{ companies: Company[] }>(`/companies/${userIdString}`),
      axiosInstance.get<{ contracts: Contract[] }>(
        `/contracts/${userIdString}`
      ),
      axiosInstance.get<{ receipts: Receipt[] }>(`/receipts/${userIdString}`),
      axiosInstance.get<{ tasks: Task[] }>(`/tasks/${userIdString}`),
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
        // Optionally clear data on error
        setContactsData([]);
        setCompaniesData([]);
        setContractsData([]);
        setReceiptsData([]);
        setTasksData([]);
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
          rows: fetchedData
            .filter((item): item is Contact => "contact_id" in item)
            .map((item) => [
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
              new Date(item.created_at).toLocaleDateString(),
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
          rows: fetchedData
            .filter((item): item is Company => "company_id" in item)
            .map((item) => [
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
          rows: fetchedData
            .filter((item): item is Contract => "deal_id" in item)
            .map((item) => [
              item.deal_id,
              item.deal_name,
              item.partner,
              item.amount,
              item.stage,
              new Date(item.start_date).toLocaleDateString(),
              new Date(item.end_date).toLocaleDateString(),
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
          rows: fetchedData
            .filter((item): item is Receipt => "invoice_id" in item)
            .map((item) => [
              item.invoice_id,
              item.title,
              item.bill_to,
              item.amount_paid,
              item.amount_due,
              new Date(item.due_date).toLocaleDateString(),
              item.status,
            ]),
        };
      case "tasks":
        if (fetchedData.length === 0) return { columns: [], rows: [] };
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
          rows: fetchedData
            .filter((item): item is Task => "task_id" in item)
            .map((item) => [
              item.task_id,
              item.project,
              item.task,
              item.status,
              item.description,
              item.priority,
              item.deadline
                ? new Date(item.deadline).toLocaleDateString()
                : "N/A",
              new Date(item.created_on).toLocaleDateString(),
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
        cell?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [tableData, searchQuery]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  const totalRecordCount = filteredRows.length;
  const navigateTo = (newView: string) => {
    if (
      ["contacts", "companies", "contracts", "receipts", "tasks"].includes(
        newView
      )
    ) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("view", newView);
      router.push(currentUrl.toString());
      setDropdownOpen(false);
    }
  };

  const handleRowClick = (item: FetchedDataItem) => {
    // Change parameter type from array to the actual item type
    let id: number | string | undefined; // Variable to hold the ID

    // Type guards to find the correct ID property based on the item's actual type
    if ("contact_id" in item) {
      id = item.contact_id;
    } else if ("company_id" in item) {
      id = item.company_id;
    } else if ("deal_id" in item) {
      id = item.deal_id;
    } else if ("invoice_id" in item) {
      id = item.invoice_id;
    } else if ("task_id" in item) {
      id = item.task_id;
    }

    if (id === undefined || id === null) {
      console.warn("Could not determine ID for the clicked item:", item);
      return; // Cannot proceed without an ID
    }

    const rowData = JSON.stringify(item); // Use the passed item directly
    const userIdString = Array.isArray(user_id) ? user_id[0] : user_id;

    // Determine the correct view based on the item type to ensure correct navigation path
    let resolvedView: View = view; // Default to current view, but refine based on item type
    if ("contact_id" in item) resolvedView = "contacts";
    else if ("company_id" in item) resolvedView = "companies";
    else if ("deal_id" in item) resolvedView = "contracts";
    else if ("invoice_id" in item) resolvedView = "receipts";
    else if ("task_id" in item) resolvedView = "tasks";

    if (userIdString) {
      router.push({
        pathname: `/platform/${userIdString}/${resolvedView}/${id}`, // Use the resolved view based on item type
        query: { data: rowData },
      });
    } else {
      console.error("User ID is missing, cannot navigate.");
    }
  };

  const handleFormSubmit = (values: Record<string, string>) => {
    console.log("Form submitted:", values);
    // Here you would typically make an API call to create the new item
    // For now, just close the sidebar
    setIsSidebarOpen(false);
    // Potentially refetch data after submission
    // Example: refetchData();
  };

  const formTitle = useMemo(() => {
    switch (view) {
      case "contacts":
        return "Create Contact";
      case "companies":
        return "Create Company";
      case "contracts":
        return "Create Contract";
      case "receipts":
        return "Create Receipt";
      case "tasks":
        return "Create Task";
      default:
        return "Create Item";
    }
  }, [view]);

  const getButtonText = (view: View) => {
    switch (view) {
      case "contacts":
        return "Create Contact";
      case "companies":
        return "Create Company";
      case "contracts":
        return "Create Contract";
      case "receipts":
        return "Create Receipt";
      case "tasks":
        return "Create Task";
      default:
        return "Create";
    }
  };

  return (
    <PlatformLayout>
      <Head>
        <title>
          Graminate | CRM - {view.charAt(0).toUpperCase() + view.slice(1)}
        </title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div className="relative">
            <button
              className="flex items-center text-lg font-semibold dark:text-white rounded focus:outline-none"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              {dropdownItems.find((item) => item.view === view)?.label ||
                "Select View"}
              <FontAwesomeIcon
                icon={dropdownOpen ? faChevronUp : faChevronDown}
                className="ml-2 w-4 h-4"
                aria-hidden="true"
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
              text={getButtonText(view)}
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
          onRowClick={(row) => {
            const item = fetchedData.find((dataItem) =>
              Object.values(row).includes(
                ("contact_id" in dataItem && dataItem.contact_id) ||
                  ("company_id" in dataItem && dataItem.company_id) ||
                  ("deal_id" in dataItem && dataItem.deal_id) ||
                  ("invoice_id" in dataItem && dataItem.invoice_id) ||
                  ("task_id" in dataItem && dataItem.task_id)
              )
            );
            if (item) handleRowClick(item);
          }}
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
