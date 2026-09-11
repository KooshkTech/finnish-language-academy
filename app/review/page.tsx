import AcademyShell from '@/components/academy/AcademyShell'

export const metadata = { title: 'Finnish Review', description: 'Review Finnish vocabulary, grammar, and weak areas with OPIOPE.' }

export default function ReviewPage() {
  return <AcademyShell mode="review" />
}
