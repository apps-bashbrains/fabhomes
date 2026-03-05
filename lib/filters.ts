/**
 * Pure filter/sort utilities for property lists. Safe to run on server or client.
 * Production: Consider moving filtering to server/API (e.g. query params → API → filtered JSON).
 */
import type { Property } from "./types";

export type SortOption = "relevance" | "newest" | "price_asc" | "price_desc";

export interface FilterParams {
  mode?: string;
  location?: string;
  propertyType?: string;
  budgetMin?: number;
  budgetMax?: number;
  bhk?: string;
  furnishing?: string;
  sort?: SortOption;
}

export function filterProperties(
  properties: Property[],
  params: FilterParams
): Property[] {
  let result = [...properties];

  if (params.mode) {
    result = result.filter((p) => p.mode === params.mode);
  }
  if (params.location?.trim()) {
    const loc = params.location.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.location.toLowerCase().includes(loc) ||
        p.city.toLowerCase().includes(loc)
    );
  }
  if (params.propertyType) {
    result = result.filter((p) => p.propertyType === params.propertyType);
  }
  if (params.budgetMin != null && params.budgetMin > 0) {
    result = result.filter((p) => p.price >= params.budgetMin!);
  }
  if (params.budgetMax != null && params.budgetMax > 0) {
    result = result.filter((p) => p.price <= params.budgetMax!);
  }
  if (params.bhk) {
    const bhkNum = params.bhk === "4+" ? 4 : parseInt(params.bhk, 10);
    if (!isNaN(bhkNum)) {
      result = result.filter(
        (p) => p.bhk != null && (params.bhk === "4+" ? p.bhk >= 4 : p.bhk === bhkNum)
      );
    }
  }
  if (params.furnishing) {
    result = result.filter((p) => p.furnishing === params.furnishing);
  }

  switch (params.sort) {
    case "newest":
      result = sortByNewest(result);
      break;
    case "price_asc":
      result = sortByPrice(result, "asc");
      break;
    case "price_desc":
      result = sortByPrice(result, "desc");
      break;
    default:
      // relevance: keep current order or by newest as fallback
      result = sortByNewest(result);
  }

  return result;
}

function sortByNewest(properties: Property[]): Property[] {
  return [...properties].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
}

function sortByPrice(properties: Property[], order: "asc" | "desc"): Property[] {
  return [...properties].sort((a, b) =>
    order === "asc" ? a.price - b.price : b.price - a.price
  );
}

export function parseBudgetRange(
  value: string
): { min?: number; max?: number } | null {
  if (!value) return null;
  if (value.endsWith("+")) {
    const min = parseInt(value.replace(/\D/g, ""), 10);
    return isNaN(min) ? null : { min };
  }
  const [minStr, maxStr] = value.split("-").map((s) => s.trim());
  const min = minStr ? parseInt(minStr.replace(/\D/g, ""), 10) : undefined;
  const max = maxStr ? parseInt(maxStr.replace(/\D/g, ""), 10) : undefined;
  if (min !== undefined && isNaN(min)) return null;
  if (max !== undefined && isNaN(max)) return null;
  return { min, max };
}
