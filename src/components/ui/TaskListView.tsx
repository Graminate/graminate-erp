import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type TaskListViewProps = {
  selectedDate: Date;
  tasks: { name: string; time: string }[];
  removeTask: (index: number) => void;
  setShowTasks: (value: boolean) => void;
  isSelectedDatePast: boolean;
  setShowAddTask: (value: boolean) => void;
  getDayStatus: (date: Date) => string;
  canAddTask: boolean;
};

const TaskListView = ({
  selectedDate,
  tasks,
  removeTask,
  setShowTasks,
  isSelectedDatePast,
  setShowAddTask,
  getDayStatus,
  canAddTask,
}: TaskListViewProps) => (
  <>
    <h3 className="text-lg font-bold mb-4 text-dark dark:text-light">
      Tasks for {getDayStatus(selectedDate)}
    </h3>
    <ul className="list-disc pl-5 space-y-2">
      {tasks.map((task, index) => (
        <li key={index} className="flex items-center justify-between">
          <span className="text-dark dark:text-light">
            {task.time} - {task.name}
          </span>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => removeTask(index)}
          >
            <FontAwesomeIcon icon={faTrash} className="size-4" />
          </button>
        </li>
      ))}
    </ul>
    <div className="mt-4 flex space-x-4">
      <button
        aria-label="back to calendar"
        className="bg-green-200 hover:bg-green-100 text-white p-2 rounded"
        onClick={() => setShowTasks(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>
      {!isSelectedDatePast && canAddTask && (
        <button
          aria-label="add tasks"
          className="bg-gray-300 hover:bg-gray-200 text-white p-2 rounded-full"
          onClick={() => setShowAddTask(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      )}
    </div>
  </>
);

export default TaskListView;
