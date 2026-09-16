import AccountRegistrationForm from '@/components/auth/AccountRegistrationForm'

type Props = { searchParams: Promise<{ course?: string }> }
export default async function Page({ searchParams }: Props) {
  const { course } = await searchParams
  const language = course === 'sv' ? 'sv' : 'fi'
  return <main className="student-register-page"><AccountRegistrationForm courseLanguage={language} accountKind="student" /></main>
}

