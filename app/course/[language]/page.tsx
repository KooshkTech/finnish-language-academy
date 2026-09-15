import { notFound } from 'next/navigation'
import RoleGateway from '@/components/auth/RoleGateway'

type Props = { params: Promise<{ language: string }> }

export default async function CourseEntryPage({ params }: Props) {
  const { language } = await params
  if (language !== 'fi' && language !== 'sv') notFound()
  return <RoleGateway courseLanguage={language} />
}

