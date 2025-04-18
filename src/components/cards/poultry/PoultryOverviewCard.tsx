type Props = {
  totalChicks: number;
  flockId: string;
  breedType: string;
  flockAgeDays: number;
  flockAgeWeeks: string;
  expectedMarketDate?: string;
};

const PoultryOverviewCard = ({
  totalChicks,
  flockId,
  breedType,
  flockAgeDays,
  flockAgeWeeks,
  expectedMarketDate,
}: Props) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-dark dark:text-light flex items-center gap-2">
        Flock Overview
      </h2>
      <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <p className="text-sm font-medium text-dark dark:text-light mb-1">
          Total Birds
        </p>
        <p className="text-4xl font-bold text-gray-900 dark:text-white">
          {totalChicks.toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className="text-sm font-medium text-dark dark:text-light">
            Flock ID
          </p>
          <p className="text-lg font-semibold text-dark dark:text-light">
            #{flockId}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-dark dark:text-light">
            Breed Type
          </p>
          <p className="text-lg font-semibold text-dark dark:text-light">
            {breedType}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-dark dark:text-light">
            Flock Age
          </p>
          <p className="text-lg font-semibold text-dark dark:text-light">
            {flockAgeDays} days ({flockAgeWeeks} weeks)
          </p>
        </div>
        {breedType === "Broiler" && expectedMarketDate && (
          <div>
            <p className="text-sm font-medium text-dark dark:text-light">
              Expected Market Date
            </p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {expectedMarketDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoultryOverviewCard;
