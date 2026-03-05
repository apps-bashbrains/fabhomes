import Link from "next/link";
import { notFound } from "next/navigation";
import { getPropertyById, MOCK_PROPERTIES } from "@/lib/mockData";
import { PropertyGallery } from "@/components/properties/PropertyGallery";
import { PropertyBadges } from "@/components/properties/PropertyBadges";
import { PropertyKeyDetails } from "@/components/properties/PropertyKeyDetails";
import { AmenitiesList } from "@/components/properties/AmenitiesList";
import { LeadForm } from "@/components/forms/LeadForm";
import { formatPrice } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

/** Pre-render all known property pages at build time (SSG). Production: derive ids from API/DB. */
export function generateStaticParams() {
  return MOCK_PROPERTIES.map((p) => ({ id: p.id }));
}

export default function PropertyPage({ params }: PageProps) {
  const { id } = params;
  const property = getPropertyById(id);
  if (!property) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/search" className="text-sm text-primary hover:underline">
          ← Back to search
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <PropertyGallery
            mainImageUrl={property.mainImageUrl}
            imageUrls={property.imageUrls}
            title={property.title}
          />

          <div>
            <PropertyBadges badges={property.badges} className="mb-2" />
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{property.title}</h1>
            <p className="text-gray-600 mt-1">{property.location}</p>
            <p className="text-2xl font-bold text-primary mt-2">
              {formatPrice(property.price, property.currency)}
              {property.mode === "rent" && <span className="text-base font-normal text-gray-600">/month</span>}
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key details</h2>
            <PropertyKeyDetails property={property} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">About this property</h2>
            <p className="text-sm md:text-base text-gray-700 whitespace-pre-line">{property.description}</p>
          </div>

          <AmenitiesList amenities={property.amenities} />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 rounded-xl border border-gray-200 shadow-sm bg-white">
            <LeadForm propertyId={property.id} propertyTitle={property.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
