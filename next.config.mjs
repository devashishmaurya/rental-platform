/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: "output: 'export'" is not used because middleware (auth guard) requires a Node server.
  // For static hosting, use a platform that runs Next (e.g. Vercel) or remove middleware.
  images: {
    unoptimized: true, // Set to false if using a host that supports Next image optimization
  },
  // Enable experimental features for microfrontend support
  experimental: {
    // Module federation can be configured here if needed
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
