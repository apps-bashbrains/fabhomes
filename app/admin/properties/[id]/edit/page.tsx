import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminPropertyForm } from "@/components/admin/AdminPropertyForm";

export const dynamic = "force-dynamic";

export default async function AdminEditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, amenities] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: { amenities: true, images: true },
    }),
    prisma.amenity.findMany({ orderBy: { code: "asc" } }),
  ]);
  if (!property) notFound();

  const initial = {
    ...property,
    price: Number(property.price),
    amenities: property.amenities.map((a) => ({ amenityId: a.amenityId })),
  };

  return (
    <div>
      <Link href="/admin/properties" className="text-sm text-gray-600 hover:underline mb-4 inline-block">← Back to properties</Link>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit property</h1>
      <AdminPropertyForm amenities={amenities} initial={initial} propertyId={id} />
    </div>
  );
}
