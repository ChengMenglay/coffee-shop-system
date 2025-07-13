"use client";
import React from "react";
import { Lock, ArrowLeft } from "lucide-react";

const UnauthorizedPage = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-orange-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Access Restricted
        </h1>

        {/* Simple Message */}
        <p className="text-gray-600 mb-8">
          You don't have permission to view this page.
        </p>

        {/* Single Action */}
        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
