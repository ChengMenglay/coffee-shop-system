export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-black flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>

        {/* Loading text */}
        <div className="mt-6">
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}
