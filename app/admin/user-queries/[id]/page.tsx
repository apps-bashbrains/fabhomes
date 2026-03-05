"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";

type UserQueryDetail = {
  id: string;
  name: string | null;
  mobile: string;
  email: string | null;
  mode: string;
  city: string;
  locationText: string | null;
  message: string;
  status: string;
  budgetMin: bigint | null;
  budgetMax: bigint | null;
  bhk: number | null;
  createdAt: string;
  assignedToAdminUser: { id: string; name: string | null; phone: string } | null;
  notes: Array<{
    id: string;
    note: string;
    followUpAt: string | null;
    createdAt: string;
    adminUser: { name: string | null; phone: string };
  }>;
};

export default function AdminUserQueryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [q, setQ] = useState<UserQueryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [assignId, setAssignId] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/user-queries/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setQ)
      .catch(() => setQ(null))
      .finally(() => setLoading(false));
  }, [id]);

  function updateStatus() {
    if (!status) return;
    fetch(`/api/admin/user-queries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((r) => { if (!r.ok) throw new Error(); return fetch(`/api/admin/user-queries/${id}`).then(r => r.json()); })
      .then(setQ)
      .then(() => setStatus(""));
  }

  function addNote() {
    if (!note.trim()) return;
    fetch(`/api/admin/user-queries/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note.trim() }),
    })
      .then((r) => { if (!r.ok) throw new Error(); return fetch(`/api/admin/user-queries/${id}`).then(r => r.json()); })
      .then(setQ)
      .then(() => setNote(""));
  }

  function assign() {
    fetch(`/api/admin/user-queries/${id}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUserId: assignId || null }),
    })
      .then((r) => { if (!r.ok) throw new Error(); return fetch(`/api/admin/user-queries/${id}`).then(r => r.json()); })
      .then(setQ);
  }

  if (loading || !q) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <Link href="/admin/user-queries" className="text-primary hover:underline mb-4 inline-block">← User Queries</Link>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Query: {q.mobile}</h1>

      <div className="grid gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Details</h2>
          <p><span className="text-gray-500">Name:</span> {q.name ?? "—"}</p>
          <p><span className="text-gray-500">Mobile:</span> {q.mobile}</p>
          <p><span className="text-gray-500">Email:</span> {q.email ?? "—"}</p>
          <p><span className="text-gray-500">Mode / City:</span> {q.mode} / {q.city}</p>
          <p><span className="text-gray-500">Message:</span> {q.message}</p>
          <p><span className="text-gray-500">Status:</span> {q.status}</p>
          <p><span className="text-gray-500">Assigned:</span> {q.assignedToAdminUser?.name ?? q.assignedToAdminUser?.phone ?? "—"}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Update status</h2>
          <div className="flex gap-2 items-center">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
              <option value="">Select</option>
              <option value="NEW">NEW</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="MATCHED">MATCHED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="SPAM">SPAM</option>
            </select>
            <Button onClick={updateStatus} disabled={!status}>Update</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Assign to admin</h2>
          <div className="flex gap-2 items-center">
            <input type="text" placeholder="Admin user ID (uuid)" value={assignId} onChange={(e) => setAssignId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 flex-1" />
            <Button onClick={assign}>Assign</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note" className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" rows={2} />
          <Button onClick={addNote} disabled={!note.trim()}>Add note</Button>
          <ul className="mt-4 space-y-2">
            {q.notes.map((n) => (
              <li key={n.id} className="text-sm border-l-2 border-gray-200 pl-3">
                <span className="text-gray-600">{n.note}</span>
                <span className="text-gray-400 ml-2">— {n.adminUser.name ?? n.adminUser.phone} ({n.createdAt.slice(0, 16)})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
