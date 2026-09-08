/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Enables testing the dev server from the phone on the user's current LAN.
  // Change or remove this entry if the local IP changes.
  allowedDevOrigins: ['192.168.1.135'],
}

export default nextConfig
