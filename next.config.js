/** @type {import('next').NextConfig} */
function safeNextAuthUrl() {
  const u = process.env.NEXTAUTH_URL;
  if (u && typeof u === "string") {
    const t = u.trim();
    if (!t.includes(" ") && !t.includes("Empty") && t.startsWith("http")) {
      try {
        new URL(t);
        return t;
      } catch {}
    }
  }
  return "https://localhost:3000";
}

const nextConfig = {
  env: {
    NEXTAUTH_URL: safeNextAuthUrl(),
  },
  // Disable standalone so all routes work with `npm run build && npm run start`.
  // Re-enable for Docker/production if needed.
  // output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

module.exports = nextConfig;
