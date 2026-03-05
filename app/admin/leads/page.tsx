import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const items = await prisma.lead.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: { property: { select: { id: true, title: true, city: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
        <a
          href="/api/admin/leads?export=csv"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
        >
          Export CSV
        </a>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="table-scroll-wrap">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Mobile</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Property</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{l.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{l.mobile}</td>
                <td className="px-4 py-2 text-sm">
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-100">{l.status}</span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{l.property?.title ?? "—"}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{l.createdAt.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/leads/${l.id}`} className="text-primary hover:underline text-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
