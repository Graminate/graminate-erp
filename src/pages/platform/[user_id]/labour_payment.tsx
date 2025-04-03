import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import Table from "@/components/tables/Table";
import Loader from "@/components/ui/Loader";

interface PayrollEntry {
  id: string;
  employeeName: string;
  grossSalary: number;
  deductions: number;
  netPay: number;
  status: "Paid" | "Unpaid" | "Pending";
}

interface MonthlyPayrollData {
  month: number;
  year: number;
  allocatedBudget: number;
  payrollEntries: PayrollEntry[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const hardcodedPayrollData: { [key: string]: MonthlyPayrollData } = {
  "2024-6": {
    month: 6,
    year: 2024,
    allocatedBudget: 500000,
    payrollEntries: [
      {
        id: "emp001",
        employeeName: "Alice Wonderland",
        grossSalary: 60000,
        deductions: 5000,
        netPay: 55000,
        status: "Paid",
      },
      {
        id: "emp002",
        employeeName: "Bob The Builder",
        grossSalary: 55000,
        deductions: 4500,
        netPay: 50500,
        status: "Paid",
      },
      {
        id: "emp003",
        employeeName: "Charlie Chaplin",
        grossSalary: 70000,
        deductions: 7000,
        netPay: 63000,
        status: "Pending",
      },
      {
        id: "emp004",
        employeeName: "Diana Prince",
        grossSalary: 65000,
        deductions: 6000,
        netPay: 59000,
        status: "Unpaid",
      },
      {
        id: "emp005",
        employeeName: "Ethan Hunt",
        grossSalary: 80000,
        deductions: 8500,
        netPay: 71500,
        status: "Paid",
      },
    ],
  },
  "2024-5": {
    month: 5,
    year: 2024,
    allocatedBudget: 480000,
    payrollEntries: [
      {
        id: "emp001",
        employeeName: "Alice Wonderland",
        grossSalary: 60000,
        deductions: 5000,
        netPay: 55000,
        status: "Paid",
      },
      {
        id: "emp002",
        employeeName: "Bob The Builder",
        grossSalary: 55000,
        deductions: 4500,
        netPay: 50500,
        status: "Paid",
      },
      {
        id: "emp003",
        employeeName: "Charlie Chaplin",
        grossSalary: 70000,
        deductions: 7000,
        netPay: 63000,
        status: "Paid",
      },
      {
        id: "emp005",
        employeeName: "Ethan Hunt",
        grossSalary: 80000,
        deductions: 8500,
        netPay: 71500,
        status: "Paid",
      },
    ],
  },
  "2024-4": {
    month: 4,
    year: 2024,
    allocatedBudget: 470000,
    payrollEntries: [
      {
        id: "emp001",
        employeeName: "Alice Wonderland",
        grossSalary: 58000,
        deductions: 4800,
        netPay: 53200,
        status: "Paid",
      },
      {
        id: "emp002",
        employeeName: "Bob The Builder",
        grossSalary: 54000,
        deductions: 4300,
        netPay: 49700,
        status: "Paid",
      },
      {
        id: "emp003",
        employeeName: "Charlie Chaplin",
        grossSalary: 68000,
        deductions: 6800,
        netPay: 61200,
        status: "Paid",
      },
      {
        id: "emp004",
        employeeName: "Diana Prince",
        grossSalary: 63000,
        deductions: 5800,
        netPay: 57200,
        status: "Paid",
      },
    ],
  },
  "2024-7": {
    // August 2024
    month: 7,
    year: 2024,
    allocatedBudget: 510000,
    payrollEntries: [
      {
        id: "emp001",
        employeeName: "Alice Wonderland",
        grossSalary: 61000,
        deductions: 5100,
        netPay: 55900,
        status: "Pending",
      },
      {
        id: "emp002",
        employeeName: "Bob The Builder",
        grossSalary: 56000,
        deductions: 4600,
        netPay: 51400,
        status: "Pending",
      },
      {
        id: "emp003",
        employeeName: "Charlie Chaplin",
        grossSalary: 71000,
        deductions: 7100,
        netPay: 63900,
        status: "Pending",
      },
      {
        id: "emp004",
        employeeName: "Diana Prince",
        grossSalary: 66000,
        deductions: 6100,
        netPay: 59900,
        status: "Unpaid",
      },
      {
        id: "emp005",
        employeeName: "Ethan Hunt",
        grossSalary: 81000,
        deductions: 8600,
        netPay: 72400,
        status: "Pending",
      },
    ],
  },
};

const LabourPayment = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth()
  );
  const [monthlyPayrollData, setMonthlyPayrollData] =
    useState<MonthlyPayrollData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const paginationItems = ["25 per page", "50 per page", "100 per page"];

  const monthTabs = useMemo(() => {
    const tabs = [];
    let date = new Date(currentDate);
    for (let i = 0; i < 6; i++) {
      tabs.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        label: `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
      });
      date.setMonth(date.getMonth() - 1);
    }
    return tabs.reverse();
  }, [currentDate]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = () => {
      const dataKey = `${selectedYear}-${selectedMonth}`;
      const data = hardcodedPayrollData[dataKey];

      if (data) {
        setMonthlyPayrollData(data);
      } else {
        setMonthlyPayrollData({
          month: selectedMonth,
          year: selectedYear,
          allocatedBudget: 0,
          payrollEntries: [],
        });
      }
      setLoading(false);
    };

    const timer = setTimeout(fetchData, 500);

    return () => clearTimeout(timer);
  }, [selectedYear, selectedMonth]);

  const tableData = useMemo(() => {
    const columns = [
      "Employee Name",
      "Gross Salary",
      "Deductions",
      "Net Pay",
      "Status",
    ];
    const rows =
      monthlyPayrollData?.payrollEntries.map((entry) => [
        entry.employeeName,
        formatCurrency(entry.grossSalary),
        formatCurrency(entry.deductions),
        formatCurrency(entry.netPay),
        entry.status,
      ]) ?? [];
    return { columns, rows };
  }, [monthlyPayrollData]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) {
      return tableData.rows;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return tableData.rows.filter((row) =>
      row.some((cell) => String(cell).toLowerCase().includes(lowerCaseQuery))
    );
  }, [tableData.rows, searchQuery]);

  const totalRecordCount = filteredRows.length;

  const totalPaid = useMemo(() => {
    return (
      monthlyPayrollData?.payrollEntries
        .filter((entry) => entry.status === "Paid")
        .reduce((sum, entry) => sum + entry.netPay, 0) ?? 0
    );
  }, [monthlyPayrollData]);

  const totalPending = useMemo(() => {
    return (
      monthlyPayrollData?.payrollEntries
        .filter((entry) => entry.status !== "Paid")
        .reduce((sum, entry) => sum + entry.netPay, 0) ?? 0
    );
  }, [monthlyPayrollData]);

  const allocatedBudget = monthlyPayrollData?.allocatedBudget ?? 0;
  const remainingBudget = allocatedBudget - totalPaid;

  const handleMonthTabClick = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setCurrentPage(1); 
    setSearchQuery("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRowClick = (row: any[]) => {
    console.log("Row clicked:", row);
  };

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Employee Payroll Dashboard</title>
      </Head>
      <div className="p-4 md:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-2xl md:text-3xl font-semibold text-dark dark:text-light">
          Employee Payroll Dashboard
        </h1>

        <div className="flex space-x-2 border-b border-gray-300 dark:border-gray-700 mb-6 overflow-x-auto pb-2">
          {monthTabs.map((tab) => (
            <button
              key={`${tab.year}-${tab.month}`}
              onClick={() => handleMonthTabClick(tab.month, tab.year)}
              className={`px-4 py-2 rounded-t-md text-sm md:text-base whitespace-nowrap ${
                selectedMonth === tab.month && selectedYear === tab.year
                  ? "bg-green-200 text-white font-medium shadow-sm"
                  : "bg-gray-500 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader />
          </div>
        )}

        {error && (
          <div
            className="bg-red-100  text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!loading && !error && !monthlyPayrollData?.payrollEntries.length && (
          <div
            className="bg-gray-400 dark:bg-gray-700 text-dark dark:text-light px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <strong className="font-bold">Info:</strong>
            <span className="block sm:inline">
              {" "}
              No payroll data found for {MONTH_NAMES[selectedMonth]}{" "}
              {selectedYear}.
            </span>
          </div>
        )}

        {!loading && !error && monthlyPayrollData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-dark dark:text-light">
                Allocated Budget
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(allocatedBudget)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-dark dark:text-light">
                Total Paid
              </h3>
              <p className="text-2xl font-semibold text-green-600">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-dark dark:text-light">
                Remaining / Pending
              </h3>
              {allocatedBudget >= totalPaid ? (
                <p
                  className={`text-2xl font-semibold ${
                    remainingBudget >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(remainingBudget)}
                </p>
              ) : (
                <p className="text-2xl font-semibold text-orange-600">
                  {formatCurrency(totalPending)}{" "}
                  <span className="text-sm">(Pending)</span>
                </p>
              )}
              {allocatedBudget < totalPaid && (
                <p className="text-xs text-red-600">Budget Exceeded</p>
              )}
            </div>
          </div>
        )}

        {!loading && !error && monthlyPayrollData && (
          <Table
            data={tableData}
            filteredRows={filteredRows}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            paginationItems={paginationItems}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            totalRecordCount={totalRecordCount}
            onRowClick={handleRowClick}
            view="labour_payroll"
            loading={loading}
          />
        )}
      </div>
    </PlatformLayout>
  );
};

export default LabourPayment;
