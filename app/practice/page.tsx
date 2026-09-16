import AcademyShell from '@/components/academy/AcademyShell'

export const metadata = { alternates: { canonical: '/practice' }, title: 'Suomen harjoitukset', description: 'Harjoittele suomen kielioppia, sanastoa, kuuntelua ja puhumista.' }

export default function PracticePage() {
  return <AcademyShell mode="practice" />
}
