// components/common/LoadingSpinner.jsx
"use client";
import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4">Loading package details...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
