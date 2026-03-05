"use client";

import { useSearchParams } from "next/navigation";
import { Select } from "@/components/common/Select";
import type { SortOption } from "@/lib/filters";

const MODE_LABELS: Record<string, string> = {
  buy: "Sale",
  rent: "Rent",
  commercial: "Commercial",
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

interface SearchSummaryBarProps {
  count: number;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function SearchSummaryBar({ count, sort, onSortChange }: SearchSummaryBarProps) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "buy";
  const location = searchParams.get("location") || "";
  const modeLabel = MODE_LABELS[mode] ?? "properties";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-gray-200">
      <p className="text-sm md:text-base text-gray-700">
        <span className="font-semibold text-gray-900">{count}</span> properties
        {location ? ` in ${location}` : " in selected areas"} for {modeLabel}
      </p>
      <div className="w-full sm:w-48">
        <Select
          options={SORT_OPTIONS}
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        />
      </div>
    </div>
  );
}
