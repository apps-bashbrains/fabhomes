import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminLeadDetailClient } from "@/components/admin/AdminLeadDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      property: true,
      notes: { orderBy: { createdAt: "desc" }, include: { adminUser: { select: { name: true, email: true } } } },
    },
  });
  if (!lead) notFound();

  return (
    <div>
      <Link href="/admin/leads" className="text-sm text-gray-600 hover:underline mb-4 inline-block">← Back to leads</Link>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Lead: {lead.name}</h1>
      <AdminLeadDetailClient lead={lead} />
    </div>
  );
}
