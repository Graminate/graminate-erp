import React from "react";
import type { ScheduleCard } from "@/types/card-props";

const ScheduleCard = ({ title, description, imageSrc }: ScheduleCard) => {
  return (
    <div className="border rounded-lg p-6 flex flex-col items-center text-center max-w-sm mx-auto">
      <img src={imageSrc} alt={title} className="w-20 h-20 mb-4 rounded-full" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default ScheduleCard;
