"use client";

import { useMemo } from "react";
import type { Property } from "@/lib/types";
import { PropertyCard } from "./PropertyCard";
import { getSavedPropertyIds } from "@/lib/savedProperties";

interface PropertyListProps {
  properties: Property[];
  savedIds?: string[];
  onSaveChange?: () => void;
}

export function PropertyList({ properties, savedIds, onSaveChange }: PropertyListProps) {
  const savedSet = useMemo(() => {
    const ids = savedIds ?? (typeof window !== "undefined" ? getSavedPropertyIds() : []);
    return new Set(ids);
  }, [savedIds]);

  if (!properties.length) {
    return (
      <div className="text-center py-12 text-gray-600">
        No properties match your filters. Try adjusting your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          saved={savedSet.has(property.id)}
          onSaveToggle={onSaveChange}
        />
      ))}
    </div>
  );
}
