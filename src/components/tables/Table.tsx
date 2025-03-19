import React, { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";

type Props = {
  onRowClick: (row: any[]) => void;
  data: { columns: string[]; rows: any[][] };
  filteredRows: any[][];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (n: number) => void;
  paginationItems: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalRecordCount: number;
  view?: string;
  exportEnabled?: boolean;
};

const Table = ({
  onRowClick,
  data,
  filteredRows,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  paginationItems,
  searchQuery,
  setSearchQuery,
  totalRecordCount,
  view = "",
  exportEnabled = true,
}: Props) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<boolean[]>([]);

  // Calculate paginated rows based on the filteredRows, currentPage and itemsPerPage.
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredRows.slice(start, end);
  }, [filteredRows, currentPage, itemsPerPage]);

  // Reset the selected rows whenever the paginated rows or selectAll flag changes.
  useEffect(() => {
    if (paginatedRows.length > 0) {
      setSelectedRows(new Array(paginatedRows.length).fill(selectAll));
    }
  }, [paginatedRows, selectAll]);

  // Count of selected rows
  const selectedRowCount = selectedRows.filter(
    (isSelected) => isSelected
  ).length;

  // Sort the paginated rows based on the selected column and order.
  const sortedAndPaginatedRows = useMemo(() => {
    let rows = [...paginatedRows];
    if (sortColumn !== null) {
      rows.sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        if (typeof valueA === "number" && typeof valueB === "number") {
          return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
        }
        return 0;
      });
    }
    return rows;
  }, [paginatedRows, sortColumn, sortOrder]);

  // Export table data as CSV.
  const exportTableData = () => {
    if (sortedAndPaginatedRows.length === 0) {
      Swal.fire("No Data", "There is no data to export.", "info");
      return;
    }
    const csvContent = [
      data.columns.join(","),
      ...sortedAndPaginatedRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${view}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle "select all" checkbox change.
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    setSelectedRows(new Array(paginatedRows.length).fill(checked));
  };

  // Handle an individual row checkbox change.
  const handleRowCheckboxChange = (
    rowIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setSelectedRows((prev) => {
      const newSelected = [...prev];
      newSelected[rowIndex] = checked;
      setSelectAll(newSelected.every((val) => val));
      return newSelected;
    });
  };

  // Delete selected rows after user confirmation.
  const deleteSelectedRows = async () => {
    const rowsToDelete: number[] = [];

    paginatedRows.forEach((row, index) => {
      if (selectedRows[index]) {
        const id = row[0];
        rowsToDelete.push(id);
      }
    });

    if (rowsToDelete.length === 0) {
      await Swal.fire(
        "No Selection",
        "Please select at least one row to delete.",
        "info"
      );
      return;
    }

    const entityNames: Record<string, string> = {
      companies: "company",
      contacts: "contact",
      labours: "labour",
      contracts: "contract",
      receipts: "receipt",
    };

    const entityToDelete = entityNames[view] || "contracts";

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete the ${entityToDelete} data?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        let endpoint = "";
        if (view === "contacts") endpoint = "contacts";
        else if (view === "companies") endpoint = "companies";
        else if (view === "contracts") endpoint = "contracts";
        else if (view === "receipts") endpoint = "receipts";
        else endpoint = "labour";

        await Promise.all(
          rowsToDelete.map(async (id) => {
            const response = await fetch(`/api/${endpoint}/delete?id=${id}`, {
              method: "DELETE",
            });
            if (!response.ok) {
              throw new Error(
                `Failed to delete ${endpoint.slice(0, -1)} with id ${id}`
              );
            }
          })
        );

        location.reload();
      } catch (error) {
        console.error("Error deleting rows:", error);
        await Swal.fire(
          "Error",
          "Failed to delete selected rows. Please try again.",
          "error"
        );
      }
    }
  };

  // Toggle sort order or set a new sort column.
  const toggleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnIndex);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Handle selection change for pagination dropdown.
  const handleSelect = (item: string) => {
    if (item === "25 per page") setItemsPerPage(25);
    else if (item === "50 per page") setItemsPerPage(50);
    else if (item === "100 per page") setItemsPerPage(100);
  };

  return (
    <div>
      <div className="flex p-1 justify-between items-center border-t border-l border-r border-gray-300 dark:border-gray-200">
        <div className="flex gap-2">
          <SearchBar
            mode="table"
            placeholder="Search data"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
          />
          {selectedRowCount > 0 && (
            <div className="flex items-center ml-4">
              <span className="text-gray-200 dark:text-gray-400 text-sm font-medium">
                {selectedRowCount} selected
              </span>
              <button
                className="ml-2 text-blue-200 text-sm hover:underline cursor-pointer"
                onClick={(event) => {
                  event.preventDefault();
                  deleteSelectedRows();
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {exportEnabled && (
            <Button
              style="secondary"
              text="Export Data"
              onClick={exportTableData}
            />
          )}
        </div>
      </div>

      {sortedAndPaginatedRows.length > 0 ? (
        <table className="table-auto w-full border">
          <thead>
            <tr>
              <th className="p-2 border border-gray-300 dark:border-gray-200 bg-gray-400 dark:bg-gray-800 text-left">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-gray-600"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              </th>
              {data.columns.map((column, index) => (
                <th
                  key={index}
                  className="p-2 border border-gray-300 dark:border-gray-200 bg-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-pointer text-left"
                  onClick={() => toggleSort(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="mr-2 font-semibold">{column}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      />
                    </svg>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAndPaginatedRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-700"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== "INPUT") {
                    onRowClick(row);
                  }
                }}
              >
                <td className="p-2 border border-gray-300 dark:border-gray-200">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-gray-200 dark:text-light"
                    checked={selectedRows[rowIndex] || false}
                    onChange={(e) => handleRowCheckboxChange(rowIndex, e)}
                  />
                </td>
                {view === "contacts" ||
                view === "companies" ||
                view === "contracts" ||
                view === "labours"
                  ? row.slice(1).map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="p-2 border border-gray-300 dark:border-gray-200 text-base font-light dark:text-gray-400"
                      >
                        {cell}
                      </td>
                    ))
                  : row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="p-2 border border-gray-300 dark:border-gray-200 text-base font-light dark:text-gray-400"
                      >
                        {cell}
                      </td>
                    ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center p-4 text-gray-300">
          <span className="text-lg">⚠️</span> Record(s) not Found
        </div>
      )}

      <nav
        className="flex items-center justify-between px-4 py-3 sm:px-6"
        aria-label="Pagination"
      >
        <div className="flex mx-auto px-5 items-center">
          <Button
            text="Previous"
            style="ghost"
            arrow="left"
            isDisabled={currentPage === 1}
            onClick={() => {
              if (currentPage > 1) setCurrentPage(currentPage - 1);
            }}
          />

          <p className="mx-3 text-sm dark:text-light text-dark">
            <span className="px-2 py-1 border border-gray-300 rounded-sm">
              {currentPage}
            </span>
          </p>

          <Button
            text="Next"
            style="ghost"
            arrow="right"
            isDisabled={
              currentPage === Math.ceil(totalRecordCount / itemsPerPage)
            }
            onClick={() => {
              if (currentPage < Math.ceil(totalRecordCount / itemsPerPage))
                setCurrentPage(currentPage + 1);
            }}
          />
        </div>
        <div className="relative">
          <DropdownLarge
            items={paginationItems}
            selectedItem="25 per page"
            onSelect={handleSelect}
          />
        </div>
      </nav>
    </div>
  );
};

export default Table;
