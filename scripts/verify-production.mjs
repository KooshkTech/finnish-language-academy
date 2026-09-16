const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_CONTROLLER_NAME',
  'NEXT_PUBLIC_PRIVACY_EMAIL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RATE_LIMIT_PEPPER',
]

const missing = []
for (const key of required) {
  const value = process.env[key]
  if (!value || /YOUR_|example\.com|placeholder/i.test(value)) missing.push(key)
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
}

const site = process.env.NEXT_PUBLIC_SITE_URL ?? ''
if (site && !site.startsWith('https://') && !site.startsWith('http://localhost')) {
  console.error(`FAIL NEXT_PUBLIC_SITE_URL must use HTTPS in production: ${site}`)
  process.exitCode = 1
}

if (missing.length) {
  console.error('FAIL missing or placeholder production environment values:')
  missing.forEach((key) => console.error(`- ${key}`))
  process.exitCode = 1
} else {
  console.log('PASS required production environment values are present.')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (process.argv.includes('--network') && supabaseUrl && publicKey) {
  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`, {
      headers: { apikey: publicKey },
    })
    if (!response.ok) {
      console.error(`FAIL Supabase auth health returned HTTP ${response.status}`)
      process.exitCode = 1
    } else {
      console.log('PASS Supabase auth endpoint is reachable.')
    }
  } catch (error) {
    console.error('FAIL Supabase network check failed:', error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}

