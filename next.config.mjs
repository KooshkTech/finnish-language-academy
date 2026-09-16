import { indexingEnabled } from './lib/seo.mjs'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  allowedDevOrigins: ['192.168.1.135', '172.20.10.8', 'localhost', '127.0.0.1'],
  async headers() {
    const production = process.env.NODE_ENV === 'production'
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), payment=(), usb=()' },
      ...(production ? [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ] : []),
    ]
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
    return [{ source: '/(.*)', headers: [...securityHeaders, ...(!indexingEnabled() ? noindex : [])] },
      ...['account', 'student', 'teacher', 'admin', 'api', 'login', 'register', 'auth', 'progress', 'review', 'tutor', 'ai-tutor', 'schedule', 'join-class', 'forgot-password', 'reset-password'].map(segment => ({ source: `/${segment}/:path*`, headers: noindex }))]
  },
}
export default nextConfig
