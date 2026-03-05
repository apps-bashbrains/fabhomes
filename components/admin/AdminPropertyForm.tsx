"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { Checkbox } from "@/components/common/Checkbox";
import type { Amenity } from "@prisma/client";

const MODE_OPTIONS = [
  { value: "BUY", label: "Buy" },
  { value: "RENT", label: "Rent" },
  { value: "COMMERCIAL", label: "Commercial" },
];
const TYPE_OPTIONS = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE_VILLA", label: "House/Villa" },
  { value: "PLOT", label: "Plot" },
  { value: "COMMERCIAL_OFFICE", label: "Commercial Office" },
  { value: "SHOP", label: "Shop" },
];
const FURNISHING_OPTIONS = [
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "SEMI_FURNISHED", label: "Semi-Furnished" },
  { value: "FURNISHED", label: "Furnished" },
];
const LISTED_BY_OPTIONS = [
  { value: "OWNER", label: "Owner" },
  { value: "AGENT", label: "Agent" },
];
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ARCHIVED", label: "Archived" },
];

interface AdminPropertyFormProps {
  amenities: Amenity[];
  initial?: Record<string, unknown>;
  propertyId?: string;
}

export function AdminPropertyForm({ amenities, initial, propertyId }: AdminPropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState((initial?.mode as string) ?? "BUY");
  const [propertyType, setPropertyType] = useState((initial?.propertyType as string) ?? "APARTMENT");
  const [title, setTitle] = useState((initial?.title as string) ?? "");
  const [description, setDescription] = useState((initial?.description as string) ?? "");
  const [locationText, setLocationText] = useState((initial?.locationText as string) ?? "");
  const [city, setCity] = useState((initial?.city as string) ?? "");
  const [state, setState] = useState((initial?.state as string) ?? "");
  const [price, setPrice] = useState(String((initial?.price as number) ?? ""));
  const [currency, setCurrency] = useState((initial?.currency as string) ?? "INR");
  const [bhk, setBhk] = useState(
    (initial?.bhk as number) != null ? String(initial?.bhk) : ""
  );
  const [areaSqFt, setAreaSqFt] = useState(
    (initial?.areaSqFt as number) != null ? String(initial?.areaSqFt) : ""
  );
  const [floorInfo, setFloorInfo] = useState((initial?.floorInfo as string) ?? "");
  const [furnishing, setFurnishing] = useState((initial?.furnishing as string) ?? "UNFURNISHED");
  const [listedBy, setListedBy] = useState((initial?.listedBy as string) ?? "OWNER");
  const [listingContactName, setListingContactName] = useState((initial?.listingContactName as string) ?? "");
  const [listingContactPhone, setListingContactPhone] = useState((initial?.listingContactPhone as string) ?? "");
  const [listingContactEmail, setListingContactEmail] = useState((initial?.listingContactEmail as string) ?? "");
  const [status, setStatus] = useState((initial?.status as string) ?? "DRAFT");
  const [isActive, setIsActive] = useState((initial?.isActive as boolean) ?? true);
  const [isFeatured, setIsFeatured] = useState((initial?.isFeatured as boolean) ?? false);
  const [isNew, setIsNew] = useState((initial?.isNew as boolean) ?? false);
  const [amenityIds, setAmenityIds] = useState<string[]>(
    Array.isArray(initial?.amenities) ? (initial.amenities as { amenityId: string }[]).map((a) => a.amenityId) : []
  );

  const toggleAmenity = (id: string) => {
    setAmenityIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  async function handleSubmit(e: React.FormEvent, submitStatus?: string) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = {
      mode,
      propertyType,
      title,
      description,
      locationText,
      city,
      state: state || null,
      price: parseInt(price, 10) || 0,
      currency,
      bhk: bhk ? parseInt(bhk, 10) : null,
      areaSqFt: areaSqFt ? parseInt(areaSqFt, 10) : null,
      floorInfo: floorInfo || null,
      furnishing,
      listedBy,
      listingContactName: listingContactName || null,
      listingContactPhone: listingContactPhone || null,
      listingContactEmail: listingContactEmail || null,
      status: submitStatus ?? status,
      isActive,
      isFeatured,
      isNew,
      amenityIds,
    };

    try {
      const url = propertyId ? `/api/admin/properties/${propertyId}` : "/api/admin/properties";
      const method = propertyId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        setLoading(false);
        return;
      }
      router.push("/admin/properties");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Mode" options={MODE_OPTIONS} value={mode} onChange={(e) => setMode(e.target.value)} />
        <Select label="Property type" options={TYPE_OPTIONS} value={propertyType} onChange={(e) => setPropertyType(e.target.value)} />
      </div>
      <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="Location text" required value={locationText} onChange={(e) => setLocationText(e.target.value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="City" required value={city} onChange={(e) => setCity(e.target.value)} />
        <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Price" type="number" required value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="BHK" type="number" value={bhk} onChange={(e) => setBhk(e.target.value)} />
        <Input label="Area (sq ft)" type="number" value={areaSqFt} onChange={(e) => setAreaSqFt(e.target.value)} />
        <Input label="Floor info" value={floorInfo} onChange={(e) => setFloorInfo(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Furnishing" options={FURNISHING_OPTIONS} value={furnishing} onChange={(e) => setFurnishing(e.target.value)} />
        <Select label="Listed by" options={LISTED_BY_OPTIONS} value={listedBy} onChange={(e) => setListedBy(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Contact name" value={listingContactName} onChange={(e) => setListingContactName(e.target.value)} />
        <Input label="Contact phone" value={listingContactPhone} onChange={(e) => setListingContactPhone(e.target.value)} />
        <Input label="Contact email" type="email" value={listingContactEmail} onChange={(e) => setListingContactEmail(e.target.value)} />
      </div>
      <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
      <div className="flex gap-4">
        <Checkbox label="Active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <Checkbox label="Featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
        <Checkbox label="New badge" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => (
            <Checkbox
              key={a.id}
              label={a.label}
              checked={amenityIds.includes(a.id)}
              onChange={() => toggleAmenity(a.id)}
            />
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{propertyId ? "Update" : "Create"}</Button>
        {!propertyId && (
          <Button type="button" variant="outline" disabled={loading} onClick={(e) => handleSubmit(e, "PENDING_REVIEW")}>
            Save & submit for review
          </Button>
        )}
      </div>
    </form>
  );
}
