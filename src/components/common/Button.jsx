export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  loading = false,
}) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all \
    focus:outline-none focus:ring-2 focus:ring-offset-2 \
    focus:ring-offset-white dark:focus:ring-offset-gray-900 \
    disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",

    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 \
       dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",

    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",

    ghost:
      "text-gray-600 hover:bg-gray-100 focus:ring-gray-400 \
       dark:text-gray-300 dark:hover:bg-gray-800",

    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400 \
       dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
    </button>
  );
}
