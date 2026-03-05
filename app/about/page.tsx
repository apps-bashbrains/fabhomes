import { BRAND_NAME } from "@/lib/brandConfig";

export const metadata = {
  title: `About – ${BRAND_NAME}`,
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
        About {BRAND_NAME}
      </h1>
      <p className="text-base text-gray-700 mb-6">
        {BRAND_NAME} simplifies property discovery by offering verified listings, transparent
        details, and direct connections to property owners and agents.
      </p>
      <div className="space-y-6 text-sm md:text-base text-gray-700">
        <p>
          We believe finding a home should be simple. Our platform focuses on clarity: you search
          by mode (buy, rent, or commercial), location, and preferences, and get a clean list of
          properties with the key details you need—without clutter or hidden complexity.
        </p>
        <p>
          Trust is at the core of what we do. We emphasise verified listings and clear information
          so you can make informed decisions. Whether you are dealing with an owner or an agent,
          you see it upfront.
        </p>
        <p>
          We connect you directly with owners and agents. No extra layers—just the right contact
          so you can schedule visits and move forward quickly.
        </p>
      </div>

      <section className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How it works</h2>
        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
              1
            </span>
            <div>
              <strong className="text-gray-900">Search properties</strong>
              <p className="text-gray-600 text-sm">Use filters for mode, location, type, and budget.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
              2
            </span>
            <div>
              <strong className="text-gray-900">View essential details</strong>
              <p className="text-gray-600 text-sm">See key specs, amenities, and description.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
              3
            </span>
            <div>
              <strong className="text-gray-900">Connect directly</strong>
              <p className="text-gray-600 text-sm">Submit your interest and get in touch with the lister.</p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
