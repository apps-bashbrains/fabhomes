# Fab Homes — S3 & Database Setup (Amplify Live)

Use this after your app is live on AWS Amplify with a custom domain. It covers (1) S3 for property/listing images and (2) PostgreSQL and all Prisma tables.

---

## Part 1: S3 bucket for images

Your app uses **presigned URLs** for uploads (admin properties + customer listing requests). Images are stored in one bucket; optional CloudFront in front for faster reads.

### 1.1 — Create the bucket

1. In **AWS Console**, search **S3** → **Buckets** → **Create bucket**.
2. **Bucket name:** e.g. `fabhomes-property-images` (must be globally unique; add a suffix if taken).
3. **Region:** Same as Amplify (e.g. **ap-south-1** or your app region).
4. **Block Public Access:** Leave **all four** checkboxes **on** (block public access). The app uses presigned URLs and/or CloudFront; no public bucket policy needed.
5. **Bucket Versioning:** Off (unless you want versioning).
6. **Default encryption:** Enable (SSE-S3) recommended.
7. **Create bucket**.

### 1.2 — CORS

1. Open the bucket → **Permissions** tab → **Cross-origin resource sharing (CORS)** → **Edit**.
2. Use (replace `https://your-domain.com` with your Amplify custom domain):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": [
      "https://your-domain.com",
      "https://main.d18eog1zsy5z0c.amplifyapp.com"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

3. **Save changes**.

### 1.3 — IAM user for the app

1. **IAM** → **Users** → **Create user**.
2. **User name:** e.g. `fabhomes-app-s3`.
3. **Access type:** **Programmatic access** (access key).
4. **Next:** **Attach policies directly** → **Create policy** (opens new tab).
5. **JSON** tab, paste (replace `fabhomes-property-images` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::fabhomes-property-images",
        "arn:aws:s3:::fabhomes-property-images/*"
      ]
    }
  ]
}
```

6. **Next** → name policy e.g. `FabHomesS3PropertyImages` → **Create policy**.
7. Back in the user creation tab → **Refresh** → attach **FabHomesS3PropertyImages** → **Next** → **Create user**.
8. **Copy** the **Access key ID** and **Secret access key** (you won’t see the secret again). Store them safely.

### 1.4 — Add S3 env vars in Amplify

1. **Amplify** → your app → **Environment variables** (or **App settings** → **Environment variables**).
2. Add (use your bucket name and region):

| Key | Value |
|-----|--------|
| `AWS_REGION` | `ap-south-1` (or your bucket region) |
| `AWS_ACCESS_KEY_ID` | *(from IAM user)* |
| `AWS_SECRET_ACCESS_KEY` | *(from IAM user)* |
| `S3_BUCKET_PROPERTY_IMAGES` | `fabhomes-property-images` |
| `S3_CLOUDFRONT_URL` | *(leave empty for now; add later if you set up CloudFront)* |

3. **Save** → **Redeploy** the app so the new variables are used.

After this, property image uploads (admin) and listing-request images (customer) will work. Optional: add a CloudFront distribution in front of the bucket and set `S3_CLOUDFRONT_URL` to the distribution URL for image URLs.

---

## Part 2: Database setup (all tables)

Your app uses **PostgreSQL** and **Prisma**. All tables are defined in `prisma/schema.prisma`. You need a Postgres instance, then run migrations and seed once.

### Option A — AWS RDS (PostgreSQL)

#### 2A.1 — Create DB instance

1. **RDS** → **Create database**.
2. **Engine:** PostgreSQL (e.g. 15 or 16).
3. **Templates:** **Free tier** (or Dev/Test) if available.
4. **Settings:**
   - **DB instance identifier:** e.g. `fabhomes-db`.
   - **Master username:** e.g. `fabhomes`.
   - **Master password:** set and save it.
5. **Instance configuration:** smallest suitable (e.g. db.t3.micro for free tier).
6. **Storage:** default (e.g. 20 GB).
7. **Connectivity:**
   - **VPC:** default.
   - **Public access:** **Yes** (so you can run migrations from your machine or Amplify build; for production you’d use a private subnet and run migrations from a bastion or build).
   - **VPC security group:** create new, e.g. `fabhomes-db-sg`.
8. **Create database**. Wait until status is **Available**.

#### 2A.2 — Allow access in security group

1. **EC2** → **Security Groups** → select `fabhomes-db-sg` (or the one used by RDS).
2. **Inbound rules** → **Edit** → **Add rule**:
   - **Type:** PostgreSQL.
   - **Port:** 5432.
   - **Source:** Your IP (for migrations from laptop) and/or Amplify build (you may need to allow 0.0.0.0/0 temporarily for Amplify serverless to reach RDS, or use a VPC integration; see AWS docs).
3. **Save**.

#### 2A.3 — Create database and get URL

1. **RDS** → your instance → **Connectivity & security** → copy **Endpoint**.
2. Connect with a SQL client (e.g. pgAdmin, DBeaver) or **RDS Query Editor** using the master user/password.
3. Run: `CREATE DATABASE fabhomes;`
4. **Connection string:**

```
postgresql://fabhomes:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/fabhomes?schema=public
```

Replace `YOUR_PASSWORD` and `YOUR_RDS_ENDPOINT`.

### Option B — External PostgreSQL (Neon / Supabase / etc.)

1. Create a project at [Neon](https://neon.tech) or [Supabase](https://supabase.com) (or another provider).
2. Create a database named `fabhomes` (or use default).
3. Copy the **connection string** (PostgreSQL URL). It usually looks like:

```
postgresql://user:password@host:5432/fabhomes?sslmode=require
```

### 2.4 — Run migrations (create all tables)

From your **local machine** (with network access to the DB):

1. Set `DATABASE_URL` in `.env` to the production URL (RDS or external).
2. Run:

```bash
cd "/Users/abhishek/Desktop/bashbrains/projects/cursor/fab homes"
npx prisma migrate deploy
```

This applies all migrations under `prisma/migrations/` and creates every table (User, OtpRequest, Property, PropertyImage, Lead, UserQuery, ListingRequest, WishlistItem, etc.).

### 2.5 — Seed (first admin user)

Run once to create the initial SUPER_ADMIN (OTP login, no password):

```bash
# In .env set:
# ADMIN_SEED_PHONE=9876543210
# ADMIN_SEED_NAME=Super Admin
# DATABASE_URL=... (same as above)

npm run db:seed
```

You should see: `Created SUPER_ADMIN user with phone: 9876543210` and `Seed completed.`

### 2.6 — Add DATABASE_URL in Amplify

1. **Amplify** → your app → **Environment variables**.
2. Add:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | `postgresql://user:password@host:5432/fabhomes?schema=public` *(your real URL; use `sslmode=require` if required)* |

3. **Save** → **Redeploy**.

After redeploy, the live site will use the same database: login, properties, leads, user queries, listing requests, and wishlist will all persist.

---

## Quick checklist

**S3**

- [ ] Bucket created (e.g. `fabhomes-property-images`), block public access on.
- [ ] CORS set for your custom domain and Amplify URL.
- [ ] IAM user with access key; policy for `s3:PutObject`, `GetObject`, `DeleteObject`, `ListBucket` on the bucket.
- [ ] Amplify env: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_PROPERTY_IMAGES` (and `S3_CLOUDFRONT_URL` if using CloudFront).
- [ ] App redeployed.

**Database**

- [ ] PostgreSQL created (RDS or Neon/Supabase).
- [ ] Database `fabhomes` created.
- [ ] `npx prisma migrate deploy` run (all tables created).
- [ ] `npm run db:seed` run once (SUPER_ADMIN created).
- [ ] `DATABASE_URL` added in Amplify and app redeployed.

---

## Tables created by Prisma (reference)

After `prisma migrate deploy`, you will have:

- **User** — phone/OTP auth, role (SUPER_ADMIN, ADMIN, SUPPORT, USER).
- **OtpRequest** — OTP codes (hashed), expiry, rate limiting.
- **Property** — listings (mode, type, location, price, status, etc.).
- **PropertyImage** — images per property (s3Key, url).
- **Amenity**, **PropertyAmenity** — amenities for properties.
- **Lead**, **LeadNote** — enquiries and admin notes.
- **UserQuery**, **UserQueryNote** — customer queries and assignment.
- **WishlistItem** — saved properties per user.
- **ListingRequest**, **ListingRequestImage** — list-property flow and images.
- **AuditLog** — admin actions.
- **Setting** — key-value app settings.

No manual table creation is needed; migrations define everything.
