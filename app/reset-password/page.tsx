import PasswordResetForm from '@/components/auth/PasswordResetForm'

type Props = { searchParams: Promise<{ course?: string }> }

export const metadata = { title: 'Uusi salasana | OpiOpe', robots: { index: false, follow: false } }

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { course } = await searchParams
  return <PasswordResetForm courseLanguage={course === 'sv' ? 'sv' : 'fi'} />
}

