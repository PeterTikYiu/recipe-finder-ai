import React from 'react';
import { cn } from '../../utils/helpers';

const SkeletonElement = ({ className }) => (
  <div className={cn("bg-gray-200 rounded animate-pulse", className)} />
);

const NutritionSkeleton = () => {
  return (
    <div className="mt-8 w-full">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <SkeletonElement className="h-7 w-1/2 mb-4" />
        <SkeletonElement className="h-4 w-full mb-2" />
        <SkeletonElement className="h-4 w-3/4 mb-6" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <SkeletonElement className="h-5 w-3/4 mb-2" />
            <SkeletonElement className="h-8 w-1/2" />
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <SkeletonElement className="h-5 w-3/4 mb-2" />
            <SkeletonElement className="h-8 w-1/2" />
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <SkeletonElement className="h-5 w-3/4 mb-2" />
            <SkeletonElement className="h-8 w-1/2" />
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <SkeletonElement className="h-5 w-3/4 mb-2" />
            <SkeletonElement className="h-8 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionSkeleton;
