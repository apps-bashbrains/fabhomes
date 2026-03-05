import Link from "next/link";
import { AdminPropertyForm } from "@/components/admin/AdminPropertyForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminNewPropertyPage() {
  const amenities = await prisma.amenity.findMany({ orderBy: { code: "asc" } });
  return (
    <div>
      <Link href="/admin/properties" className="text-sm text-gray-600 hover:underline mb-4 inline-block">← Back to properties</Link>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">New property</h1>
      <AdminPropertyForm amenities={amenities} />
    </div>
  );
}
