"use client";

import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Checkbox } from "@/components/common/Checkbox";

interface LeadFormProps {
  propertyId: string;
  propertyTitle?: string;
}

export function LeadForm({ propertyId }: LeadFormProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [similar, setSimilar] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!mobile.trim()) {
      setError("Mobile number is required.");
      return;
    }
    const payload = {
      propertyId: propertyId || null,
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      message: message.trim() || undefined,
      interestedInSimilar: similar,
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      setName("");
      setMobile("");
      setEmail("");
      setMessage("");
      setSimilar(false);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
        <p className="text-green-800 font-medium">Thank you. Our team will contact you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Express your interest</h3>
      <Input
        label="Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
      />
      <Input
        label="Mobile"
        required
        type="tel"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        placeholder="10-digit mobile"
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
      />
      <Input
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Any specific questions?"
      />
      <Checkbox
        label="I am interested in similar properties."
        checked={similar}
        onChange={(e) => setSimilar(e.target.checked)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
}
