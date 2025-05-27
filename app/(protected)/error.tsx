"use client";
import React from "react";

type ErrorProps = {
  message?: string;
  onRetry?: () => void;
};

const ErrorComponent: React.FC<ErrorProps> = ({
  message = "Something went wrong.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center text-red-600">
      <h1 className="text-2xl font-semibold mb-2">Error</h1>
      <p className="mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorComponent;
