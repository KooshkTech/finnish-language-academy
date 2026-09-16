import { notFound } from 'next/navigation'

export default async function CourseLanguageLayout({ children, params }: { children: React.ReactNode; params: Promise<{ language: string }> }) {
  const { language } = await params
  if (language !== 'fi' && language !== 'sv') notFound()
  return <div lang={language}>{children}</div>
}
