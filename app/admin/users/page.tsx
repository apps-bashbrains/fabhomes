"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<User[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState<"ADMIN" | "SUPPORT">("ADMIN");
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = (session?.user as { role?: string })?.role === "SUPER_ADMIN";

  function load() {
    setLoading(true);
    setError("");
    fetch("/api/admin/users")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data: { items: User[]; nextCursor: string | null }) => {
        setItems(data.items);
        setNextCursor(data.nextCursor);
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: createName.trim(),
        phone: createPhone.trim(),
        email: createEmail.trim() || undefined,
        role: createRole,
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error ?? "Failed"); });
        return r.json();
      })
      .then(() => {
        setCreateOpen(false);
        setCreateName("");
        setCreatePhone("");
        setCreateEmail("");
        setCreateRole("ADMIN");
        load();
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSubmitting(false));
  }

  function handleUpdateRole(userId: string, role: string) {
    fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => load())
      .catch(() => setError("Failed to update role"));
  }

  function handleUpdateStatus(userId: string, status: string) {
    fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => load())
      .catch(() => setError("Failed to update status"));
  }

  if (!isSuperAdmin && items.length === 0 && !loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Users</h1>
        <p className="text-gray-600">You do not have permission to view users.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        {isSuperAdmin && (
          <Button onClick={() => setCreateOpen(true)}>Invite / Create Admin</Button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {createOpen && isSuperAdmin && (
        <form onSubmit={handleCreate} className="mb-6 p-6 bg-white rounded-xl border border-gray-200 space-y-4 max-w-md">
          <h2 className="font-semibold text-gray-900">Create admin user</h2>
          <Input label="Name" value={createName} onChange={(e) => setCreateName(e.target.value)} required />
          <Input label="Phone" type="tel" value={createPhone} onChange={(e) => setCreatePhone(e.target.value)} required placeholder="10-digit" />
          <Input label="Email (optional)" type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as "ADMIN" | "SUPPORT")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SUPPORT">SUPPORT</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create"}</Button>
            <Button type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="table-scroll-wrap">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created</th>
                {isSuperAdmin && <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{u.name ?? "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{u.phone}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{u.email ?? "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{u.role}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{u.status}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{u.createdAt.slice(0, 10)}</td>
                  {isSuperAdmin && (
                    <td className="px-4 py-2 text-sm">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs mr-2"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPPORT">SUPPORT</option>
                        <option value="USER">USER</option>
                      </select>
                      <select
                        value={u.status}
                        onChange={(e) => handleUpdateStatus(u.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DISABLED">DISABLED</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
      {nextCursor && (
        <button type="button" onClick={() => fetch(`/api/admin/users?cursor=${nextCursor}`).then(r => r.json()).then(d => { setItems(prev => [...prev, ...d.items]); setNextCursor(d.nextCursor); })} className="mt-4 text-primary hover:underline">
          Load more
        </button>
      )}
    </div>
  );
}
