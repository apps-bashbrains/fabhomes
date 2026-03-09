/**
 * Prisma seed: default amenities, one SUPER_ADMIN user (from env), basic settings.
 * Run: npm run db:seed (requires DATABASE_URL, ADMIN_SEED_PHONE, optional ADMIN_SEED_NAME)
 * OTP in dev is logged to console; never use dev provider in production.
 */
import { config } from "dotenv";

config({ path: ".env" });

import { PrismaClient, UserRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

const AMENITIES = [
  { code: "LIFT", label: "Lift" },
  { code: "PARKING", label: "Parking" },
  { code: "SECURITY", label: "Security" },
  { code: "POWER_BACKUP", label: "Power Backup" },
  { code: "CLUBHOUSE", label: "Clubhouse" },
  { code: "GYM", label: "Gym" },
  { code: "PARK", label: "Park" },
];

const DEFAULT_SETTINGS = [
  { key: "brand_name", value: "FabHomes" },
  { key: "primary_color", value: "#0A1F44" },
  { key: "enable_lead_capture", value: true },
  { key: "maintenance_mode", value: false },
];

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

async function main() {
  const adminPhone = process.env.ADMIN_SEED_PHONE;
  const adminName = process.env.ADMIN_SEED_NAME ?? "Super Admin";

  if (!adminPhone) {
    throw new Error("ADMIN_SEED_PHONE must be set to run seed (e.g. 9876543210).");
  }

  const phone = normalizePhone(adminPhone);
  if (phone.length < 10) {
    throw new Error("ADMIN_SEED_PHONE must be at least 10 digits.");
  }

  for (const a of AMENITIES) {
    await prisma.amenity.upsert({
      where: { code: a.code },
      create: a,
      update: { label: a.label },
    });
  }

  for (const s of DEFAULT_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: s.key },
      create: { key: s.key, value: s.value },
      update: { value: s.value },
    });
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { phone },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        phone,
        name: adminName,
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    console.log("Created SUPER_ADMIN user with phone:", phone);
  } else {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { role: UserRole.SUPER_ADMIN, status: UserStatus.ACTIVE, name: adminName },
    });
    console.log("Updated existing user to SUPER_ADMIN:", phone);
  }

  console.log("Seed completed. Use OTP login (dev: OTP logged to console).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
