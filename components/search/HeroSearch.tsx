"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToggleGroup } from "@/components/common/ToggleGroup";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import type { PropertyMode, PropertyType } from "@/lib/types";
import { parseBudgetRange } from "@/lib/filters";

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

const BUDGET_OPTIONS = [
  { value: "", label: "Any Budget" },
  { value: "0-2500000", label: "Up to ₹25 Lakh" },
  { value: "2500000-5000000", label: "₹25-50 Lakh" },
  { value: "5000000-10000000", label: "₹50 Lakh - 1 Cr" },
  { value: "10000000+", label: "Above ₹1 Cr" },
];

export function HeroSearch() {
  const router = useRouter();
  const [mode, setMode] = useState<PropertyMode>("buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("mode", mode);
    if (location.trim()) params.set("location", location.trim());
    if (propertyType) params.set("propertyType", propertyType);
    const range = parseBudgetRange(budget);
    if (range?.min != null) params.set("budgetMin", String(range.min));
    if (range?.max != null) params.set("budgetMax", String(range.max));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6 space-y-4">
        <ToggleGroup
          options={MODE_OPTIONS}
          value={mode}
          onChange={setMode}
          name="mode"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="text"
            placeholder="Location (e.g. Noida, Sector 18)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Select
            options={PROPERTY_TYPE_OPTIONS}
            placeholder="Property Type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          />
          <Select
            options={BUDGET_OPTIONS}
            placeholder="Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
        <div className="flex justify-center pt-2">
          <Button type="submit" size="lg">
            Search Properties
          </Button>
        </div>
      </div>
    </form>
  );
}
