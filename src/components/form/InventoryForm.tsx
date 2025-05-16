import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import TextField from "@/components/ui/TextField";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import Button from "@/components/ui/Button";
import { UNITS } from "@/constants/options";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "../ui/Loader";

interface InventoryFormProps extends SidebarProp {
  warehouseId?: number;
}

const InventoryForm = ({
  onClose,
  formTitle,
  warehouseId,
}: InventoryFormProps) => {
  const router = useRouter();
  const { user_id: queryUserId } = router.query;
  const parsedUserId = Array.isArray(queryUserId)
    ? queryUserId[0]
    : queryUserId;

  const [animate, setAnimate] = useState(false);
  const [inventoryItem, setInventoryItem] = useState({
    itemName: "",
    itemGroup: "",
    units: "",
    quantity: "",
    pricePerUnit: "",
  });

  const panelRef = useRef<HTMLDivElement>(null);

  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [isLoadingSubTypes, setIsLoadingSubTypes] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  useAnimatePanel(setAnimate);

  useClickOutside(panelRef, () => {
    setAnimate(false);
    setTimeout(() => handleClose(), 300);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUserSubTypes = async () => {
      if (!parsedUserId) {
        setIsLoadingSubTypes(false);
        setSubTypes([]);
        return;
      }
      setIsLoadingSubTypes(true);
      try {
        const response = await axiosInstance.get(`/user/${parsedUserId}`);
        const user = response.data?.data?.user ?? response.data?.user;
        if (!user) {
          setSubTypes([]);
        } else {
          setSubTypes(Array.isArray(user.sub_type) ? user.sub_type : []);
        }
      } catch (err) {
        setSubTypes([]);
      } finally {
        setIsLoadingSubTypes(false);
      }
    };

    fetchUserSubTypes();
  }, [parsedUserId]);

  const handleClose = () => {
    onClose();
  };

  const handleItemCategoryInputChange = (val: string) => {
    setInventoryItem({ ...inventoryItem, itemGroup: val });

    if (val.length > 0) {
      const filtered = subTypes.filter((subType) =>
        subType.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions(subTypes);
      setShowSuggestions(true);
    }
  };

  const selectCategorySuggestion = (suggestion: string) => {
    setInventoryItem({ ...inventoryItem, itemGroup: suggestion });
    setShowSuggestions(false);
  };

  const handleItemCategoryInputFocus = () => {
    if (subTypes.length > 0) {
      if (!inventoryItem.itemGroup) {
        setSuggestions(subTypes);
      } else {
        const filtered = subTypes.filter((subType) =>
          subType.toLowerCase().includes(inventoryItem.itemGroup.toLowerCase())
        );
        setSuggestions(filtered);
      }
      setShowSuggestions(true);
    }
  };

  const handleSubmitInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedUserId) {
      alert("User ID is missing. Cannot create inventory item.");
      return;
    }
    const payload = {
      user_id: Number(parsedUserId),
      item_name: inventoryItem.itemName,
      item_group: inventoryItem.itemGroup,
      units: inventoryItem.units,
      quantity: Number(inventoryItem.quantity),
      price_per_unit: Number(inventoryItem.pricePerUnit),
      warehouse_id: warehouseId,
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
      alert(message);
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
              {formTitle ? formTitle : "Create Inventory Item"}
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

            <div className="relative">
              <TextField
                label="Item Category"
                placeholder="e.g. Farming Supplies, Raw Materials"
                value={inventoryItem.itemGroup}
                onChange={handleItemCategoryInputChange}
                onFocus={handleItemCategoryInputFocus}
                isLoading={isLoadingSubTypes}
              />
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 mt-1 w-full bg-light dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  {isLoadingSubTypes ? (
                    <p className="text-xs p-2 text-gray-500 dark:text-gray-400">
                      <Loader />
                    </p>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-500 dark:hover:bg-gray-700 text-sm cursor-pointer text-dark dark:text-light"
                        onClick={() => selectCategorySuggestion(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))
                  ) : (
                    ""
                  )}
                </div>
              )}
            </div>

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

export default InventoryForm;
