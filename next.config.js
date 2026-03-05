/** @type {import('next').NextConfig} */
const nextConfig = {
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
