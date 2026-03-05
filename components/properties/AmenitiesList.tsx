import type { Amenity } from "@/lib/types";

const AMENITY_LABELS: Record<Amenity, string> = {
  lift: "Lift",
  parking: "Parking",
  security: "Security",
  power_backup: "Power Backup",
  clubhouse: "Clubhouse",
  gym: "Gym",
  park: "Park",
};

interface AmenitiesListProps {
  amenities: Amenity[];
  className?: string;
}

export function AmenitiesList({ amenities, className = "" }: AmenitiesListProps) {
  if (!amenities.length) return null;
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
      <ul className="flex flex-wrap gap-2">
        {amenities.map((a) => (
          <li
            key={a}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700"
          >
            <span className="text-primary">✓</span>
            {AMENITY_LABELS[a]}
          </li>
        ))}
      </ul>
    </div>
  );
}
