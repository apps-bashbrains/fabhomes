-- OTP auth, RBAC (SUPER_ADMIN/ADMIN/SUPPORT/USER), UserQuery, ListingRequest, WishlistItem
-- Transition: User phone-based (unique), remove passwordHash; add status; extend enums

-- New enums
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "UserQueryStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'MATCHED', 'CLOSED', 'SPAM');
CREATE TYPE "ListingRequestStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- Extend UserRole (omit IF NOT EXISTS for compatibility with PostgreSQL < 15)
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE 'SUPPORT';

-- Extend AuditEntityType
ALTER TYPE "AuditEntityType" ADD VALUE 'USER_QUERY';
ALTER TYPE "AuditEntityType" ADD VALUE 'LISTING_REQUEST';
ALTER TYPE "AuditEntityType" ADD VALUE 'WISHLIST';

-- User: add status, make name/email nullable, backfill phone then set NOT NULL and unique, drop passwordHash
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
UPDATE "User" SET "phone" = COALESCE("phone", "email", "id") WHERE "phone" IS NULL OR "phone" = '';
ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;
DROP INDEX IF EXISTS "User_email_key";
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone");
CREATE INDEX IF NOT EXISTS "User_phone_idx" ON "User"("phone");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_status_idx" ON "User"("status");
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";

-- OtpRequest
CREATE TABLE "OtpRequest" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "requestIp" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OtpRequest_phone_createdAt_idx" ON "OtpRequest"("phone", "createdAt");
CREATE INDEX "OtpRequest_expiresAt_idx" ON "OtpRequest"("expiresAt");

-- Property: add admin/user links and publishedAt
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "createdByAdminUserId" TEXT;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "submittedByUserId" TEXT;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);

-- Lead: add userId, ipAddress, userAgent
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

-- Rename SavedProperty -> WishlistItem (same structure)
ALTER TABLE "SavedProperty" RENAME TO "WishlistItem";
ALTER INDEX "SavedProperty_userId_propertyId_key" RENAME TO "WishlistItem_userId_propertyId_key";
ALTER INDEX "SavedProperty_userId_idx" RENAME TO "WishlistItem_userId_idx";
ALTER INDEX "SavedProperty_propertyId_idx" RENAME TO "WishlistItem_propertyId_idx";
ALTER TABLE "WishlistItem" RENAME CONSTRAINT "SavedProperty_userId_fkey" TO "WishlistItem_userId_fkey";
ALTER TABLE "WishlistItem" RENAME CONSTRAINT "SavedProperty_propertyId_fkey" TO "WishlistItem_propertyId_fkey";
CREATE INDEX "WishlistItem_userId_createdAt_idx" ON "WishlistItem"("userId", "createdAt");

-- UserQuery
CREATE TABLE "UserQuery" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "mode" "PropertyMode" NOT NULL,
    "city" TEXT NOT NULL,
    "locationText" TEXT,
    "propertyType" "PropertyType",
    "budgetMin" BIGINT,
    "budgetMax" BIGINT,
    "bhk" INTEGER,
    "message" TEXT NOT NULL,
    "status" "UserQueryStatus" NOT NULL DEFAULT 'NEW',
    "assignedToAdminUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuery_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "UserQuery_status_createdAt_idx" ON "UserQuery"("status", "createdAt");
CREATE INDEX "UserQuery_city_mode_idx" ON "UserQuery"("city", "mode");
CREATE INDEX "UserQuery_mobile_idx" ON "UserQuery"("mobile");

-- UserQueryNote
CREATE TABLE "UserQueryNote" (
    "id" TEXT NOT NULL,
    "userQueryId" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "followUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserQueryNote_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "UserQueryNote_userQueryId_createdAt_idx" ON "UserQueryNote"("userQueryId", "createdAt");

-- ListingRequest
CREATE TABLE "ListingRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "PropertyMode" NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "title" TEXT,
    "locationText" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "bhk" INTEGER,
    "areaSqFt" INTEGER,
    "furnishing" "FurnishingType",
    "description" TEXT NOT NULL DEFAULT '',
    "status" "ListingRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "adminReviewerId" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ListingRequest_status_createdAt_idx" ON "ListingRequest"("status", "createdAt");
CREATE INDEX "ListingRequest_city_mode_idx" ON "ListingRequest"("city", "mode");

-- ListingRequestImage
CREATE TABLE "ListingRequestImage" (
    "id" TEXT NOT NULL,
    "listingRequestId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingRequestImage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ListingRequestImage_s3Key_key" ON "ListingRequestImage"("s3Key");
CREATE INDEX "ListingRequestImage_listingRequestId_sortOrder_idx" ON "ListingRequestImage"("listingRequestId", "sortOrder");

-- FKs: Property -> User (createdByAdminUserId, submittedByUserId)
ALTER TABLE "Property" ADD CONSTRAINT "Property_createdByAdminUserId_fkey" FOREIGN KEY ("createdByAdminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Property" ADD CONSTRAINT "Property_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Lead -> User
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- UserQuery -> User (assignedToAdminUser)
ALTER TABLE "UserQuery" ADD CONSTRAINT "UserQuery_assignedToAdminUserId_fkey" FOREIGN KEY ("assignedToAdminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- UserQueryNote
ALTER TABLE "UserQueryNote" ADD CONSTRAINT "UserQueryNote_userQueryId_fkey" FOREIGN KEY ("userQueryId") REFERENCES "UserQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserQueryNote" ADD CONSTRAINT "UserQueryNote_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ListingRequest -> User, adminReviewer
ALTER TABLE "ListingRequest" ADD CONSTRAINT "ListingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingRequest" ADD CONSTRAINT "ListingRequest_adminReviewerId_fkey" FOREIGN KEY ("adminReviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ListingRequestImage
ALTER TABLE "ListingRequestImage" ADD CONSTRAINT "ListingRequestImage_listingRequestId_fkey" FOREIGN KEY ("listingRequestId") REFERENCES "ListingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
