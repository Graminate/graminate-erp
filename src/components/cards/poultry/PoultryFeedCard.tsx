type Props = {
  dailyFeedConsumption: number;
  feedInventoryDays: number;
  getFeedLevelColor: (days: number) => string;
};

const PoultryFeedCard = ({
  dailyFeedConsumption,
  feedInventoryDays,
  getFeedLevelColor,
}: Props) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
      <h2 className="text-lg font-semibold text-dark dark:text-light mb-2">
        Feed Status
      </h2>
      <div className="flex justify-around text-center">
        <div>
          <p className="text-sm text-dark dark:text-light">Daily Consumption</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {dailyFeedConsumption} kg
          </p>
        </div>
        <div>
          <p className="text-sm text-dark dark:text-light">Inventory Level</p>
          <p
            className={`text-2xl font-semibold ${getFeedLevelColor(
              feedInventoryDays
            )}`}
          >
            {feedInventoryDays.toFixed(1)} days
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-dark mt-2">
            <div
              className={`h-2 rounded-full ${getFeedLevelColor(
                feedInventoryDays
              ).replace("text-", "bg-")}`}
              style={{
                width: `${Math.min(100, (feedInventoryDays / 7) * 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoultryFeedCard;
