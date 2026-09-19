import CourseGateway from '@/components/auth/CourseGateway'

export const metadata = {
  title: 'Valitse kielikurssi',
  alternates: { canonical: '/' },
  robots: { index: false, follow: true },
}

export default function GatewayPage() {
  return <CourseGateway />
}
