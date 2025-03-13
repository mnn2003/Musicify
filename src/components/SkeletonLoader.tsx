import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-800 rounded-lg aspect-square"></div>
      <div className="mt-2 h-4 bg-gray-800 rounded w-3/4"></div>
      <div className="mt-1 h-4 bg-gray-800 rounded w-1/2"></div>
    </div>
  );
};

export default SkeletonLoader;
