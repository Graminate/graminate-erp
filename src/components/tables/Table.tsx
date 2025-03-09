"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import SearchBar from "../ui/SearchBar";
import Button from "../ui/Button";
import DropdownLarge from "../ui/Dropdown/DropdownLarge";

interface TableProps {
  data: { columns: string[]; rows: any[][] };
  onRowClick: (row: any[]) => void;
  exportEnabled?: boolean;
  view?: string;
}

const Table: React.FC<TableProps> = ({
  data,
  onRowClick,
  exportEnabled = true,
  view = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRows, setFilteredRows] = useState<any[][]>(data.rows);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedRows, setSelectedRows] = useState<boolean[]>([]);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const filtered = data.rows.filter((row) =>
      row.some((cell) =>
        cell.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredRows(filtered);
    setCurrentPage(1);
  }, [searchQuery, data.rows]);

  useEffect(() => {
    setSelectedRows(Array(filteredRows.length).fill(selectAll));
  }, [selectAll, filteredRows]);

  const handleRowCheckboxChange = (index: number) => {
    setSelectedRows((prev) => {
      const updatedSelection = [...prev];
      updatedSelection[index] = !updatedSelection[index];
      setSelectAll(updatedSelection.every(Boolean));
      return updatedSelection;
    });
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    setSelectedRows(filteredRows.map(() => !selectAll));
  };

  const handleSort = (index: number) => {
    if (sortColumn === index) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(index);
      setSortOrder("asc");
    }
  };

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (sortColumn === null) return 0;
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

  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const deleteSelectedRows = async () => {
    const rowsToDelete = paginatedRows
      .map((row, index) => (selectedRows[index] ? row[0] : null))
      .filter((id) => id !== null);

    if (rowsToDelete.length === 0) {
      Swal.fire(
        "No Selection",
        "Please select at least one row to delete.",
        "info"
      );
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${view}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      try {
        const endpoint = view.toLowerCase();

        await Promise.all(
          rowsToDelete.map(async (id) => {
            const response = await fetch(`/api/${endpoint}/delete/${id}`, {
              method: "DELETE",
            });
            if (!response.ok)
              throw new Error(`Failed to delete ${view} with ID ${id}`);
          })
        );

        Swal.fire(
          "Deleted!",
          "The selected rows have been deleted.",
          "success"
        );
        location.reload();
      } catch (error) {
        Swal.fire(
          "Error",
          "Failed to delete selected rows. Please try again.",
          "error"
        );
      }
    }
  };

  const exportTableData = () => {
    if (paginatedRows.length === 0) {
      Swal.fire("No Data", "There is no data to export.", "info");
      return;
    }

    const csvContent = [
      data.columns.join(","), // Header row
      ...paginatedRows.map((row) => row.join(",")), // Data rows
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

  return (
    <div>
      <div className="flex p-1 justify-between items-center border border-gray-300 dark:border-gray-200">
        <div className="flex gap-2">
          <SearchBar
            mode="table"
            placeholder="Search anything"
            query={searchQuery}
            onSearch={setSearchQuery}
          />

          {selectedRows.some(Boolean) && (
            <div className="flex items-center ml-4">
              <span className="text-gray-200 dark:text-gray-400 text-sm font-medium">
                {selectedRows.filter(Boolean).length} selected
              </span>
              <button
                className="ml-2 text-blue-200 text-sm hover:underline"
                onClick={deleteSelectedRows}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {exportEnabled && (
          <Button
            style="secondary"
            text="Export Data"
            onClick={exportTableData}
          />
        )}
      </div>

      {paginatedRows.length > 0 ? (
        <table className="table-auto w-full border mt-2">
          <thead>
            <tr>
              <th className="p-2 border bg-gray-400 dark:bg-gray-800">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              </th>
              {data.columns.map((column, index) => (
                <th
                  key={index}
                  className="p-2 border bg-gray-400 dark:bg-gray-800 cursor-pointer"
                  onClick={() => handleSort(index)}
                >
                  {column}{" "}
                  {sortColumn === index
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-700"
              >
                <td className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selectedRows[rowIndex]}
                    onChange={() => handleRowCheckboxChange(rowIndex)}
                  />
                </td>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="p-2 border"
                    onClick={() => onRowClick(row)}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center p-4 text-gray-300">⚠️ No records found</div>
      )}

      <div className="flex justify-between items-center mt-4">
        <Button
          text="Previous"
          style="ghost"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          isDisabled={currentPage === 1}
        />
        <span>Page {currentPage}</span>
        <Button
          text="Next"
          style="ghost"
          onClick={() => setCurrentPage((p) => p + 1)}
          isDisabled={paginatedRows.length < itemsPerPage}
        />
        <DropdownLarge
          items={["25 per page", "50 per page", "100 per page"]}
          onSelect={(item) => setItemsPerPage(Number(item.split(" ")[0]))}
          selectedItem={""}
        />
      </div>
    </div>
  );
};

export default Table;
