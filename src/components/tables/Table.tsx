import React, { useState, useMemo, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import Loader from "@/components/ui/Loader";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faSort,
  faSortUp,
  faSortDown,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
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
  loading,
}: Props) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<boolean[]>([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredRows.slice(start, end);
  }, [filteredRows, currentPage, itemsPerPage]);

  // Calculate maxQuantity for inventory status outside the renderCellContent function
  // This ensures useMemo is called consistently at the top level
  const maxQuantityForInventory = useMemo(() => {
    if (
      view !== "inventory" ||
      !data.columns.includes("Quantity") ||
      filteredRows.length === 0
    ) {
      return 0;
    }
    const quantityIndex = data.columns.indexOf("Quantity");
    if (quantityIndex === -1) return 0; // Should not happen if check above passed, but good practice

    return Math.max(
      ...filteredRows.map((r) => Number(r[quantityIndex]) || 0) // Ensure values are numbers
    );
  }, [view, filteredRows, data.columns]);

  useEffect(() => {
    setSelectAll(false);
    setSelectedRows(new Array(paginatedRows.length).fill(false));
  }, [paginatedRows]);

  useEffect(() => {
    setSelectedRows((prev) => prev.map(() => selectAll));
  }, [selectAll]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportDropdownRef]);

  const selectedRowCount = selectedRows.filter(
    (isSelected) => isSelected
  ).length;

  const sortedAndPaginatedRows = useMemo(() => {
    let rows = [...paginatedRows];
    if (sortColumn !== null) {
      rows.sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return sortOrder === "asc" ? 1 : -1;
        if (valueB == null) return sortOrder === "asc" ? -1 : 1;

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        if (typeof valueA === "number" && typeof valueB === "number") {
          return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
        }

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [paginatedRows, sortColumn, sortOrder]);

  const getExportRows = () => {
    const selectedCurrentPageRows = sortedAndPaginatedRows.filter(
      (_, idx) => selectedRows[idx]
    );

    if (selectedCurrentPageRows.length > 0) {
      return selectedCurrentPageRows;
    }

    let rowsToExport = [...filteredRows];
    if (sortColumn !== null) {
      rowsToExport.sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return sortOrder === "asc" ? 1 : -1;
        if (valueB == null) return sortOrder === "asc" ? -1 : 1;

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        if (typeof valueA === "number" && typeof valueB === "number") {
          return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
        }
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return rowsToExport;
  };

  const exportTableData = (format: "pdf" | "xlsx") => {
    setShowExportDropdown(false);
    const exportRows = getExportRows();

    if (exportRows.length === 0) {
      Swal.fire("No Data", "There is no data to export.", "info");
      return;
    }

    const exportColumns = data.columns.slice(1);
    const exportBody = exportRows.map((row) => row.slice(1));

    const exportViewName = view
      ? view.charAt(0).toUpperCase() + view.slice(1)
      : "TableData";

    if (format === "pdf") {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [exportColumns],
        body: exportBody,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
        didDrawPage: (data) => {
          doc.setFontSize(16);
          doc.setTextColor(40);
          doc.text(`${exportViewName} Data`, data.settings.margin.left, 15);
        },
      });
      doc.save(`${exportViewName}_Export.pdf`);
    }

    if (format === "xlsx") {
      const worksheet = XLSX.utils.aoa_to_sheet([exportColumns, ...exportBody]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      const cols = Object.keys(worksheet)
        .filter((key) => key.match(/[A-Z]+1$/))
        .map((key) => {
          const col = key.replace("1", "");
          const maxLen = Math.max(
            ...Object.keys(worksheet)
              .filter((k) => k.startsWith(col) && k !== key)
              .map((k) => (worksheet[k].v ? String(worksheet[k].v).length : 0)),
            worksheet[key].v ? String(worksheet[key].v).length : 0
          );
          return { wch: maxLen + 2 };
        });
      worksheet["!cols"] = cols;

      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportViewName}_Export.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);
  };

  const handleRowCheckboxChange = (
    rowIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setSelectedRows((prev) => {
      const newSelected = [...prev];
      newSelected[rowIndex] = checked;

      const allChecked = newSelected.every((val) => val);
      setSelectAll(allChecked);
      return newSelected;
    });
  };

  const deleteSelectedRows = async () => {
    const rowsToDeleteIndices = selectedRows
      .map((isSelected, index) => (isSelected ? index : -1))
      .filter((index) => index !== -1);

    const rowsToDeleteIds = rowsToDeleteIndices.map(
      (index) => sortedAndPaginatedRows[index][0]
    );

    if (rowsToDeleteIds.length === 0) {
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

    const entityToDelete = entityNames[view] || "record";
    const pluralEntity =
      rowsToDeleteIds.length > 1 ? `${entityToDelete}s` : entityToDelete;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete the selected ${pluralEntity}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleting...",
        text: `Please wait while deleting the selected ${pluralEntity}.`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        let endpoint = "";
        if (view === "contacts") endpoint = "contacts";
        else if (view === "companies") endpoint = "companies";
        else if (view === "contracts") endpoint = "contracts";
        else if (view === "receipts") endpoint = "receipts";
        else if (view === "labour") endpoint = "labour";
        else endpoint = "inventory";

        const deletePromises = rowsToDeleteIds.map((id) =>
          axios.delete(`http://localhost:3001/api/${endpoint}/delete/${id}`)
        );

        await Promise.all(deletePromises);

        Swal.fire(
          "Deleted!",
          `The selected ${pluralEntity} have been deleted.`,
          "success"
        ).then(() => {
          location.reload();
        });
      } catch (error: any) {
        console.error("Error deleting rows:", error);
        const message =
          error.response?.data?.error ||
          `Failed to delete selected ${pluralEntity}. Please try again.`;
        Swal.fire("Error", message, "error");
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
  };

  const handleSelectItemsPerPage = (item: string) => {
    const num = parseInt(item.split(" ")[0]);
    setItemsPerPage(num);
    setCurrentPage(1);
  };

  const getSortIcon = (columnIndex: number) => {
    if (sortColumn !== columnIndex) {
      return (
        <FontAwesomeIcon
          icon={faSort}
          className="text-gray-400 dark:text-gray-500 ml-2"
        />
      );
    }
    if (sortOrder === "asc") {
      return (
        <FontAwesomeIcon
          icon={faSortUp}
          className="text-blue-500 dark:text-blue-400 ml-2"
        />
      );
    }
    return (
      <FontAwesomeIcon
        icon={faSortDown}
        className="text-blue-500 dark:text-blue-400 ml-2"
      />
    );
  };

  // renderCellContent no longer needs to calculate maxQuantity
  const renderCellContent = (
    cell: any,
    rowIndex: number,
    cellIndex: number
  ) => {
    // Use the pre-calculated maxQuantityForInventory
    if (view === "inventory" && data.columns[cellIndex] === "Status") {
      const quantityIndex = data.columns.indexOf("Quantity");
      // Ensure quantityIndex is valid before accessing row data
      if (quantityIndex === -1)
        return <span className="text-gray-400 italic">N/A</span>;

      const quantity =
        Number(sortedAndPaginatedRows[rowIndex][quantityIndex]) || 0;
      // Use the pre-calculated maxQuantityForInventory
      const maxQuantity = maxQuantityForInventory;
      const ratio = maxQuantity > 0 ? quantity / maxQuantity : 0;

      let count = 0;
      let color = "";
      let tooltip = "";

      if (ratio <= 0) {
        count = 0;
        color = "text-gray-400 dark:text-gray-600";
        tooltip = "Out of Stock";
      } else if (ratio < 0.25) {
        count = 1;
        color = "text-red-500 dark:text-red-400";
        tooltip = "Very Low Stock";
      } else if (ratio < 0.5) {
        count = 2;
        color = "text-orange-500 dark:text-orange-400";
        tooltip = "Low Stock";
      } else if (ratio < 0.75) {
        count = 3;
        color = "text-yellow-500 dark:text-yellow-400";
        tooltip = "Medium Stock";
      } else {
        count = 4;
        color = "text-green-500 dark:text-green-400";
        tooltip = "High Stock";
      }

      return (
        <div className="flex items-center gap-1" title={tooltip}>
          {count > 0 ? (
            Array.from({ length: count }).map((_, i) => (
              <FontAwesomeIcon
                key={i}
                icon={faCircle}
                className={`${color} text-xs`}
              />
            ))
          ) : (
            <span className="text-xs text-gray-500 italic">{tooltip}</span>
          )}
        </div>
      );
    }

    if (
      typeof cell === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(cell)
    ) {
      try {
        return new Date(cell).toLocaleDateString();
      } catch (e) {}
    }

    if (cell === null || typeof cell === "undefined") {
      return <span className="text-gray-400 italic">N/A</span>;
    }

    return String(cell);
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row p-4 justify-between items-center gap-4 border-b border-gray-400 dark:border-gray-700">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <SearchBar
            mode="table"
            placeholder={`Search ${view}...`}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
          />
          {selectedRowCount > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedRowCount} selected
              </span>
              <button
                className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 text-sm font-medium flex items-center gap-1"
                onClick={deleteSelectedRows}
                title="Delete Selected Rows"
              >
                <FontAwesomeIcon icon={faTrash} />
                Delete
              </button>
            </div>
          )}
        </div>

        {exportEnabled && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {view &&
              [
                "contacts",
                "companies",
                "contracts",
                "receipts",
                "labour",
                "inventory",
              ].includes(view) && (
                <Button
                  style="secondary"
                  text="Reset Table"
                  onClick={async () => {
                    const entityNames: Record<string, string> = {
                      contacts: "contacts",
                      companies: "companies",
                      contracts: "contracts",
                      receipts: "receipts",
                      labour: "labours",
                      inventory: "inventory",
                    };

                    const entityToTruncate = entityNames[view] || "data";

                    const result = await Swal.fire({
                      title: `Reset ${
                        entityToTruncate.charAt(0).toUpperCase() +
                        entityToTruncate.slice(1)
                      }?`,
                      text: `This will remove all ${entityToTruncate} and reset to default samples. This cannot be undone!`,
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#d33",
                      cancelButtonColor: "#3085d6",
                      confirmButtonText: "Yes, Reset!",
                      cancelButtonText: "Cancel",
                    });

                    if (result.isConfirmed) {
                      Swal.fire({
                        title: "Resetting...",
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading(),
                      });
                      try {
                        const userId = localStorage.getItem("userId");
                        if (!userId) {
                          throw new Error(
                            "User ID not found. Please log in again."
                          );
                        }
                        await axios.post(
                          `http://localhost:3001/api/${view}/reset`,
                          { userId }
                        );
                        Swal.fire(
                          "Reset!",
                          `The ${entityToTruncate} table has been reset.`,
                          "success"
                        ).then(() => location.reload());
                      } catch (err: any) {
                        console.error(err);
                        const errorMsg =
                          err.response?.data?.message ||
                          err.message ||
                          "Failed to reset table.";
                        Swal.fire("Error", errorMsg, "error");
                      }
                    }
                  }}
                />
              )}

            <div className="relative" ref={exportDropdownRef}>
              <Button
                style="secondary"
                text="Download Data"
                onClick={() => setShowExportDropdown(!showExportDropdown)}
              />
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded-md shadow-lg z-50 overflow-hidden">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
                    onClick={() => exportTableData("pdf")}
                  >
                    Export as PDF
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
                    onClick={() => exportTableData("xlsx")}
                  >
                    Export as XLSX
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader />
          </div>
        ) : sortedAndPaginatedRows.length > 0 ? (
          <table className="min-w-full table-auto divide-y divide-gray-400 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  <label htmlFor="select-all-checkbox" className="sr-only">
                    Select all
                  </label>
                  <input
                    id="select-all-checkbox"
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 bg-gray-100 dark:bg-gray-700"
                    checked={selectAll && sortedAndPaginatedRows.length > 0}
                    onChange={handleSelectAllChange}
                    disabled={sortedAndPaginatedRows.length === 0}
                  />
                </th>
                {data.columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-700 group"
                    onClick={() => toggleSort(index)}
                    title={`Sort by ${column}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column}</span>
                      <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                        {getSortIcon(index)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-400 dark:divide-gray-700">
              {sortedAndPaginatedRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 ease-in-out ${
                    selectedRows[rowIndex]
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    const checkboxCell = target.closest("td:first-child");
                    const isCheckboxClick =
                      target.tagName === "INPUT" &&
                      target.getAttribute("type") === "checkbox";

                    if (!isCheckboxClick && !checkboxCell) {
                      onRowClick(row);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td className="p-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-900 focus:ring-2 bg-white dark:bg-gray-800"
                      checked={selectedRows[rowIndex] || false}
                      onChange={(e) => handleRowCheckboxChange(rowIndex, e)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </td>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                    >
                      {renderCellContent(cell, rowIndex, cellIndex)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 px-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2zm0 0h16"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No data available
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "Try adjusting your search or filter criteria."
                : "There is currently no data to display."}
            </p>
          </div>
        )}
      </div>

      {!loading && totalRecordCount > 0 && (
        <nav
          className="flex items-center justify-between px-4 py-3 sm:px-6 border-t border-gray-400 dark:border-gray-700"
          aria-label="Pagination"
        >
          <div className="hidden sm:block">
            <DropdownLarge
              items={paginationItems}
              selectedItem={`${itemsPerPage} per page`}
              onSelect={handleSelectItemsPerPage}
            />
          </div>

          <div className="flex-1 flex justify-between sm:justify-center items-center gap-2">
            <Button
              text="Previous"
              style="ghost"
              arrow="left"
              isDisabled={currentPage === 1}
              onClick={() => {
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              aria-label="Go to previous page"
            />

            <p className="text-sm text-gray-700 dark:text-gray-300">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">
                {Math.ceil(totalRecordCount / itemsPerPage)}
              </span>
            </p>

            <Button
              text="Next"
              style="ghost"
              arrow="right"
              isDisabled={currentPage * itemsPerPage >= totalRecordCount}
              onClick={() => {
                if (currentPage * itemsPerPage < totalRecordCount)
                  setCurrentPage(currentPage + 1);
              }}
              aria-label="Go to next page"
            />
          </div>

          <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
            Showing{" "}
            <span className="font-medium">
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalRecordCount)}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalRecordCount)}
            </span>{" "}
            of <span className="font-medium">{totalRecordCount}</span> results
          </div>
        </nav>
      )}
    </div>
  );
};

export default Table;
