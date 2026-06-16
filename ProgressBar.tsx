import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 1
  label?: string;
  animate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, animate = true }) => {
  const percentage = Math.min(Math.max(Math.round(progress * 100), 0), 100);
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1 text-sm font-medium text-gray-300">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500 ease-out ${animate && percentage < 100 ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
