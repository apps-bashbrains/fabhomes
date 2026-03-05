import { BRAND_NAME } from "@/lib/brandConfig";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata = {
  title: `Login – ${BRAND_NAME}`,
};

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-8">
        Login to {BRAND_NAME}
      </h1>
      <LoginForm />
    </div>
  );
}
