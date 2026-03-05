import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", id, ...rest }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s/g, "-") : undefined);
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          {...rest}
        />
        {label && (
          <label htmlFor={inputId} className="text-sm text-gray-700 cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
