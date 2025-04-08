type CalendarHeaderProps = {
  calendarMonth: number;
  calendarYear: number;
  previousMonth: () => void;
  nextMonth: () => void;
};

const CalendarHeader = ({
  calendarMonth,
  calendarYear,
  previousMonth,
  nextMonth,
}: CalendarHeaderProps) => (
  <div className="flex items-center justify-between mb-4 px-1">
    <button
      className="p-2 rounded-full text-dark hover:text-light dark:text-light hover:bg-gray-300 dark:hover:text-light dark:hover:bg-gray-200 transition-colors duration-300 ease-in-out"
      onClick={previousMonth}
      aria-label="Previous month"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
    <div className="flex items-center">
      <h2 className="text-lg font-semibold text-dark dark:text-light tracking-wide">
        {`${new Date(calendarYear, calendarMonth).toLocaleString("default", {
          month: "long",
        })} ${calendarYear}`}
      </h2>
    </div>
    <button
      className="p-2 rounded-full text-dark hover:text-light dark:text-light hover:bg-gray-300 dark:hover:text-light dark:hover:bg-gray-200 transition-colors duration-300 ease-in-out"
      onClick={nextMonth}
      aria-label="Next month"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);
export default CalendarHeader;
