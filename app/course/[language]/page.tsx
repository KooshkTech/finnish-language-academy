import { notFound } from 'next/navigation'
import RoleGateway from '@/components/auth/RoleGateway'

type Props = { params: Promise<{ language: string }> }

export async function generateMetadata({ params }: Props) {
  const { language } = await params
  if (language !== 'fi' && language !== 'sv') notFound()

  const title = language === 'fi' ? 'Suomen kielen kurssi – A0–C2' : 'Lär dig svenska – kurser och övningar'
  return { title, description: language === 'fi' ? 'Opi suomea arkeen ja työhön. Oppitunteja ja harjoituksia omalla tasollasi.' : 'Öva svenska för vardag och arbete. Välj din nivå och öva olika färdigheter.', alternates: { canonical: `/course/${language}` }, openGraph: { title, locale: language === 'fi' ? 'fi_FI' : 'sv_FI', url: `/course/${language}` }, twitter: { card: 'summary' as const, title } }
}

export default async function CourseEntryPage({ params }: Props) {
  const { language } = await params
  if (language !== 'fi' && language !== 'sv') notFound()
  return <RoleGateway courseLanguage={language} />
}
