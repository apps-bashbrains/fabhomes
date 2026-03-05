import type { PropertyBadge } from "@/lib/types";

const BADGE_STYLES: Record<PropertyBadge, string> = {
  verified: "bg-green-100 text-green-800",
  new: "bg-blue-100 text-blue-800",
  owner: "bg-amber-100 text-amber-800",
  agent: "bg-purple-100 text-purple-800",
};

const BADGE_LABELS: Record<PropertyBadge, string> = {
  verified: "Verified",
  new: "New",
  owner: "Owner",
  agent: "Agent",
};

interface PropertyBadgesProps {
  badges: PropertyBadge[];
  className?: string;
}

export function PropertyBadges({ badges, className = "" }: PropertyBadgesProps) {
  if (!badges.length) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map((badge) => (
        <span
          key={badge}
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[badge]}`}
        >
          {BADGE_LABELS[badge]}
        </span>
      ))}
    </div>
  );
}
