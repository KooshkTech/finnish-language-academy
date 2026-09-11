import AcademyShell from '@/components/academy/AcademyShell'

export const metadata = { title: 'My Progress', description: 'See your Finnish learning progress and recommended next step.' }

export default function ProgressPage() {
  return <AcademyShell mode="progress" />
}
