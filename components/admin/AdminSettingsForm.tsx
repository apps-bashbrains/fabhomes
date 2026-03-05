"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Checkbox } from "@/components/common/Checkbox";

export function AdminSettingsForm({ initial }: { initial: Record<string, unknown> }) {
  const router = useRouter();
  const [brandName, setBrandName] = useState((initial.brand_name as string) ?? "FabHomes");
  const [primaryColor, setPrimaryColor] = useState((initial.primary_color as string) ?? "#0d9488");
  const [enableLeadCapture, setEnableLeadCapture] = useState((initial.enable_lead_capture as boolean) ?? true);
  const [maintenanceMode, setMaintenanceMode] = useState((initial.maintenance_mode as boolean) ?? false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name: brandName,
          primary_color: primaryColor,
          enable_lead_capture: enableLeadCapture,
          maintenance_mode: maintenanceMode,
        }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <Input label="Brand name" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
      <Input label="Primary color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
      <Checkbox label="Enable lead capture" checked={enableLeadCapture} onChange={(e) => setEnableLeadCapture(e.target.checked)} />
      <Checkbox label="Maintenance mode" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} />
      <Button type="submit" disabled={loading}>Save</Button>
    </form>
  );
}
