"use client";

import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Contact form:", { name, email, phone, message });
    new Promise<void>((resolve) => setTimeout(resolve, 600)).then(() => {
      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    });
  }

  if (submitted) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center max-w-md mx-auto">
        <p className="text-green-800 font-medium">
          Thank you for reaching out. We will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <Input
        label="Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
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
        label="Phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Your phone"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
}
