import { BRAND_NAME } from "@/lib/brandConfig";
import { SignupForm } from "@/components/forms/SignupForm";

export const metadata = {
  title: `Sign Up – ${BRAND_NAME}`,
};

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-8">
        Create your {BRAND_NAME} account
      </h1>
      <SignupForm />
    </div>
  );
}
