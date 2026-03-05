"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, type: "admin" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to send OTP");
        setLoading(false);
        return;
      }
      setStep("otp");
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("otp", {
        phone,
        otpCode,
        type: "admin",
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("Invalid OTP or not an admin account.");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Admin Login</h1>
      {step === "phone" ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <Input
            label="Phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-gray-600">OTP sent to {phone}</p>
          <Input
            label="OTP"
            type="text"
            required
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="6-digit code"
            maxLength={6}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Sign in"}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-gray-500 hover:text-gray-700"
            onClick={() => { setStep("phone"); setOtpCode(""); setError(""); }}
          >
            Use another number
          </button>
        </form>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Suspense fallback={<div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-pulse">Loading...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
