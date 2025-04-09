type EnvironmentCardProps = {
  temperature: number | null;
  humidity: number | null;
  lightHours: number | null;
  formatTemperature: (value: number | null, showUnit?: boolean) => string;
};

const EnvironmentCard = ({
  temperature,
  humidity,
  lightHours,
  formatTemperature,
}: EnvironmentCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold text-dark dark:text-light mb-2">
        Environmental Conditions
      </h2>
      <div className="grid grid-cols-2 gap-6 my-5">
        <div className="text-center">
          <p className="text-sm text-dark dark:text-light">Avg. Temperature</p>
          <p className="my-4 text-4xl font-semibold text-gray-900 dark:text-white">
            {formatTemperature(temperature)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-dark dark:text-light">Avg. Humidity</p>
          <p className="my-4 text-4xl font-semibold text-gray-900 dark:text-white">
            {humidity}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-dark dark:text-light">Light Hours</p>
          <p className="my-4 text-4xl font-semibold text-gray-900 dark:text-white">
            {lightHours?.toFixed(1)} Hrs
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentCard;
