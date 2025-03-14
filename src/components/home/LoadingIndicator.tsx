
import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="inline-block h-8 w-8 rounded-full border-4 border-t-purple-500 border-opacity-25 animate-spin"></div>
    </div>
  );
};

export default LoadingIndicator;
