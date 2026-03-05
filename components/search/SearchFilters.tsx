"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { ToggleGroup } from "@/components/common/ToggleGroup";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import type { PropertyMode, PropertyType, FurnishingType } from "@/lib/types";

const MODE_OPTIONS: { value: PropertyMode; label: string }[] = [
  { value: "buy", label: "Buy" },
  { value: "rent", label: "Rent" },
  { value: "commercial", label: "Commercial" },
];

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "house_villa", label: "Villa" },
  { value: "plot", label: "Plot" },
  { value: "commercial_office", label: "Commercial Office" },
  { value: "shop", label: "Shop" },
];

const FURNISHING_OPTIONS: { value: FurnishingType; label: string }[] = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi_furnished", label: "Semi-Furnished" },
  { value: "furnished", label: "Furnished" },
];

const BHK_OPTIONS = ["1", "2", "3", "4+"];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mode = (searchParams.get("mode") as PropertyMode) || "buy";
  const location = searchParams.get("location") || "";
  const propertyType = searchParams.get("propertyType") || "";
  const budgetMin = searchParams.get("budgetMin") || "";
  const budgetMax = searchParams.get("budgetMax") || "";
  const bhk = searchParams.get("bhk") || "";
  const furnishing = searchParams.get("furnishing") || "";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      router.push(`/search?${next.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = () => {
    router.push("/search");
  };

  const filtersContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
        <ToggleGroup options={MODE_OPTIONS} value={mode} onChange={(v) => updateParams({ mode: v })} name="mode" />
      </div>
      <Input
        label="Location"
        placeholder="City or area"
        value={location}
        onChange={(e) => updateParams({ location: e.target.value })}
      />
      <Select
        label="Property Type"
        options={PROPERTY_TYPE_OPTIONS}
        placeholder="Any"
        value={propertyType}
        onChange={(e) => updateParams({ propertyType: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Min Price (₹)"
          type="number"
          placeholder="Min"
          value={budgetMin}
          onChange={(e) => updateParams({ budgetMin: e.target.value })}
        />
        <Input
          label="Max Price (₹)"
          type="number"
          placeholder="Max"
          value={budgetMax}
          onChange={(e) => updateParams({ budgetMax: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => updateParams({ bhk: bhk === b ? "" : b })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                bhk === b ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      <Select
        label="Furnishing"
        options={FURNISHING_OPTIONS}
        placeholder="Any"
        value={furnishing}
        onChange={(e) => updateParams({ furnishing: e.target.value })}
      />
      <Button variant="outline" size="sm" onClick={clearAll} className="w-full">
        Clear All
      </Button>
    </div>
  );

  return (
    <div className="md:w-64 flex-shrink-0">
      <button
        type="button"
        className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium mb-4"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        Filters {mobileOpen ? "▲" : "▼"}
      </button>
      {mobileOpen && (
        <div className="md:hidden p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
          {filtersContent}
        </div>
      )}
      <div className="hidden md:block sticky top-24 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
        {filtersContent}
      </div>
    </div>
  );
}
