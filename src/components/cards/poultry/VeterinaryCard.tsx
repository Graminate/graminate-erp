type VeterinaryCardProps = {
  mortalityRate24h: number;
  vaccineStatus: "Vaccinated" | "Pending" | "Over Due";
  nextVisit: string;
};

const getVaccineStatusStyles = (status: string) => {
  switch (status) {
    case "Vaccinated":
      return "bg-green-200 text-dark";
    case "Pending":
      return "bg-yellow-200 text-dark";
    case "Over Due":
      return "bg-red-200 text-light";
    default:
      return "bg-gray-400 text-dark";
  }
};

const VeterinaryCard = ({
  mortalityRate24h,
  vaccineStatus,
  nextVisit,
}: VeterinaryCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-dark dark:text-light flex items-center gap-2">
        Veterinary Data
      </h2>

      <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <p className="text-sm text-dark dark:text-light">
          Mortality Rate (Last 24h)
        </p>
        <p
          className={`text-3xl font-bold ${
            mortalityRate24h > 0.5
              ? "text-red-500 dark:text-red-400"
              : "text-green-500 dark:text-green-400"
          }`}
        >
          {mortalityRate24h.toFixed(2)}%
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className="text-sm font-medium text-dark dark:text-light">
            Vaccine Status
          </p>
          <p
            className={`mt-1 mx-auto inline-block text-xs font-semibold px-2 py-1 rounded-2xl ${getVaccineStatusStyles(
              vaccineStatus
            )}`}
          >
            {vaccineStatus}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-dark dark:text-light">
            Next Veterinary Visit
          </p>
          <p className="text-lg font-semibold text-blue-200 dark:text-blue-400">
            {nextVisit}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VeterinaryCard;
