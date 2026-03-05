"use client";

/**
 * Search results: client-side filtering from URL params. Page is static shell; list is client-rendered.
 * Production: Replace MOCK_PROPERTIES with API fetch (e.g. GET /api/properties?mode=...&location=...)
 * or pass pre-filtered data from a lightweight server component.
 */
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useCallback, useState } from "react";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchSummaryBar } from "@/components/search/SearchSummaryBar";
import { PropertyList } from "@/components/properties/PropertyList";
import { MOCK_PROPERTIES } from "@/lib/mockData";
import { filterProperties, type FilterParams, type SortOption } from "@/lib/filters";
import { getSavedPropertyIds } from "@/lib/savedProperties";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const params: FilterParams = useMemo(() => {
    const budgetMin = searchParams.get("budgetMin");
    const budgetMax = searchParams.get("budgetMax");
    return {
      mode: searchParams.get("mode") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      propertyType: searchParams.get("propertyType") ?? undefined,
      budgetMin: budgetMin ? parseInt(budgetMin, 10) : undefined,
      budgetMax: budgetMax ? parseInt(budgetMax, 10) : undefined,
      bhk: searchParams.get("bhk") ?? undefined,
      furnishing: searchParams.get("furnishing") ?? undefined,
      sort: (searchParams.get("sort") as SortOption) ?? "relevance",
    };
  }, [searchParams]);

  const sort = params.sort ?? "relevance";

  const updateSort = useCallback(
    (newSort: SortOption) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("sort", newSort);
      router.replace(`/search?${next.toString()}`);
    },
    [router, searchParams]
  );

  const filtered = useMemo(
    () => filterProperties(MOCK_PROPERTIES, params),
    [params]
  );

  // Re-read localStorage when user toggles save (savedIds state updates)
  const saved = useMemo(() => {
    if (typeof window === "undefined") return [];
    return getSavedPropertyIds();
  }, [savedIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveChange = useCallback(() => {
    setSavedIds(getSavedPropertyIds());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <SearchFilters />
        <div className="flex-1 min-w-0">
          <SearchSummaryBar count={filtered.length} sort={sort} onSortChange={updateSort} />
          <div className="py-6">
            <PropertyList
              properties={filtered}
              savedIds={saved}
              onSaveChange={handleSaveChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
