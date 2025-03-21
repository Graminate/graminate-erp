import { REMINDER_OPTIONS } from "@/constants/options";
import ClockPicker from "./ClockPicker";
import DropdownSmall from "../Dropdown/DropdownSmall";
import TextField from "../TextField";

type AddTaskViewProps = {
  selectedDate: Date;
  newTask: string;
  setNewTask: (value: string) => void;
  newTaskTime: string;
  setNewTaskTime: (value: string) => void;
  isClockVisible: boolean;
  setIsClockVisible: (value: boolean) => void;
  addTask: () => void;
  setShowAddTask: (value: boolean) => void;
  selectedReminder: string;
  setSelectedReminder: (value: string) => void;
};

const AddTaskView = ({
  selectedDate,
  newTask,
  setNewTask,
  newTaskTime,
  setNewTaskTime,
  isClockVisible,
  setIsClockVisible,
  addTask,
  setShowAddTask,
  selectedReminder,
  setSelectedReminder,
}: AddTaskViewProps) => (
  <>
    <h3 className="text-lg font-bold mb-4 text-dark dark:text-light">
      Add Task for {selectedDate.toDateString()}
    </h3>
    <div className="space-y-4">
      <TextField
        placeholder="Task name"
        value={newTask}
        onChange={setNewTask}
        errorMessage={!newTask.trim() ? "Task name cannot be empty" : ""}
      />
      <button
        className="w-full border border-gray-300 text-dark dark:text-light rounded px-2 py-1 focus:outline-none"
        onClick={() => setIsClockVisible(true)}
      >
        {newTaskTime}
      </button>
      {isClockVisible && (
        <ClockPicker
          selectedTime={newTaskTime}
          onTimeSelected={(time: string) => {
            setNewTaskTime(time);
            setIsClockVisible(false);
          }}
          onCancel={() => setIsClockVisible(false)}
        />
      )}
      <DropdownSmall
        items={REMINDER_OPTIONS}
        label="Alert"
        placeholder="None"
        selected={selectedReminder}
        onSelect={(item: string) => setSelectedReminder(item)}
      />
      <div className="flex space-x-4">
        <button
          className="bg-green-200 hover:bg-green-800 text-white px-4 py-2 rounded"
          onClick={(e) => {
            e.preventDefault();
            addTask();
          }}
          disabled={!newTask.trim() || !newTaskTime.trim()}
        >
          Add
        </button>
        <button
          className="bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 rounded"
          onClick={() => setShowAddTask(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </>
);

export default AddTaskView;
