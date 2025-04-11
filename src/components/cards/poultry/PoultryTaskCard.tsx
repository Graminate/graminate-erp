import { useState } from "react";
import TextField from "@/components/ui/TextField";
import DropdownLarge from "@/components/ui/Dropdown/DropdownLarge";
import Button from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { PRIORITY_OPTIONS } from "@/constants/options";

type Priority = "High" | "Medium" | "Low";
type Task = {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
};

type PoultryTaskCardProps = {
  initialTasks: Task[];
}

const PoultryTaskCard = ({ initialTasks }: PoultryTaskCardProps) => {
  const [taskList, setTaskList] = useState<Task[]>(initialTasks);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("Medium");
  const [prioritySortAsc, setPrioritySortAsc] = useState(false);

  const priorityRank: Record<Priority, number> = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  const sortTasks = (list: Task[], asc = prioritySortAsc) => {
    const sorted = [...list].sort((a, b) => {
      const aRank = priorityRank[a.priority];
      const bRank = priorityRank[b.priority];
      return asc ? aRank - bRank : bRank - aRank;
    });
    return [
      ...sorted.filter((t) => !t.completed),
      ...sorted.filter((t) => t.completed),
    ];
  };

  const toggleTaskCompletion = (id: number) => {
    setTaskList((prev) =>
      sortTasks(
        prev.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      )
    );
  };

  const addNewTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority,
    };
    setTaskList((prev) => sortTasks([...prev, newTask]));
    setNewTaskText("");
    setNewTaskPriority("Medium");
  };

  const deleteTask = (id: number) => {
    setTaskList((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold text-dark dark:text-light">
          Farm Tasks
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-dark text-xs font-semibold px-2.5 py-0.5 rounded dark:text-light">
            {taskList.filter((t) => !t.completed).length} Pending /{" "}
            {taskList.length} Total
          </span>
          <button
            onClick={() => {
              setPrioritySortAsc((prev) => {
                const newOrder = !prev;
                setTaskList((prevList) => sortTasks(prevList, newOrder));
                return newOrder;
              });
            }}
            className="text-sm bg-gray-500 dark:bg-gray-700 text-dark dark:text-light px-2 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-600 flex items-center cursor-pointer"
          >
            Sort Priority
            <span className="ml-2">
              {prioritySortAsc ? (
                <FontAwesomeIcon icon={faChevronUp} />
              ) : (
                <FontAwesomeIcon icon={faChevronDown} />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Create New Task */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 mb-4">
        <TextField
          placeholder="Add new task"
          value={newTaskText}
          onChange={(val: string) => setNewTaskText(val)}
        />
        <DropdownLarge
          items={PRIORITY_OPTIONS as unknown as string[]}
          selectedItem={newTaskPriority}
          onSelect={(item) => setNewTaskPriority(item as Priority)}
          width="auto"
        />
        <Button text="Task" style="primary" onClick={addNewTask} add />
      </div>

      {/* Tasks List */}
      <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {taskList.map((task) => (
          <li key={task.id} className={`flex items-center p-1.5 rounded`}>
            <input
              id={`task-${task.id}`}
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTaskCompletion(task.id)}
              className={`w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-3 flex-shrink-0`}
            />
            <label
              htmlFor={`task-${task.id}`}
              className={`text-sm font-medium ${
                task.completed
                  ? "line-through text-dark dark:text-light opacity-60"
                  : "text-gray-900 dark:text-gray-300"
              }`}
            >
              {task.text}
            </label>

            {task.completed ? (
              <button
                onClick={() => deleteTask(task.id)}
                className="ml-auto text-xs font-semibold text-light bg-red-200 px-2 py-0.5 rounded"
              >
                Delete
              </button>
            ) : (
              <span
                className={`ml-auto text-xs font-medium px-1.5 py-0.5 rounded ${
                  task.priority === "High"
                    ? "bg-red-300 text-red-100 dark:bg-red-300 dark:text-red-100"
                    : task.priority === "Medium"
                    ? "bg-yellow-200 text-yellow-100 dark:bg-yellow-200 dark:text-yellow-100"
                    : "bg-green-300 text-green-800 dark:bg-green-300 dark:text-green-100"
                }`}
              >
                {task.priority}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PoultryTaskCard;
