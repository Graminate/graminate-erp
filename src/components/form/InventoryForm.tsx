import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import TextField from "@/components/ui/TextField";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import Button from "@/components/ui/Button";
import { UNITS } from "@/constants/options";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";

const InventoryForm = ({ onClose, formTitle }: SidebarProp) => {
  const router = useRouter();
  const { user_id } = router.query;

  const [animate, setAnimate] = useState(false);
  const [inventoryItem, setInventoryItem] = useState({
    itemName: "",
    itemGroup: "",
    units: "",
    quantity: "",
    pricePerUnit: "",
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

  const handleSubmitInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      user_id: user_id,
      item_name: inventoryItem.itemName,
      item_group: inventoryItem.itemGroup,
      units: inventoryItem.units,
      quantity: inventoryItem.quantity,
      price_per_unit: inventoryItem.pricePerUnit,
    };
    try {
      await axiosInstance.post(`/inventory/add`, payload);
      setInventoryItem({
        itemName: "",
        itemGroup: "",
        units: "",
        quantity: "",
        pricePerUnit: "",
      });
      handleClose();
      window.location.reload();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error adding inventory item:", message);
      alert(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full md:w-1/3 bg-light dark:bg-gray-800 shadow-lg dark:border-l border-gray-200"
        style={{
          transform: animate ? "translateX(0)" : "translateX(500px)",
          transition: "transform 300ms",
        }}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-dark dark:text-light">
              {formTitle ? formTitle : "Create Inventory Item"}
            </h2>
            <button
              className="text-gray-300 hover:text-gray-100"
              onClick={handleClose}
            >
              <FontAwesomeIcon icon={faX} className="w-5 h-5" />
            </button>
          </div>
          <form
            className="flex flex-col gap-4 w-full flex-grow"
            onSubmit={handleSubmitInventoryItem}
          >
            <TextField
              label="Item Name"
              placeholder="e.g. Fertilizer"
              value={inventoryItem.itemName}
              onChange={(val: string) =>
                setInventoryItem({ ...inventoryItem, itemName: val })
              }
            />
            <TextField
              label="Item Group"
              placeholder="e.g. Farming"
              value={inventoryItem.itemGroup}
              onChange={(val: string) =>
                setInventoryItem({ ...inventoryItem, itemGroup: val })
              }
            />
            <DropdownLarge
              items={UNITS}
              selectedItem={inventoryItem.units}
              onSelect={(value: string) =>
                setInventoryItem({ ...inventoryItem, units: value })
              }
              type="form"
              label="Units"
              width="full"
            />
            <TextField
              number
              label="Quantity"
              value={inventoryItem.quantity}
              onChange={(val: string) =>
                setInventoryItem({ ...inventoryItem, quantity: val })
              }
            />
            <TextField
              number
              label="Price Per Unit"
              value={inventoryItem.pricePerUnit}
              onChange={(val: string) =>
                setInventoryItem({ ...inventoryItem, pricePerUnit: val })
              }
            />
            <div className="flex justify-end gap-4 mt-2">
              <Button text="Create" style="primary" type="submit" />
              <Button text="Cancel" style="secondary" onClick={handleClose} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryForm;
