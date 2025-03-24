type Task = {
  name: string;
  time: string;
};

type Tasks = {
  [key: string]: Task[];
};

type CalendarGridProps = {
  calendarDays: (number | null)[];
  dayAbbreviations: string[];
  getDayClasses: (day: number | null) => string;
  calendarMonth: number;
  calendarYear: number;
  handleDateChange: (date: Date) => void;
  tasks: Tasks;
};

const CalendarGrid = ({
  calendarDays,
  dayAbbreviations,
  getDayClasses,
  calendarMonth,
  calendarYear,
  handleDateChange,
  tasks,
}: CalendarGridProps) => (
  <>
    <div className="grid grid-cols-7 gap-1 mb-2">
      {dayAbbreviations.map((dayAbbr, idx) => (
        <div
          key={idx}
          className="flex items-center justify-center font-semibold text-sm text-dark dark:text-light"
        >
          {dayAbbr}
        </div>
      ))}
    </div>

    <div className="grid grid-cols-7 gap-1">
      {calendarDays.map((day, index) => {
        const dateKey =
          day &&
          new Date(calendarYear, calendarMonth, day)
            .toISOString()
            .split("T")[0];

        return (
          <div
            key={index}
            className="relative"
            onClick={() =>
              day &&
              handleDateChange(new Date(calendarYear, calendarMonth, day))
            }
          >
            <div className={getDayClasses(day)}>{day || ""}</div>
            {day && tasks[dateKey!] && tasks[dateKey!].length > 0 && (
              <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-100 dark:bg-yellow-200 rounded-full"></span>
            )}
          </div>
        );
      })}
    </div>
  </>
);

export default CalendarGrid;
