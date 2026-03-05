"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

export default function ListPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"BUY" | "RENT" | "COMMERCIAL">("BUY");
  const [propertyType, setPropertyType] = useState("APARTMENT");
  const [title, setTitle] = useState("");
  const [locationText, setLocationText] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [bhk, setBhk] = useState("");
  const [areaSqFt, setAreaSqFt] = useState("");
  const [furnishing, setFurnishing] = useState("UNFURNISHED");
  const [description, setDescription] = useState("");

  if (status === "loading") {
    return <div className="max-w-lg mx-auto px-4 py-12">Loading...</div>;
  }

  if (!session?.user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">List your property</h1>
        <p className="text-gray-600 mb-6">Please log in to submit a listing request.</p>
        <Link href="/login?callbackUrl=/list-property">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/listing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          propertyType,
          title: title.trim() || null,
          locationText: locationText.trim(),
          city: city.trim(),
          price: parseInt(price, 10) || 0,
          bhk: bhk ? parseInt(bhk, 10) : null,
          areaSqFt: areaSqFt ? parseInt(areaSqFt, 10) : null,
          furnishing,
          description: description.trim() || "",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to submit");
        setSubmitting(false);
        return;
      }
      router.push("/?listed=1");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">List your property</h1>
      <p className="text-sm text-gray-600 mb-6">Submit your property details. Our team will review and get in touch.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as "BUY" | "RENT" | "COMMERCIAL")} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="BUY">Buy</option>
            <option value="RENT">Rent</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property type</label>
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE_VILLA">House / Villa</option>
            <option value="PLOT">Plot</option>
            <option value="COMMERCIAL_OFFICE">Commercial Office</option>
            <option value="SHOP">Shop</option>
          </select>
        </div>
        <Input label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 2BHK in Sector 18" />
        <Input label="Location / Address" value={locationText} onChange={(e) => setLocationText(e.target.value)} required placeholder="Full address or area" />
        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
        <Input label="Expected price (INR)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="e.g. 7500000" />
        <Input label="BHK (optional)" type="number" value={bhk} onChange={(e) => setBhk(e.target.value)} placeholder="e.g. 2" />
        <Input label="Area sq.ft (optional)" type="number" value={areaSqFt} onChange={(e) => setAreaSqFt(e.target.value)} placeholder="e.g. 1200" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
          <select value={furnishing} onChange={(e) => setFurnishing(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="UNFURNISHED">Unfurnished</option>
            <option value="SEMI_FURNISHED">Semi-furnished</option>
            <option value="FURNISHED">Furnished</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Brief description" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Submitting..." : "Submit request"}</Button>
      </form>
    </div>
  );
}
