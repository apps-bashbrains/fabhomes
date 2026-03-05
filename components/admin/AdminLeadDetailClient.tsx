"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import type { Lead, LeadNote, Property, User } from "@prisma/client";

type LeadWithRelations = Lead & {
  property: Property | null;
  notes: (LeadNote & { adminUser: Pick<User, "name" | "email"> })[];
};

const STATUS_OPTIONS = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED_WON", "CLOSED_LOST", "SPAM"];

export function AdminLeadDetailClient({ lead }: { lead: LeadWithRelations }) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [note, setNote] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus as Lead["status"]);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim(), followUpAt: followUpAt || null }),
      });
      if (res.ok) {
        setNote("");
        setFollowUpAt("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Mobile</p>
        <p className="font-medium">{lead.mobile}</p>
        <p className="text-sm text-gray-500 mt-2">Email</p>
        <p className="font-medium">{lead.email ?? "—"}</p>
        <p className="text-sm text-gray-500 mt-2">Message</p>
        <p className="font-medium">{lead.message ?? "—"}</p>
        <p className="text-sm text-gray-500 mt-2">Interested in similar</p>
        <p className="font-medium">{lead.interestedInSimilar ? "Yes" : "No"}</p>
        {lead.property && (
          <>
            <p className="text-sm text-gray-500 mt-2">Property</p>
            <p className="font-medium">{lead.property.title} ({lead.property.city})</p>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={loading}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Add note</h2>
        <form onSubmit={addNote} className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Internal note..."
          />
          <Input
            label="Follow-up at"
            type="datetime-local"
            value={followUpAt}
            onChange={(e) => setFollowUpAt(e.target.value)}
          />
          <Button type="submit" disabled={loading}>Add note</Button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Notes</h2>
        <ul className="space-y-3">
          {lead.notes.map((n) => (
            <li key={n.id} className="border-l-2 border-gray-200 pl-4">
              <p className="text-sm text-gray-600">{n.note}</p>
              <p className="text-xs text-gray-500 mt-1">
                {n.adminUser.name} · {n.createdAt.toISOString()}
                {n.followUpAt && ` · Follow-up: ${n.followUpAt.toISOString()}`}
              </p>
            </li>
          ))}
          {lead.notes.length === 0 && <p className="text-gray-500 text-sm">No notes yet.</p>}
        </ul>
      </div>
    </div>
  );
}
