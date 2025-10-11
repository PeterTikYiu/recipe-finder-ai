import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full animate-in">
      <AlertTriangle className="h-24 w-24 text-primary-400 mb-6" />
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-2xl font-medium text-gray-600 mt-2">Page Not Found</p>
      <p className="text-gray-500 mt-4 max-w-md">
        Sorry, the page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Link to="/" className="btn-primary mt-8">
        Go Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
