import AcademyShell from '@/components/academy/AcademyShell'

export const metadata = { alternates: { canonical: '/yki' }, title: 'YKI-harjoittelu', description: 'Harjoittele suomen YKI-tehtävätyyppejä.' }

export default function YkiPage() {
  return <AcademyShell mode="yki" />
}
