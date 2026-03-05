# FabHomes Deployment Guide

## Overview

- **Option A (default):** Next.js on AWS Amplify Hosting, PostgreSQL (RDS), S3 for images.
- **Option B:** Next.js on ECS Fargate behind ALB, RDS + RDS Proxy, S3, CloudFront.

Use environment variables for all secrets and configuration. Never commit `.env` or production secrets.

---

## 1. Environment variables

Set these in your hosting environment (Amplify Console, ECS task definition, or `.env.local` for local dev).

### Required

| Variable | Description |
|---------|-------------|
| `DATABASE_URL` | PostgreSQL connection string. For production with high concurrency, use **RDS Proxy** endpoint. |
| `NEXTAUTH_URL` | Full app URL, e.g. `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | Random string for signing sessions (e.g. `openssl rand -base64 32`) |

### Admin seed (first-time only)

| Variable | Description |
|---------|-------------|
| `ADMIN_SEED_PHONE` | 10-digit phone for the first SUPER_ADMIN user (e.g. `9876543210`) |
| `ADMIN_SEED_NAME` | (Optional) Display name for SUPER_ADMIN, default "Super Admin" |

Run seed once after migrations:

```bash
npm run db:seed
```

**Auth:** Admin and customer login use **OTP over phone**. No password. In dev, OTP is logged to console. In production you must configure an SMS provider (see OTP below).

### OTP (SMS)

| Variable | Description |
|---------|-------------|
| `OTP_PROVIDER` | In production set to your provider (e.g. `aws-sns`). Leave unset or `dev` for local (OTP printed to console; **never use in production**). |

Production: implement and wire an OTP provider in `lib/otpProvider.ts` (e.g. AWS SNS) and set `OTP_PROVIDER` so plain OTP is never logged.

### S3 (property and listing-request images)

| Variable | Description |
|---------|-------------|
| `AWS_REGION` | e.g. `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | IAM user with S3 PutObject, GetObject |
| `AWS_SECRET_ACCESS_KEY` | Corresponding secret |
| `S3_BUCKET_PROPERTY_IMAGES` | Bucket name for property and listing-request images |
| `S3_CLOUDFRONT_URL` | (Optional) CloudFront distribution URL for image delivery |

### Optional

| Variable | Description |
|---------|-------------|
| `RUN_SEED_ON_DEPLOY` | Set to `true` only for first deploy to run seed |

---

## 2. Database (PostgreSQL)

- **AWS RDS** or **Aurora Serverless v2**: create a PostgreSQL instance and a database.
- **Connection pooling:** Use **RDS Proxy** in front of RDS for production (~50k concurrent users, minimal connections). Set `DATABASE_URL` to the proxy endpoint.
- Run migrations after deploy:

```bash
npx prisma migrate deploy
```

- For local dev, use Docker or a managed Postgres (e.g. Neon):

```bash
docker run -d -p 5432:5432 -e POSTGRES_USER=fabhomes -e POSTGRES_PASSWORD=local -e POSTGRES_DB=fabhomes postgres:15
```

Then set `DATABASE_URL=postgresql://fabhomes:local@localhost:5432/fabhomes` and run:

```bash
npx prisma migrate deploy
npm run db:seed
```

---

## 3. S3 bucket

- Create a bucket, e.g. `fabhomes-property-images`.
- CORS: allow `PUT`, `GET` from your app origin.
- Policy: allow your app (IAM user or role) to `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on the bucket.
- (Recommended) Put CloudFront in front and set `S3_CLOUDFRONT_URL` to the distribution URL for image URLs.

---

## 4. Option A: AWS Amplify Hosting

1. Connect the GitHub repo in Amplify Console.
2. Build settings:
   - Build command: `npm run build` (after `npm ci` and `npx prisma generate`).
   - Output: use Next.js SSR (Amplify detects Next.js).
3. Add all required env vars in Amplify Console (see §1).
4. For migrations: run `prisma migrate deploy` in a build step (if DATABASE_URL is available in build) or run it once from a machine that has DATABASE_URL and network access to RDS.
5. Seed: run `npm run db:seed` once with `ADMIN_SEED_PHONE` (and optional `ADMIN_SEED_NAME`) set.

---

## 5. Option B: ECS Fargate + ALB

1. Build a Docker image from the app (use `output: "standalone"` in `next.config.js` and copy `.next/standalone` and `.next/static` into the image).
2. Run the container on ECS Fargate behind an Application Load Balancer.
3. Add **RDS Proxy** in front of RDS and set `DATABASE_URL` to the proxy endpoint.
4. Put CloudFront in front of ALB (and optionally S3 for static/assets).
5. Set all env vars in the ECS task definition.
6. Run `prisma migrate deploy` in a one-off task or as an init container.

---

## 6. GitHub Actions (CI/CD)

- Workflow file: `.github/workflows/ci.yml`.
- On push/PR to `main`: lint, build, test.
- On deploy: run `prisma migrate deploy` (e.g. in Amplify build or a separate step).
- Configure GitHub/hosting secrets:
  - `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
  - `S3_BUCKET_PROPERTY_IMAGES`
  - For Amplify: `AMPLIFY_APP_ID`, `AMPLIFY_ENV_NAME`
  - For production OTP: credentials for your SMS provider (e.g. AWS SNS).

---

## 7. RBAC and security

- **Roles:** SUPER_ADMIN (users/settings), ADMIN (properties, leads, user queries, listing requests), SUPPORT (leads, user queries only), USER (customer).
- Middleware protects `/admin/*` and `/api/admin/*`; only SUPER_ADMIN, ADMIN, SUPPORT can access. Each admin API enforces role (e.g. only SUPER_ADMIN can create users or update settings).
- **OTP:** Rate limited per phone and per IP; hashed in DB; 5 min TTL; max 5 verify attempts.
- Security checklist:
  - [ ] `NEXTAUTH_SECRET` is strong and not committed.
  - [ ] Database is not publicly accessible; use VPC and security groups.
  - [ ] S3 bucket blocks public access; access via signed URLs or CloudFront.
  - [ ] Admin routes protected; RBAC enforced server-side on every admin API.
  - [ ] Rate limiting on `/api/auth/request-otp`, `/api/leads`, `/api/user-queries`, and public submission endpoints.

---

## 8. Local development

```bash
cp .env.example .env
# Edit .env: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, ADMIN_SEED_PHONE (optional ADMIN_SEED_NAME)

npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed

npm run dev
```

- Customer site: http://localhost:3000  
- Admin: http://localhost:3000/admin — login with **phone + OTP** (OTP printed in terminal when using dev provider).
- First admin: create with seed using `ADMIN_SEED_PHONE` (e.g. `9876543210`). Request OTP from admin login page; use the code from the server log.

For local S3, use a separate dev bucket or MinIO and set the same env vars accordingly.
