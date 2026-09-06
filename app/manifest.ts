import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OpiOpe – Suomen kielen oppimisalusta',
    short_name: 'OpiOpe',
    description: 'Opi suomea arkeen, työhön ja YKIin.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f1eb',
    theme_color: '#151616',
    lang: 'fi',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
  }
}
