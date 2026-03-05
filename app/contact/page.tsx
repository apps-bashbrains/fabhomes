import { BRAND_NAME } from "@/lib/brandConfig";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata = {
  title: `Contact – ${BRAND_NAME}`,
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-600 mb-8">
        Have a question or feedback? Send us a message and we&apos;ll get back to you as soon as we can.
      </p>
      <ContactForm />
    </div>
  );
}
