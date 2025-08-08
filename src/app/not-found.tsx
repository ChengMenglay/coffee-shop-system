import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Number */}
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800 mb-4">
          404
        </h1>

        {/* Main message */}
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
          Page not found
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md">
          Sorry, we couldn't find the page you're looking for.
        </p>

        {/* Back to home button */}
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
