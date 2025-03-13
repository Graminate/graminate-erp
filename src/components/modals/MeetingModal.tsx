import React from "react";
import ScheduleCard from "@/components/cards/ScheduleCard";

type Props = {
  onClose: () => void;
};

const MeetingModal = ({ onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-full max-h-full overflow-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Choose Meeting Type
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
            aria-label="Close Modal"
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
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Meeting Options */}
        <div className="flex gap-4">
          <ScheduleCard
            title="One-on-One"
            description="Contacts can schedule a meeting with a single person on your team."
            imageSrc="/images/one-to-one.svg"
          />
          <ScheduleCard
            title="Group"
            description="Contacts can schedule a meeting with multiple people on your team."
            imageSrc="/images/group.svg"
          />
        </div>
      </div>
    </div>
  );
};

export default MeetingModal;
