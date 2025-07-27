import { SearchX } from "lucide-react";
import React from "react";

function NoResult({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <SearchX className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md">{description}</p>
    </div>
  );
}

export default NoResult;
