import React, { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import Loader from "@/components/ui/Loader";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  loading?: boolean;
  reset?: boolean;
  hideChecks?: boolean;
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
  loading,
  reset = true,
  hideChecks = false,
}: Props) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<boolean[]>([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredRows.slice(start, end);
  }, [filteredRows, currentPage, itemsPerPage]);

  useEffect(() => {
    if (paginatedRows.length > 0) {
      setSelectedRows(new Array(paginatedRows.length).fill(selectAll));
    }
  }, [paginatedRows, selectAll]);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedRowCount = selectedRows.filter(
    (isSelected) => isSelected
  ).length;

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

  const getExportRows = () => {
    const selected = selectedRows
      .map((isSelected, idx) =>
        isSelected ? sortedAndPaginatedRows[idx] : null
      )
      .filter((row) => row !== null);

    return selected.length > 0 ? selected : sortedAndPaginatedRows;
  };

  const exportTableData = (format: "pdf" | "xlsx") => {
    const exportRows = getExportRows();

    if (exportRows.length === 0) {
      Swal.fire("No Data", "There is no data to export.", "info");
      return;
    }

    if (format === "pdf") {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [data.columns],
        body: exportRows,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [52, 73, 94] },
      });
      doc.save(`${view}.pdf`);
    }

    if (format === "xlsx") {
      const worksheet = XLSX.utils.aoa_to_sheet([data.columns, ...exportRows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${view}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    setSelectedRows(new Array(paginatedRows.length).fill(checked));
  };

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
      inventory: "inventory",
      contracts: "contract",
      receipts: "receipt",
    };

    const entityToDelete = entityNames[view] || view;

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
        else if (view === "labour") endpoint = "labour";
        else endpoint = "inventory";

        await Promise.all(
          rowsToDelete.map(async (id) => {
            try {
              await axios.delete(
                `http://localhost:3001/api/${endpoint}/delete/${id}`
              );
            } catch (error: any) {
              const message =
                error.response?.data?.error ||
                `Failed to delete ${endpoint.slice(0, -1)} with id ${id}`;
              console.error(message);
              throw new Error(message);
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

  const toggleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnIndex);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleSelect = (item: string) => {
    if (item === "25 per page") setItemsPerPage(25);
    else if (item === "50 per page") setItemsPerPage(50);
    else if (item === "100 per page") setItemsPerPage(100);
  };

  return (
    <div>
      <div className="flex py-4 justify-between items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 rounded-t-lg transition-colors duration-300">
        <div className="flex gap-2">
          <SearchBar
            mode="table"
            placeholder="Search table"
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
        <div className="flex flex-row">
          {reset && (
            <Button
              style="secondary"
              text="Reset"
              isDisabled={filteredRows.length === 0}
              onClick={async () => {
                if (filteredRows.length === 0) return;

                const entityNames: Record<string, string> = {
                  contacts: "contacts",
                  companies: "companies",
                  contracts: "contracts",
                  receipts: "invoices",
                  labour: "labour",
                  inventory: "inventory",
                };

                const entityToTruncate = entityNames[view] || view;

                const result = await Swal.fire({
                  title: "Are you sure?",
                  text: `This will reset your ${entityToTruncate} database.`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Yes, Reset!",
                  cancelButtonText: "Cancel",
                });

                if (result.isConfirmed) {
                  try {
                    const userId = localStorage.getItem("userId");
                    await axios.post(
                      `http://localhost:3001/api/${entityToTruncate}/reset`,
                      {
                        userId,
                      }
                    );
                    Swal.fire(
                      "Reset!",
                      "Table has been reset.",
                      "success"
                    ).then(() => location.reload());
                    let endpoint = "";
                  } catch (err) {
                    console.error(err);
                    Swal.fire("Error", "Failed to reset table.", "error");
                  }
                }
              }}
            />
          )}

          <div className="relative" ref={dropdownRef}>
            <Button
              style="secondary"
              text="Download Data"
              isDisabled={filteredRows.length === 0}
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            />
            {showExportDropdown && (
              <div className="absolute left-0 top-full mt-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-50 transition transform duration-200">
                <button
                  className="w-full text-left text-sm px-4 py-2 hover:bg-gray-400 rounded-t-lg dark:hover:bg-gray-600"
                  onClick={() => {
                    exportTableData("pdf");
                    setShowExportDropdown(false);
                  }}
                >
                  Export as PDF
                </button>
                <button
                  className="w-full text-left text-sm px-4 py-2 hover:bg-gray-400 rounded-b-lg dark:hover:bg-gray-600"
                  onClick={() => {
                    exportTableData("xlsx");
                    setShowExportDropdown(false);
                  }}
                >
                  Export as XLSX
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : sortedAndPaginatedRows.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
          <thead>
            <tr>
              {!hideChecks && (
                <th className="p-3 text-left font-medium text-dark dark:text-gray-300 bg-gray-500 hover:bg-gray-400 dark:bg-gray-800 dark:border-gray-700">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-gray-600"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                  />
                </th>
              )}
              {data.columns.map((column, index) => (
                <th
                  key={index}
                  className="p-3  dark:border-gray-700 bg-gray-500 dark:bg-gray-800 dark:text-gray-300 cursor-pointer text-left transition-colors duration-200 hover:bg-gray-400 dark:hover:bg-gray-700"
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
                className="cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== "INPUT") {
                    onRowClick(row);
                  }
                }}
              >
                {!hideChecks && (
                  <td className="p-3 border-b border-gray-300 dark:border-gray-700 text-base font-light text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-gray-200 dark:text-light"
                      checked={selectedRows[rowIndex] || false}
                      onChange={(e) => handleRowCheckboxChange(rowIndex, e)}
                    />
                  </td>
                )}

                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="p-2 border-b border-gray-300 dark:border-gray-200 text-base font-light dark:text-gray-400 max-w-[200px] truncate overflow-hidden whitespace-nowrap"
                    title={typeof cell === "string" ? cell : undefined}
                  >
                    {view === "inventory" &&
                    data.columns[cellIndex] === "Status" ? (
                      <div className="flex gap-[2px] text-sm">
                        {(() => {
                          const quantity =
                            row[data.columns.indexOf("Quantity")];
                          const max = Math.max(
                            ...filteredRows.map(
                              (r) => r[data.columns.indexOf("Quantity")]
                            )
                          );
                          const ratio = quantity / max;
                          let count = 0;
                          let color = "";

                          if (ratio < 0.25) {
                            count = 1;
                            color = "text-red-200";
                          } else if (ratio < 0.5) {
                            count = 2;
                            color = "text-orange-400";
                          } else if (ratio < 0.75) {
                            count = 3;
                            color = "text-yellow-200";
                          } else {
                            count = 4;
                            color = "text-green-200";
                          }

                          return Array.from({ length: count }).map((_, i) => (
                            <FontAwesomeIcon
                              key={i}
                              icon={faCircle}
                              className={color}
                            />
                          ));
                        })()}
                      </div>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center p-4 text-gray-300">
          <span className="text-lg">⚠️</span> No Data Available
        </div>
      )}

      {!loading && (
        <nav
          className="flex items-center justify-between px-4 py-3 sm:px-6 bg-gray-50 dark:bg-gray-800 rounded-b-lg transition-colors duration-300"
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
      )}
    </div>
  );
};

export default Table;
