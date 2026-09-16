import PasswordResetRequestForm from '@/components/auth/PasswordResetRequestForm'

type Props = { searchParams: Promise<{ course?: string }> }

export const metadata = { title: 'Salasanan palautus | OpiOpe', robots: { index: false, follow: false } }

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { course } = await searchParams
  return <PasswordResetRequestForm courseLanguage={course === 'sv' ? 'sv' : 'fi'} />
}

