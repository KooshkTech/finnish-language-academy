export function safeInternalPath(value, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback
  try {
    const base = new URL('https://opiope.invalid')
    const resolved = new URL(value, base)
    return resolved.origin === base.origin ? `${resolved.pathname}${resolved.search}${resolved.hash}` : fallback
  } catch {
    return fallback
  }
}

