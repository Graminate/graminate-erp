import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import TextField from "@/components/ui/TextField";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import Button from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";

const WAREHOUSE_TYPES = [
  "Ambient Storage",
  "Cold Storage",
  "Climate Controlled Storage",
  "Bulk Silo Storage",
  "Packhouse",
  "Hazardous Storage",
];

const WarehouseForm = ({ onClose, formTitle }: SidebarProp) => {
  const router = useRouter();
  const { user_id } = router.query;

  const [animate, setAnimate] = useState(false);
  const [warehouseData, setWarehouseData] = useState({
    name: "",
    type: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    contact_person: "",
    phone: "",
    storage_capacity: "",
  });

  const panelRef = useRef<HTMLDivElement>(null);

  useAnimatePanel(setAnimate);

  useClickOutside(panelRef, () => {
    setAnimate(false);
    setTimeout(() => handleClose(), 300);
  });

  const handleClose = () => {
    onClose();
  };

  const handleSubmitWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_id) {
      alert("User ID is missing. Cannot create warehouse.");
      return;
    }

    const payload = {
      user_id: Number(user_id),
      name: warehouseData.name,
      type: warehouseData.type,
      address_line_1: warehouseData.address_line_1 || undefined,
      address_line_2: warehouseData.address_line_2 || undefined,
      city: warehouseData.city || undefined,
      state: warehouseData.state || undefined,
      postal_code: warehouseData.postal_code || undefined,
      country: warehouseData.country || undefined,
      contact_person: warehouseData.contact_person || undefined,
      phone: warehouseData.phone || undefined,
      storage_capacity: warehouseData.storage_capacity
        ? parseFloat(warehouseData.storage_capacity)
        : undefined,
    };

    try {
      await axiosInstance.post(`/warehouse/add`, payload);
      setWarehouseData({
        name: "",
        type: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        contact_person: "",
        phone: "",
        storage_capacity: "",
      });
      handleClose();
      window.location.reload();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error adding warehouse:", message);
      alert(`Error adding warehouse: ${message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full md:w-1/3 bg-light dark:bg-gray-800 shadow-lg dark:border-l border-gray-700 overflow-y-auto"
        style={{
          transform: animate ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-out",
        }}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-400 dark:border-gray-200">
            <h2 className="text-xl font-semibold text-dark dark:text-light">
              {formTitle ? formTitle : "Create Warehouse"}
            </h2>
            <button
              className="text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              onClick={handleClose}
              aria-label="Close panel"
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>
          </div>
          <form
            className="flex flex-col gap-4 w-full flex-grow"
            onSubmit={handleSubmitWarehouse}
          >
            <TextField
              label="Warehouse Name"
              placeholder="e.g. Main Storage Facility"
              value={warehouseData.name}
              onChange={(val: string) =>
                setWarehouseData({ ...warehouseData, name: val })
              }
            />

            <DropdownLarge
              items={WAREHOUSE_TYPES}
              selectedItem={warehouseData.type}
              onSelect={(value: string) =>
                setWarehouseData({ ...warehouseData, type: value })
              }
              type="form"
              label="Warehouse Type"
              width="full"
            />

            <TextField
              label="Address Line 1"
              placeholder="e.g. 123 Industrial Park Rd"
              value={warehouseData.address_line_1}
              onChange={(val: string) =>
                setWarehouseData({ ...warehouseData, address_line_1: val })
              }
            />

            <TextField
              label="Address Line 2"
              placeholder="e.g. Suite 100"
              value={warehouseData.address_line_2}
              onChange={(val: string) =>
                setWarehouseData({ ...warehouseData, address_line_2: val })
              }
            />

            <TextField
              label="City"
              placeholder="e.g. Springfield"
              value={warehouseData.city}
              onChange={(val: string) =>
                setWarehouseData({ ...warehouseData, city: val })
              }
            />

            <TextField
              label="State / Province"
              placeholder="e.g. Illinois"
              value={warehouseData.state}
              onChange={(val: string) =>
                setWarehouseData({ ...warehouseData, state: val })
              }
            />

            <TextField
              label="Postal Code"
              placeholder="e.g. 62701"
              value={warehouseData.postal_code}
              onChange={(val: string) =>
                setWarehouseData({ ...warehouseData, postal_code: val })
              }
            />

            <TextField
              label="Country"
              placeholder="e.g. USA"
              value={warehouseData.country}
              onChange={(val: string) =>
                setWarehouseData({ ...warehouseData, country: val })
              }
            />

            <TextField
              label="Contact Person"
              placeholder="e.g. John Doe"
              value={warehouseData.contact_person}
              onChange={(val: string) =>
                setWarehouseData({ ...warehouseData, contact_person: val })
              }
            />

            <TextField
              label="Phone Number"
              placeholder="e.g. (555) 123-4567"
              value={warehouseData.phone}
              onChange={(val: string) =>
                setWarehouseData({ ...warehouseData, phone: val })
              }
            />

            <TextField
              number
              label="Storage Capacity"
              placeholder="e.g. 10000.50 (numeric)"
              value={warehouseData.storage_capacity}
              onChange={(val: string) =>
                setWarehouseData({ ...warehouseData, storage_capacity: val })
              }
            />

            <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-400 dark:border-gray-200">
              <Button text="Create" style="primary" type="submit" />
              <Button text="Cancel" style="secondary" onClick={handleClose} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WarehouseForm;
