import { useId } from "react";

export const Input = ({
  className = "",
  error,
  hint,
  id,
  label,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const description = error || hint;

  return (
    <div className="grid gap-1.5">
      {label && (
        <label
          className="text-sm font-semibold text-slate-700 dark:text-slate-200"
          htmlFor={inputId}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        aria-describedby={
          [description ? descriptionId : null, props["aria-describedby"]]
            .filter(Boolean)
            .join(" ") || undefined
        }
        aria-invalid={error ? true : props["aria-invalid"]}
        className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 ${
          error
            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500"
            : "border-slate-300 focus:border-emerald-700 focus:ring-emerald-700/15 dark:border-slate-700 dark:focus:border-emerald-400"
        } ${className}`}
        id={inputId}
      />
      {description && (
        <p
          className={`text-xs ${error ? "text-rose-700 dark:text-rose-300" : "text-slate-500 dark:text-slate-400"}`}
          id={descriptionId}
        >
          {description}
        </p>
      )}
    </div>
  );
};
