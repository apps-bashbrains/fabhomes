"use client";

interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

interface ToggleGroupProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
  className?: string;
}

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  name = "toggle",
  className = "",
}: ToggleGroupProps<T>) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="group" aria-label={name}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${value === opt.value
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
