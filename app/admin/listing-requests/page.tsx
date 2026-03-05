"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ListingRequest = {
  id: string;
  mode: string;
  propertyType: string;
  title: string | null;
  city: string;
  locationText: string;
  price: number | string;
  status: string;
  createdAt: string;
  user: { name: string | null; phone: string };
  images: { url: string }[];
};

export default function AdminListingRequestsPage() {
  const [items, setItems] = useState<ListingRequest[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/listing-requests?${params}`)
      .then((r) => r.json())
      .then((data: { items: ListingRequest[]; nextCursor: string | null }) => {
        setItems(data.items);
        setNextCursor(data.nextCursor);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Listing Requests</h1>
      <div className="mb-4 flex gap-4 items-center">
        <label className="text-sm text-gray-600">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">All</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="PUBLISHED">PUBLISHED</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="table-scroll-wrap">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">User / Contact</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type / City</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Price</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-sm">
                    <span className="text-gray-900">{r.user.name ?? "—"}</span>
                    <br />
                    <span className="text-gray-600">{r.user.phone}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">{r.propertyType} / {r.city}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{typeof r.price === "string" ? r.price : String(r.price)}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{r.status}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{r.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-2 text-sm">
                    <Link href={`/admin/listing-requests/${r.id}`} className="text-primary hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
      {nextCursor && (
        <button
          type="button"
          onClick={() => fetch(`/api/admin/listing-requests?cursor=${nextCursor}&status=${statusFilter}`).then(r => r.json()).then(d => { setItems(prev => [...prev, ...d.items]); setNextCursor(d.nextCursor); })}
          className="mt-4 text-primary hover:underline"
        >
          Load more
        </button>
      )}
    </div>
  );
}
