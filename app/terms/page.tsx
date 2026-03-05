import { BRAND_NAME } from "@/lib/brandConfig";

export const metadata = {
  title: `Terms – ${BRAND_NAME}`,
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Terms of Use</h1>
      <p className="text-sm md:text-base text-gray-700">
        This is a placeholder for terms of use. {BRAND_NAME} reserves the right to update these terms.
        Use of this platform constitutes acceptance of the terms in effect at the time of use.
      </p>
    </div>
  );
}
