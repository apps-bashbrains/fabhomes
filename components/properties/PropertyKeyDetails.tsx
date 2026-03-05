import type { Property } from "@/lib/types";
import { formatPropertyType, formatFurnishing } from "@/lib/utils";

interface PropertyKeyDetailsProps {
  property: Property;
}

const detailItem = (label: string, value: string | null | undefined) => {
  if (value == null || value === "") return null;
  return { label, value };
};

export function PropertyKeyDetails({ property }: PropertyKeyDetailsProps) {
  const items = [
    detailItem("Configuration", property.bhk != null ? `${property.bhk} BHK` : null),
    detailItem("Area", property.areaSqFt != null ? `${property.areaSqFt} sq.ft` : null),
    detailItem("Floor", property.floorInfo),
    detailItem("Furnishing", formatFurnishing(property.furnishing)),
    detailItem("Property Type", formatPropertyType(property.propertyType)),
    detailItem("Listed by", property.listedBy === "owner" ? "Owner" : "Agent"),
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col">
          <span className="text-sm text-gray-500">{label}</span>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ))}
    </div>
  );
}
