"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Property } from "@/lib/types";
import { PropertyBadges } from "./PropertyBadges";
import { formatPrice, formatPropertyType } from "@/lib/utils";
import { saveProperty, removeSavedProperty } from "@/lib/savedProperties";
import { Button } from "@/components/common/Button";

interface PropertyCardProps {
  property: Property;
  saved?: boolean;
  onSaveToggle?: () => void;
}

export function PropertyCard({ property, saved: initialSaved, onSaveToggle }: PropertyCardProps) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(initialSaved ?? false);

  useEffect(() => {
    setSaved(initialSaved ?? false);
  }, [initialSaved]);

  const toggleSaved = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newSaved = !saved;
    if (session?.user) {
      try {
        const res = await fetch("/api/wishlist/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId: property.id }),
        });
        if (res.ok) {
          const data = await res.json();
          setSaved(data.added);
          onSaveToggle?.();
        }
      } catch {
        // keep state
      }
    } else {
      setSaved(newSaved);
      if (newSaved) saveProperty(property.id);
      else removeSavedProperty(property.id);
      onSaveToggle?.();
    }
  };

  const specParts = [];
  if (property.bhk != null) specParts.push(`${property.bhk} BHK`);
  if (property.areaSqFt != null) specParts.push(`${property.areaSqFt} sq.ft`);
  specParts.push(formatPropertyType(property.propertyType));

  const propertyHref = `/property/${property.id}`;

  return (
    <article className="rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/3] bg-gray-100">
        <Link href={propertyHref} className="absolute inset-0 z-0">
          <Image
            src={property.mainImageUrl}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </Link>
        <button
          type="button"
          onClick={toggleSaved}
          className="absolute top-2 right-2 z-10 p-2.5 min-h-[44px] min-w-[44px] rounded-full bg-white/90 shadow hover:bg-white flex items-center justify-center"
          aria-label={saved ? "Remove from saved" : "Save property"}
        >
          <svg
            className={`w-5 h-5 ${saved ? "text-red-500 fill-current" : "text-gray-600"}`}
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <PropertyBadges badges={property.badges} className="mb-2" />
        <Link href={propertyHref} className="block group">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary">{property.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{property.location}</p>
          <p className="text-lg sm:text-xl font-bold text-primary mt-2">{formatPrice(property.price, property.currency)}</p>
          <p className="text-sm text-gray-500 mt-1">{specParts.join(" • ")}</p>
        </Link>
        <div className="mt-4 flex gap-2">
          <Link href={propertyHref}>
            <Button variant="primary" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
