import { NextResponse } from 'next/server'
import { requireAdminAccess } from '@/lib/security/admin'

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  const access = await requireAdminAccess()
  if (!access.ok) return NextResponse.json({ error: 'Ei käyttöoikeutta.' }, { status: access.reason === 'not-configured' ? 503 : 403 })
  const { userId } = await context.params

  const { data, error } = await access.admin.rpc('reject_teacher_application', {
    p_user_id: userId,
    p_admin_user_id: access.userId,
  })

  if (error) return NextResponse.json({ error: 'Hakemuksen hylkäys epäonnistui.' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Avoimen opettajahakemuksen tietoja ei löytynyt.' }, { status: 404 })
  return NextResponse.redirect(new URL('/admin/teachers', request.url), 303)
}

