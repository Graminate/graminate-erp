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
  <div className="flex items-center justify-between mb-4">
    <button
      className="text-gray-600 hover:text-gray-100 dark:text-gray-300 dark:hover:text-light px-2 focus:outline-none"
      onClick={previousMonth}
      aria-label="Previous month"
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
    <div className="flex items-center">
      <span className="text-lg font-semibold text-dark dark:text-light">
        {`${new Date(calendarYear, calendarMonth).toLocaleString("default", {
          month: "long",
        })} ${calendarYear}`}
      </span>
    </div>
    <button
      className="text-gray-200 hover:text-gray-100 dark:text-gray-300 dark:hover:text-light px-2 focus:outline-none"
      onClick={nextMonth}
      aria-label="Next month"
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
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>
  </div>
);
export default CalendarHeader;
