import { BRAND_NAME } from "@/lib/brandConfig";

export const metadata = {
  title: `Privacy – ${BRAND_NAME}`,
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-sm md:text-base text-gray-700">
        This is a placeholder for the privacy policy. {BRAND_NAME} is committed to protecting your
        personal information. We collect only what is necessary to provide our services and do not
        share your data with third parties for marketing purposes.
      </p>
    </div>
  );
}
