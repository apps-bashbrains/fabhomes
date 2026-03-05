"use client";

/**
 * Saved properties: when logged in use DB (GET /api/wishlist); else localStorage + mock data.
 * On login, sync localStorage → DB via POST /api/wishlist/sync (done in LoginForm).
 */
import { useMemo, useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PropertyList } from "@/components/properties/PropertyList";
import { EmptyState } from "@/components/common/EmptyState";
import { MOCK_PROPERTIES } from "@/lib/mockData";
import { getSavedPropertyIds } from "@/lib/savedProperties";
import type { Property } from "@/lib/types";

type WishlistItem = {
  id: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    mode: string;
    propertyType: string;
    city: string;
    price: number | bigint;
    bhk: number | null;
    status: string;
    isActive: boolean;
    images: { url: string }[];
  };
};

function mapMode(m: string): "buy" | "rent" | "commercial" {
  if (m === "RENT") return "rent";
  if (m === "COMMERCIAL") return "commercial";
  return "buy";
}

function mapPropertyType(p: string): Property["propertyType"] {
  const map: Record<string, Property["propertyType"]> = {
    APARTMENT: "apartment",
    HOUSE_VILLA: "house_villa",
    PLOT: "plot",
    COMMERCIAL_OFFICE: "commercial_office",
    SHOP: "shop",
  };
  return map[p] ?? "apartment";
}

export default function SavedPage() {
  const { data: session, status } = useSession();
  const [refresh, setRefresh] = useState(0);
  const [dbItems, setDbItems] = useState<WishlistItem[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  const isLoggedIn = !!session?.user;

  useEffect(() => {
    if (!isLoggedIn) return;
    setDbLoading(true);
    fetch("/api/wishlist")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items: WishlistItem[] }) => data.items)
      .then(setDbItems)
      .finally(() => setDbLoading(false));
  }, [isLoggedIn, refresh]);

  const savedIds = useMemo(() => {
    if (isLoggedIn) return dbItems.map((i) => i.propertyId);
    return getSavedPropertyIds();
    // refresh: when user toggles save we need to re-read (localStorage when guest, or dbItems refetched in useEffect)
  }, [isLoggedIn, dbItems, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const properties: Property[] = useMemo(() => {
    if (isLoggedIn && dbItems.length > 0) {
      return dbItems.map((i) => {
        const p = i.property;
        const price = typeof p.price === "bigint" ? Number(p.price) : p.price;
        return {
          id: p.id,
          mode: mapMode(p.mode),
          title: p.title,
          location: p.city,
          city: p.city,
          price,
          currency: "INR",
          bhk: p.bhk,
          areaSqFt: null,
          propertyType: mapPropertyType(p.propertyType),
          furnishing: "unfurnished",
          listedBy: "owner",
          description: "",
          amenities: [],
          badges: [],
          mainImageUrl: p.images?.[0]?.url ?? "/placeholder-property.jpg",
          imageUrls: p.images?.map((im) => im.url) ?? [],
          createdAt: "",
        };
      });
    }
    return MOCK_PROPERTIES.filter((p) => savedIds.includes(p.id));
  }, [isLoggedIn, dbItems, savedIds]);

  const handleSaveChange = useCallback(() => {
    setRefresh((r) => r + 1);
  }, []);

  if (status === "loading" || (isLoggedIn && dbLoading && dbItems.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Saved Properties</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (savedIds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Saved Properties</h1>
        <EmptyState
          title="You haven't saved any properties yet."
          description={isLoggedIn ? "Browse properties and tap the heart to save your favourites." : "Log in to save properties to your account, or browse and save locally."}
          actionLabel="Browse Properties"
          actionHref="/search"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Saved Properties</h1>
      {isLoggedIn && <p className="text-sm text-gray-500 mb-4">Saved to your account.</p>}
      <PropertyList
        properties={properties}
        savedIds={savedIds}
        onSaveChange={handleSaveChange}
      />
    </div>
  );
}
