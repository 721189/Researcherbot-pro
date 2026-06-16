import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'circle';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ variant = 'text', className = '' }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text': return 'h-4 w-full rounded';
      case 'card': return 'h-32 w-full rounded-xl';
      case 'circle': return 'h-12 w-12 rounded-full';
    }
  };

  return (
    <div className={`animate-shimmer ${getVariantClasses()} ${className}`}></div>
  );
};
