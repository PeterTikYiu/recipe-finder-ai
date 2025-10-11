import React from 'react';
import { cn } from '../../utils/helpers';

const SkeletonElement = ({ className }) => (
  <div className={cn("bg-gray-200 rounded animate-pulse", className)} />
);

const RecipeCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="w-full h-48 bg-gray-200 animate-pulse" />
      <div className="p-4">
        <SkeletonElement className="h-6 w-3/4 mb-3" />
        <SkeletonElement className="h-4 w-1/2 mb-4" />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SkeletonElement className="h-5 w-12" />
            <SkeletonElement className="h-5 w-12" />
          </div>
          <SkeletonElement className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default RecipeCardSkeleton;
