import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Notification = ({
  id,
  notification,
}: {
  id: number;
  notification: { title: string; description: string };
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 shadow-md rounded-md mb-2 bg-gray-50 dark:bg-gray-700 cursor-pointer"
    >
      <p className="font-semibold text-gray-800 dark:text-light">
        {notification.title}
      </p>
      <p className="text-gray-600 dark:text-gray-300">
        {notification.description}
      </p>
    </div>
  );
};
