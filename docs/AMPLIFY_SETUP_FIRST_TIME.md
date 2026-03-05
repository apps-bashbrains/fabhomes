# Deploy Fab Homes to AWS Amplify — First-Time AWS Guide

This guide assumes you have never used AWS before. Follow the steps in order.

---

## Part 1: AWS Account and Login

### Step 1.1 — Create an AWS account (if you don’t have one)

1. Open a browser and go to: **https://aws.amazon.com**
2. Click **Create an AWS Account** (top right).
3. Enter your **email**, choose a **password**, and give an **AWS account name** (e.g. “My Company”).
4. Choose **Personal** or **Professional** and fill in contact details.
5. Enter **payment information** (card required; you stay in Free Tier if you use only free services).
6. Confirm identity via **phone** (SMS or voice).
7. Choose **Basic support – Free** and finish sign-up.

### Step 1.2 — Sign in to the AWS Console

1. Go to **https://console.aws.amazon.com**
2. Sign in with the **root** email and password you used to create the account.
3. You will land on the **AWS Management Console** home.

### Step 1.3 — Choose a region (optional but recommended)

- Top-right of the console you’ll see a **region** (e.g. “N. Virginia”, “Mumbai”).
- Click it and pick a region close to your users (e.g. **Asia Pacific (Mumbai) ap-south-1** for India).
- Amplify and your app will be created in this region unless you change it later.

---

## Part 2: Open Amplify and Create an App

This part walks you through creating a new Amplify app and connecting it to your GitHub repo. Do this after you’re signed in to the AWS Console (Part 1).

---

### Step 2.1 — Go to AWS Amplify

1. At the top of the AWS Console you’ll see a **search bar** (it often says “Search for services, features, and more” or has a magnifying glass).
2. Click that bar and type **Amplify** (no need to press Enter).
3. In the results, under **Services**, click **AWS Amplify** (the one that says “Build fullstack web and mobile apps” or similar).
4. You’ll land on the **Amplify Console**:
   - Left sidebar: **Hosting**, **Backend**, **Admin UI**, etc.
   - Main area: list of your apps (empty if first time) and an option to create a new app.

**If you don’t see Amplify:** Make sure you’re in the right region (top-right). Amplify is available in most regions; try **N. Virginia (us-east-1)** or **Mumbai (ap-south-1)** if in doubt.

---

### Step 2.2 — Start “New app” → “Host web app”

1. On the Amplify Console page, find the **Create new app** button (usually orange or blue, top-right or in the main area). It might say **New app** or **Create**.
2. Click it. A menu or page may appear with:
   - **Host web app** — deploy a frontend from Git (this is what we want).
   - **Build an app** / **Fullstack** — app with backend (we’re not using this for this guide).
3. Click **Host web app** (or the option that says “Deploy without Git provider” is *not* what you want; we’re connecting GitHub).
4. You should now see a page titled something like **Get started with Amplify Hosting** or **Connect repository**, with options for **GitHub**, **GitLab**, **Bitbucket**, **AWS CodeCommit**, or **Deploy without Git**.

---

### Step 2.3 — Connect your GitHub repository

1. Under **Get started with Amplify Hosting**, select **GitHub** (the card or radio option for GitHub).
2. Click **Continue** (or **Next**).

3. **First-time GitHub connection:**
   - If Amplify shows **Connect to GitHub** or **Authorize AWS Amplify**:
     - Click **Authorize AWS Amplify** (or **Connect to GitHub**).
     - Your browser may open a new tab or window for **github.com**.
     - Sign in to GitHub if asked.
     - GitHub will ask you to **Authorize** Amplify to access your repositories. You can choose:
       - **All repositories**, or
       - **Only select repositories** → then pick **apps-bashbrains/fabhomes**.
     - Click **Authorize** (or **Install**).
     - Return to the **AWS Amplify** browser tab.
   - If you already connected GitHub before, you might go straight to the repository selection screen.

4. **Choose repository and branch:**
   - **Repository** (or “Select repository”):
     - Open the dropdown. You should see a list of GitHub repos Amplify can access.
     - Select **apps-bashbrains/fabhomes** (owner/repo name). If you don’t see it, re-check the GitHub authorization and ensure **fabhomes** was included.
   - **Branch** (or “Branch to connect”):
     - Open the branch dropdown. Choose **main** (or whichever branch you want to deploy).
   - **Monorepo (optional):** If you see “Monorepo” or “Root directory” and this is the only app in the repo, leave **Root** or leave the field blank. Only change this if your app lives in a subfolder (e.g. `apps/web`).

5. Click **Next** (bottom of the page). You’ll go to the build settings step.

---

### Step 2.4 — Confirm build settings

On this page Amplify shows how it will build your app. Your repo has an **amplify.yml** at the root, so Amplify should use it automatically.

1. **Build specification:**
   - Look for **Build specification** or **Build settings**.
   - It should say **amplify.yml** or **Use build specification file in repository** or show a path like `/amplify.yml`.
   - If instead you see **Manual** or inline build commands, switch it to **Use build specification file** and set the path to **amplify.yml** (or leave default if it already picks it up).

2. **Build image (optional):**
   - You may see **Build image** or **Compute**. The default (e.g. **Amazon Linux: 2023**) is fine. No need to change unless you have special requirements.

3. **App name:**
   - If there’s an **App name** or **Application name** field, type something like **fabhomes** (lowercase, no spaces). This becomes the name in the Amplify app list and can affect the default URL.

4. **Service role (optional):**
   - If you see **Service role**, leave **Create new service role** (or the default). Amplify will create a role so the build can run. You can change this later in IAM if needed.

5. Click **Next** to go to **Advanced settings** / environment variables.

---

### Step 2.5 — Add environment variables (important)

Your Next.js app needs environment variables at build and runtime. Add them on the **Advanced settings** / **Environment variables** page: use **Add variable** for each row and fill **Key** and **Value** from the list below.

**Key-value pairs to add in Amplify:**

| Key | Value |
|-----|--------|
| `NEXTAUTH_SECRET` | *(Generate: run `openssl rand -base64 32` in Terminal, paste the output)* |
| `OTP_PROVIDER` | `dev` |
| `NEXTAUTH_URL` | **Leave completely empty** for first deploy. After deploy, set to your app URL only (e.g. `https://main.xxxxxx.amplifyapp.com`). **Do not paste the instruction text into this field.** |

**Optional — add when you have a database:**

| Key | Value |
|-----|--------|
| `DATABASE_URL` | `postgresql://USERNAME:PASSWORD@HOST:5432/fabhomes?schema=public` *(replace USERNAME, PASSWORD, HOST)* |
| `ADMIN_SEED_PHONE` | `9876543210` *(or your chosen admin phone)* |
| `ADMIN_SEED_NAME` | `Super Admin` |

**Optional — add later for S3 image uploads:**

| Key | Value |
|-----|--------|
| `AWS_REGION` | `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | *(Your IAM access key)* |
| `AWS_SECRET_ACCESS_KEY` | *(Your IAM secret key)* |
| `S3_BUCKET_PROPERTY_IMAGES` | `fabhomes-property-images` *(or your bucket name)* |

**Notes:**
- For **NEXTAUTH_SECRET**: run `openssl rand -base64 32` locally, copy the one-line output, paste into Value. Do not commit or share it.
- For **NEXTAUTH_URL**: leave the value **empty** on first deploy (do not paste any instruction text). After the first deploy, set it to your real URL only, e.g. `https://main.xxxxxxxxxxxx.amplifyapp.com`, then redeploy.
- If Amplify has **Mask variable** / **Secure**, enable it for `NEXTAUTH_SECRET` and `DATABASE_URL`.

Click **Next** when done.

---

### Step 2.6 — Review and save

1. You’ll see a **Review** or **Summary** page showing:
   - Repository: **apps-bashbrains/fabhomes**
   - Branch: **main**
   - Build spec: **amplify.yml** (or the path you set)
   - Environment variables: the keys you added (values may be masked).

2. Check that everything looks correct. You can use **Back** to fix anything.

3. Click **Save and deploy** (or **Create** or **Deploy**).  
   Amplify will:
   - Create the app and connect the branch.
   - Start the first build (clone repo → run `npm ci` and `npm run build` from amplify.yml).
   - Then deploy and give you a URL.

4. You’ll be taken to the app’s main page where you can watch **Provision**, **Build**, **Deploy**, and **Verify**. Continue with **Part 3** for what to do next and how to get your app URL.

---

## Part 3: First Deploy and Getting the App URL

### Step 3.1 — Watch the build

1. Amplify will **clone** your repo, then run the build from `amplify.yml`:
   - `npm ci`
   - `npm run build`
2. You’ll see **Provision**, **Build**, **Deploy**, **Verify**.
3. The first run may take **5–10 minutes**. Wait until **Deploy** shows a green check.

### Step 3.2 — If the build fails

- Click the **Build** step to open the build log.
- Common issues:
  - **Missing env var**: e.g. if the app expects `NEXTAUTH_SECRET` at build time, add it in Amplify → App settings → Environment variables, then **Redeploy**.
  - **Prisma**: If the build runs `prisma generate` or `prisma migrate deploy`, ensure `DATABASE_URL` is set and reachable from Amplify (e.g. RDS in a VPC with correct security groups, or a publicly reachable DB).

### Step 3.3 — Get your app URL

1. When the deploy succeeds, you’ll see a **branch** (e.g. `main`) with a **green check**.
2. Click the branch name or the **domain** link.
3. Your app URL will look like: **https://main.xxxxxxxxxxxx.amplifyapp.com**
4. Open that URL in a browser to see Fab Homes.

### Step 3.4 — Set NEXTAUTH_URL (required for login)

1. In Amplify Console, go to **App settings** → **Environment variables**.
2. Add or edit **NEXTAUTH_URL** and set it to your app URL:  
   `https://main.xxxxxxxxxxxx.amplifyapp.com` (no trailing slash).
3. **Redeploy** the app (Deploy → Redeploy this version, or push a small commit) so the new variable is used.

---

## Part 4: Database and Admin (Optional but Recommended)

Your app uses **PostgreSQL** and **Prisma**. To have login and data:

### Step 4.1 — Get a database

- **Option A — AWS RDS**
  1. In AWS Console search, type **RDS**.
  2. Create a PostgreSQL database (e.g. “Free tier” template), note **endpoint**, **port**, **username**, **password**.
  3. Create a database named `fabhomes` (or as in your Prisma schema).
  4. Ensure the DB is reachable from Amplify (e.g. public accessibility or VPC integration as per AWS docs).

- **Option B — External (e.g. Neon, Supabase)**
  - Create a Postgres project and copy the connection string.
  - Use that as `DATABASE_URL` (ensure it allows connections from the internet if Amplify build needs it).

### Step 4.2 — Add DATABASE_URL in Amplify

1. Amplify → your app → **App settings** → **Environment variables**.
2. Add **DATABASE_URL** with value like:  
   `postgresql://USER:PASSWORD@HOST:5432/fabhomes?schema=public`
3. Save and **redeploy**.

### Step 4.3 — Run migrations and seed (one-time)

- **Option 1 — From your laptop (easiest)**  
  Set `DATABASE_URL` in your local `.env` to the same production URL (only if it’s reachable from your network). Then run:
  ```bash
  npx prisma migrate deploy
  npm run db:seed
  ```
- **Option 2 — In Amplify build**  
  Add to `amplify.yml` under `preBuild.commands` (only if your DB is reachable from Amplify build):
  ```yaml
  - npx prisma generate
  - npx prisma migrate deploy
  ```
  And run seed once from your machine or a one-off script with `DATABASE_URL` set.

After that, open **https://your-amplify-url.amplifyapp.com/admin/login** and log in with the phone you set in `ADMIN_SEED_PHONE`; request OTP and use the code from Amplify build logs (when `OTP_PROVIDER=dev`).

---

## Part 5: Quick Reference

| What | Where |
|------|--------|
| AWS sign-up / login | https://aws.amazon.com → Create account / Sign in |
| AWS Console | https://console.aws.amazon.com |
| Amplify Console | Console → search “Amplify” → AWS Amplify |
| Your app URL | Amplify → your app → branch (e.g. main) → domain link |
| Env vars | Amplify → App settings → Environment variables |
| Build logs | Amplify → your app → click the build step |
| Admin login | `https://YOUR-AMPLIFY-URL/admin/login` |

---

## Summary Checklist

- [ ] AWS account created and you can sign in to the console.
- [ ] In Amplify, created a new app and connected **apps-bashbrains/fabhomes** from GitHub, branch **main**.
- [ ] Build uses **amplify.yml** (npm ci, npm run build, cache).
- [ ] Set **NEXTAUTH_SECRET** and **NEXTAUTH_URL** (after first deploy); **OTP_PROVIDER=dev** for testing.
- [ ] First deploy completed and you have the Amplify app URL.
- [ ] (Optional) **DATABASE_URL** set; migrations and seed run once; admin login works with OTP from build logs.

For production, you’ll later add a real SMS provider for OTP, use RDS Proxy if you use RDS, and configure S3/CloudFront for images as in `DEPLOYMENT.md`.
