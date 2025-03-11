import { useState } from "react";
import Button from "../ui/Button";

type Item = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

const CustomTable = () => {
  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const updateItem = (
    index: number,
    key: keyof Item,
    value: string | number
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [key]: value,
      amount:
        key === "quantity" || key === "rate"
          ? updatedItems[index].quantity * updatedItems[index].rate
          : updatedItems[index].amount,
    };
    setItems(updatedItems);
  };

  return (
    <div>
      {/* Table */}
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-200 mt-6">
        <thead>
          <tr className="bg-gray-800 text-light">
            <th className="border border-gray-300 dark:border-gray-200 px-4 py-2 text-left">
              Item
            </th>
            <th className="border border-gray-300 dark:border-gray-200 px-4 py-2">
              Quantity
            </th>
            <th className="border border-gray-300 dark:border-gray-200 px-4 py-2">
              Rate
            </th>
            <th className="border border-gray-300 dark:border-gray-200 px-4 py-2">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 dark:border-gray-200 px-4 py-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  placeholder="Description of item/service..."
                  className="w-full focus:outline-none bg-transparent dark:text-light"
                />
              </td>
              <td className="border border-gray-300 dark:border-gray-200 p-2 text-center w-6">
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) =>
                    updateItem(index, "quantity", parseInt(e.target.value) || 1)
                  }
                  className="focus:outline-none bg-transparent dark:text-light"
                />
              </td>
              <td className="border border-gray-300 dark:border-gray-200 p-2 text-center w-6">
                <input
                  type="number"
                  value={item.rate}
                  min="0"
                  onChange={(e) =>
                    updateItem(index, "rate", parseFloat(e.target.value) || 0)
                  }
                  className="focus:outline-none bg-transparent dark:text-light"
                />
              </td>
              <td className="border border-gray-300 dark:border-gray-200 dark:text-light p-2 text-right">
                ₹{item.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Line Item Button */}
      <div className="py-2">
        <Button text="+ Add Item" style="primary" onClick={addItem} />
      </div>
    </div>
  );
};

export default CustomTable;
