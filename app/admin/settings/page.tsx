import { prisma } from "@/lib/db";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: ["brand_name", "primary_color", "enable_lead_capture", "maintenance_mode"] } },
  });
  const settings: Record<string, unknown> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      <AdminSettingsForm initial={settings} />
    </div>
  );
}
