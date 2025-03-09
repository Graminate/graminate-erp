"use client";

import React from "react";

interface ScheduleCardProps {
  title: string;
  description: string;
  imageSrc: string;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  title,
  description,
  imageSrc,
}) => {
  return (
    <div className="border rounded-lg p-6 flex flex-col items-center text-center max-w-sm mx-auto">
      <img src={imageSrc} alt={title} className="w-20 h-20 mb-4 rounded-full" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default ScheduleCard;
