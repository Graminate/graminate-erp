import { faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

type ActiveProductsProps = {
  headerTitle: string;
  items: string[];
  onReorder: (items: string[]) => void;
};

const ActiveProducts = ({
  headerTitle,
  items,
  onReorder,
}: ActiveProductsProps) => {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedItem === null || draggedItem === index) return;

    const newItems = [...items];
    const item = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(index, 0, item);

    onReorder(newItems);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-md w-full bg-white max-h-64">
      <div className="bg-green-200 p-4">
        <h2 className="font-semibold text-light">{headerTitle}</h2>
      </div>
      <div className="overflow-y-auto max-h-48">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(index);
              }}
              onDragEnd={handleDragEnd}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`p-4 cursor-pointer text-dark hover:bg-light duration-150 ease-in-out flex justify-between items-center ${
                draggedItem === index ? "bg-light" : ""
              }`}
            >
              <span>{item}</span>
              {(hoveredItem === index || draggedItem === index) && (
                <FontAwesomeIcon
                  icon={faGripVertical}
                  className="size-4 text-gray-300"
                />
              )}
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-gray-500 italic">
            No items to display.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveProducts;
