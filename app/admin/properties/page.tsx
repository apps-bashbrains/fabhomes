import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const items = await prisma.property.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { leads: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
        <Link
          href="/admin/properties/new"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
        >
          Add property
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="table-scroll-wrap">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Title</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">City</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Mode</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Leads</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{p.title}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{p.city}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{p.mode}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs ${p.status === "VERIFIED" ? "bg-green-100 text-green-800" : p.status === "DRAFT" ? "bg-gray-100" : "bg-amber-100"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{p._count.leads}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/properties/${p.id}/edit`} className="text-primary hover:underline text-sm">
                    Edit
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
