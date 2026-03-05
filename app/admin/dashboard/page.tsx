import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [activeListings, pendingReview, newLeadsToday, newLeadsWeek, leadsByStatus] = await Promise.all([
    prisma.property.count({ where: { isActive: true, status: "VERIFIED" } }),
    prisma.property.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.lead.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.lead.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const statusCounts = Object.fromEntries(leadsByStatus.map((s) => [s.status, s._count]));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Active Listings</p>
          <p className="text-2xl font-bold text-gray-900">{activeListings}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">New Leads Today</p>
          <p className="text-2xl font-bold text-gray-900">{newLeadsToday}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Leads (Last 7 days)</p>
          <p className="text-2xl font-bold text-gray-900">{newLeadsWeek}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Listings Pending Review</p>
          <p className="text-2xl font-bold text-gray-900">{pendingReview}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads by Status</h2>
        <div className="flex flex-wrap gap-4">
          {(["NEW", "CONTACTED", "QUALIFIED", "CLOSED_WON", "CLOSED_LOST", "SPAM"] as const).map((status) => (
            <div key={status} className="px-4 py-2 bg-gray-100 rounded-lg">
              <span className="text-gray-600">{status.replace("_", " ")}:</span>{" "}
              <span className="font-semibold">{statusCounts[status] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex gap-4">
        <Link href="/admin/properties" className="text-primary hover:underline">View all properties →</Link>
        <Link href="/admin/leads" className="text-primary hover:underline">View all leads →</Link>
      </div>
    </div>
  );
}
