import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variants = {
  primary: "bg-primary text-white hover:bg-primary-hover border-transparent",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 border-transparent",
  outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary-light",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 border-transparent",
};

const sizes = {
  sm: "px-4 py-2 sm:py-1.5 text-sm min-h-[44px] sm:min-h-0",
  md: "px-6 py-2.5 sm:py-2 text-base min-h-[44px] sm:min-h-0",
  lg: "px-8 py-3 text-lg min-h-[48px] sm:min-h-0",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg border transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
}
