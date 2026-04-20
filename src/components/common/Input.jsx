export default function Input({
  label,
  error,
  type = "text",
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <input
        type={type}
        className={`w-full px-3 py-2 text-sm border rounded-lg transition
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          ${
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
          }
          focus:outline-none focus:ring-2
          ${className}`}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
