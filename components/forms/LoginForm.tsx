"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { getSavedPropertyIds } from "@/lib/savedProperties";

export function LoginForm() {
  const router = useRouter();
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
        body: JSON.stringify({ phone, type: "customer" }),
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
        type: "customer",
        redirect: false,
        callbackUrl: "/",
      });
      if (res?.error) {
        setError("Invalid OTP. Please try again.");
        setLoading(false);
        return;
      }
      // One-time sync: push localStorage saved IDs to DB
      const localIds = getSavedPropertyIds();
      if (localIds.length > 0) {
        await fetch("/api/wishlist/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyIds: localIds }),
        }).catch(() => {});
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={step === "phone" ? handleRequestOtp : handleVerifyOtp}
      className="space-y-4 max-w-md mx-auto"
    >
      {step === "phone" ? (
        <>
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
        </>
      ) : (
        <>
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
            {loading ? "Verifying..." : "Verify & Login"}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-gray-500 hover:text-gray-700"
            onClick={() => {
              setStep("phone");
              setOtpCode("");
              setError("");
            }}
          >
            Use another number
          </button>
        </>
      )}
      <p className="text-center text-sm text-gray-600">
        By logging in you can save properties and submit listing requests.
      </p>
    </form>
  );
}
