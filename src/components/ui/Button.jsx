const variants = {
  primary:
    "border border-transparent bg-emerald-800 text-white hover:bg-emerald-900 focus-visible:outline-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500",
  secondary:
    "border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:outline-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  outline:
    "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800",
  danger:
    "border border-transparent bg-rose-700 text-white hover:bg-rose-800 focus-visible:outline-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500",
  ghost:
    "border border-transparent bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-500 dark:text-slate-200 dark:hover:bg-slate-800",
};

const sizes = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-11 px-5 text-sm",
};

export const Button = ({
  children,
  className = "",
  fullWidth = false,
  size = "md",
  variant = "primary",
  ...props
}) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${fullWidth ? "w-full" : ""} ${className}`}
    {...props}
  >
    {children}
  </button>
);
