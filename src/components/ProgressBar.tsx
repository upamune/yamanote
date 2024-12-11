import React from 'react';

interface ProgressBarProps {
  total: number;
  completed: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ total, completed }) => {
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="w-full bg-gray-200 rounded-full h-8 relative">
      <div
        className="bg-blue-500 h-full rounded-full transition-all duration-500 relative"
        style={{ width: `${Math.max(percentage, 4)}%` }}
      >
        <div className="absolute inset-0 flex items-center justify-center w-full">
          <span className="text-sm font-bold text-white px-2 py-1 drop-shadow-md">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};