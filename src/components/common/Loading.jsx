import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex justify-center items-center p-4">
      <Loader2 className={`${sizeClasses[size]} text-primary-500 animate-spin`} />
    </div>
  );
};

const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 bg-gray-50/50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="text-lg font-medium text-gray-700 loading-dots">Loading</p>
      </div>
    </div>
  );
};

export const withSuspense = (Component) => (props) => (
  <Suspense fallback={<FullPageLoader />}>
    <Component {...props} />
  </Suspense>
);

export default LoadingSpinner;
