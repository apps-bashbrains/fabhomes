import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "./Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  actionLabel,
  actionHref = "/",
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center py-12 px-4
        bg-gray-50 rounded-xl border border-gray-200
        ${className}
      `}
    >
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-sm md:text-base text-gray-600 max-w-md mb-6">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
