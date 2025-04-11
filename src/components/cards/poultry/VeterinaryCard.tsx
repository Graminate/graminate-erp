import {
  faSyringe,
  faCalendarCheck,
  faHeartbeat,
  faClipboard,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type VeterinaryCardProps = {
  mortalityRate24h: number | null;
  vaccineStatus: "Vaccinated" | "Pending" | "Over Due";
  nextVisit: string;
  userId: string;
};

const getVaccineStatusStyles = (
  status: "Vaccinated" | "Pending" | "Over Due"
) => {
  switch (status) {
    case "Vaccinated":
      return "bg-green-200 text-light";
    case "Pending":
      return "bg-yellow-200 text-dark";
    case "Over Due":
      return "bg-red-200 text-light";
    default:
      return "bg-gray-300 text-light";
  }
};

const VetStatItem = ({
  icon,
  value,
  label,
  valueClassName = "text-2xl font-semibold text-gray-900 dark:text-white",
}: {
  icon: any;
  value: string | React.ReactNode;
  label: string;
  valueClassName?: string;
}) => (
  <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-1 shadow-sm hover:shadow-md transition-shadow duration-200">
    <FontAwesomeIcon
      icon={icon}
      className="size-6 text-blue-200 dark:text-blue-400 mb-2"
      aria-hidden="true"
    />
    <p className={valueClassName} aria-label={`${label} value`}>
      {value}
    </p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </div>
);

const VeterinaryCard = ({
  mortalityRate24h,
  vaccineStatus,
  nextVisit,
}: VeterinaryCardProps) => {
  const router = useRouter();
  const { user_id } = router.query;
  const mortalityColorClass =
    mortalityRate24h === null
      ? "text-gray-400"
      : mortalityRate24h > 0.5
      ? "text-red-600 dark:text-red-400"
      : "text-green-600 dark:text-green-400";

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 text-center sm:text-left">
        Veterinary Data
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <VetStatItem
          icon={faHeartbeat}
          value={
            mortalityRate24h !== null
              ? `${mortalityRate24h.toFixed(2)}%`
              : "N/A"
          }
          label="Mortality (Last Recorded)"
          valueClassName={`text-2xl font-semibold ${mortalityColorClass}`}
        />
        <VetStatItem
          icon={faSyringe}
          value={
            <span
              className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getVaccineStatusStyles(
                vaccineStatus
              )}`}
            >
              {vaccineStatus}
            </span>
          }
          label="Vaccine Status"
          valueClassName="mt-2"
        />
        <Link href={`/platform/${user_id}/poultry_health`}>
          <VetStatItem
            icon={faCalendarCheck}
            value={nextVisit}
            label="Next Visit"
            valueClassName="text-sm font-semibold text-gray-900 dark:text-white"
          />
        </Link>
        <Link href={`/platform/${user_id}/poultry_health`}>
          <VetStatItem
            icon={faClipboard}
            value={"Poultry"}
            label="Health Records"
            valueClassName="text-sm font-semibold"
          />
        </Link>
      </div>
    </div>
  );
};

export default VeterinaryCard;
