import { redirect } from 'next/navigation'
import { requireAdminAccess } from '@/lib/security/admin'

export default async function TeacherApplicationsAdminPage() {
  const access = await requireAdminAccess()
  if (!access.ok) redirect('/')

  const { data: applications } = await access.admin
    .from('teacher_applications')
    .select('user_id,status,course_language,created_at,reviewed_at')
    .order('created_at', { ascending: false })

  const userIds = applications?.map(item => item.user_id) ?? []
  const { data: profiles } = userIds.length
    ? await access.admin.from('profiles').select('id,display_name,username,account_mode,role').in('id', userIds)
    : { data: [] }
  const profileById = new Map((profiles ?? []).map(profile => [profile.id, profile]))

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
      <p className="eyebrow">YLLÄPITO</p>
      <h1>Opettajahakemukset</h1>
      <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        {(applications ?? []).map(application => {
          const profile = profileById.get(application.user_id)
          return (
            <article className="card" key={application.user_id} style={{ padding: 20 }}>
              <strong>{profile?.display_name ?? profile?.username ?? application.user_id}</strong>
              <p>{application.course_language === 'sv' ? 'Ruotsi' : 'Suomi'} · {application.status}</p>
              {application.status === 'pending' ? (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <form action={`/api/admin/teachers/${application.user_id}/approve`} method="post"><button type="submit">Hyväksy opettajaksi</button></form>
                  <form action={`/api/admin/teachers/${application.user_id}/reject`} method="post"><button type="submit">Hylkää</button></form>
                </div>
              ) : null}
            </article>
          )
        })}
        {!applications?.length ? <p>Ei avoimia opettajahakemuksia.</p> : null}
      </div>
    </main>
  )
}

