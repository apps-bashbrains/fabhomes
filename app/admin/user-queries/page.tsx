"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type UserQuery = {
  id: string;
  name: string | null;
  mobile: string;
  email: string | null;
  mode: string;
  city: string;
  locationText: string | null;
  message: string;
  status: string;
  budgetMin: number | null;
  budgetMax: number | null;
  bhk: number | null;
  createdAt: string;
  assignedToAdminUser: { id: string; name: string | null; phone: string } | null;
};

export default function AdminUserQueriesPage() {
  const [items, setItems] = useState<UserQuery[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/user-queries?${params}`)
      .then((r) => r.json())
      .then((data: { items: UserQuery[]; nextCursor: string | null }) => {
        setItems(data.items);
        setNextCursor(data.nextCursor);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">User Queries</h1>
      <div className="mb-4 flex gap-4 items-center">
        <label className="text-sm text-gray-600">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">All</option>
          <option value="NEW">NEW</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="MATCHED">MATCHED</option>
          <option value="CLOSED">CLOSED</option>
          <option value="SPAM">SPAM</option>
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
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name / Mobile</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Mode / City</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Message</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Assigned</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((q) => (
                <tr key={q.id}>
                  <td className="px-4 py-2 text-sm">
                    <span className="text-gray-900">{q.name ?? "—"}</span>
                    <br />
                    <span className="text-gray-600">{q.mobile}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">{q.mode} / {q.city}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">{q.message}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{q.status}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{q.assignedToAdminUser?.name ?? q.assignedToAdminUser?.phone ?? "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{q.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-2 text-sm">
                    <Link href={`/admin/user-queries/${q.id}`} className="text-primary hover:underline">View</Link>
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
          onClick={() => fetch(`/api/admin/user-queries?cursor=${nextCursor}&status=${statusFilter}`).then(r => r.json()).then(d => { setItems(prev => [...prev, ...d.items]); setNextCursor(d.nextCursor); })}
          className="mt-4 text-primary hover:underline"
        >
          Load more
        </button>
      )}
    </div>
  );
}
