import { Column, Id, Task } from "@/types/types";
import React from "react";

type TaskListViewProps = {
  tasks: Task[];
  columns: Column[];
  openTaskModal: (task: Task) => void;
};

const TaskListView = ({
  tasks = [],
  columns = [],
  openTaskModal,
}: TaskListViewProps) => {
  const getColumnName = (columnId: Id) => {
    return columns.find((col) => col.id === columnId)?.title || "Unknown";
  };

  const handleRowClick = (task: Task) => {
    openTaskModal(task);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center text-dark dark:text-light py-8">
        No tasks found matching your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6">
              ID
            </th>
            <th scope="col" className="py-3 px-6">
              Summary
            </th>
            <th scope="col" className="py-3 px-6">
              Status
            </th>
            <th scope="col" className="py-3 px-6">
              Labels
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
              onClick={() => handleRowClick(task)}
            >
              <th
                scope="row"
                className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {task.id}
              </th>
              <td className="py-4 px-6 text-dark dark:text-light">
                {task.title}
              </td>
              <td className="py-4 px-6 text-dark dark:text-light">
                {getColumnName(task.columnId)}
              </td>
              <td className="py-4 px-6 text-dark dark:text-light">
                {task.type
                  ? task.type.split(",").map((label) =>
                      label.trim() ? (
                        <span
                          key={label.trim()}
                          className="text-xs bg-gray-300 text-light px-2.5 py-1.5 rounded-full dark:bg-gray-700 dark:text-light mr-1 mb-1 inline-block"
                        >
                          {label.trim()}
                        </span>
                      ) : null
                    )
                  : "None"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListView;
