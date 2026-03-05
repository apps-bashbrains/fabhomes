import Link from "next/link";
import { BRAND_NAME } from "@/lib/brandConfig";
import { HeroSearch } from "@/components/search/HeroSearch";
import { PropertyList } from "@/components/properties/PropertyList";
import { FEATURED_PROPERTIES } from "@/lib/mockData";

/** Static links for browse-by-type. No per-request work. */
const BROWSE_TYPES = [
  { key: "apartment", label: "Apartment", href: "/search?propertyType=apartment&mode=buy" },
  { key: "house_villa", label: "Villa", href: "/search?propertyType=house_villa&mode=buy" },
  { key: "plot", label: "Plot", href: "/search?propertyType=plot&mode=buy" },
  { key: "commercial_office", label: "Commercial", href: "/search?propertyType=commercial_office&mode=commercial" },
] as const;

export default function HomePage() {

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-light/30 to-white py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Find your next home with {BRAND_NAME}
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Simple, trustworthy property discovery for buying and renting.
          </p>
          <div className="mt-8">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Properties</h2>
        <PropertyList properties={FEATURED_PROPERTIES} />
      </section>

      {/* Browse by type */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Browse by Property Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BROWSE_TYPES.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm text-center font-medium text-gray-800 hover:border-primary hover:shadow-md transition-all"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why FabHomes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-8">Why {BRAND_NAME}?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary text-xl font-bold mb-4">
              ✓
            </div>
            <h3 className="font-semibold text-gray-900">Verified Listings</h3>
            <p className="text-sm text-gray-600 mt-2">We focus on quality, not clutter.</p>
          </div>
          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary text-xl font-bold mb-4">
              →
            </div>
            <h3 className="font-semibold text-gray-900">Direct Connect</h3>
            <p className="text-sm text-gray-600 mt-2">Reach owners or agents without extra layers.</p>
          </div>
          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary text-xl font-bold mb-4">
              ◐
            </div>
            <h3 className="font-semibold text-gray-900">Simple & Transparent</h3>
            <p className="text-sm text-gray-600 mt-2">Clean information, no hidden complexity.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
