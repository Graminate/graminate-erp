import {
  faSyringe,
  faCalendarCheck,
  faHeartbeat,
  faClipboard,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type VeterinaryCardProps = {
  mortalityRate: number | null;
  vaccineStatus: "Vaccinated" | "Unvaccinated" | "N/A";
  nextVisit: string;
  userId: string;
};

type VetStatItemProps = {
  icon: IconDefinition;
  value: string | React.ReactNode;
  label: string;
  valueClassName?: string;
};

const getVaccineStatusStyles = (
  status: "Vaccinated" | "Unvaccinated" | "N/A"
) => {
  switch (status) {
    case "Vaccinated":
      return "bg-green-200 text-light";
    case "Unvaccinated":
      return "bg-red-200 text-light";
    case "N/A":
    default:
      return "text-dark dark:text-light";
  }
};

const VetStatItem = ({
  icon,
  value,
  label,
  valueClassName = "text-2xl font-semibold text-gray-900 dark:text-white",
}: VetStatItemProps) => (
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
  mortalityRate,
  vaccineStatus,
  nextVisit,
}: VeterinaryCardProps) => {
  const router = useRouter();
  const { user_id } = router.query;
  const mortalityColorClass =
    mortalityRate === null
      ? "text-dark dark:text-light"
      : mortalityRate > 0.5
      ? "text-red-600 dark:text-red-400"
      : "text-green-600 dark:text-green-400";

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 text-center sm:text-left">
        Veterinary Data{" "}
        <span className="text-sm font-light">(Acc. to last vet. visit)</span>
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <VetStatItem
          icon={faHeartbeat}
          value={
            mortalityRate !== null ? `${mortalityRate.toFixed(2)}%` : "N/A"
          }
          label="Mortality (Last Recorded)"
          valueClassName={` font-semibold ${mortalityColorClass}`}
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
        <VetStatItem
          icon={faCalendarCheck}
          value={nextVisit}
          label="Next Appointment"
          valueClassName="text-sm font-semibold text-gray-900 dark:text-white"
        />
        <Link href={`/platform/${user_id}/poultry_health`}>
          <VetStatItem
            icon={faClipboard}
            value={"Open Poultry"}
            label="Health Records"
            valueClassName="text-sm font-semibold"
          />
        </Link>
      </div>
    </div>
  );
};

export default VeterinaryCard;
