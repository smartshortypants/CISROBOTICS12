/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "upload.wikimedia.org",
      "images.unsplash.com",
      "cdn.britannica.com",
      "upload.wikimedia.org",
    ],
  },
};

module.exports = nextConfig;
