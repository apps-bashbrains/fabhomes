"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

const MOCK_USER_KEY = "fabhomes_user";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }
    const mockUser = {
      id: "mock-" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      phone: mobile.trim() || undefined,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
    }
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <Input
        label="Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
      />
      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <Input
        label="Mobile"
        type="tel"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        placeholder="10-digit mobile"
      />
      <Input
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full">
        Create Account
      </Button>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
