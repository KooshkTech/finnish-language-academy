'use client'

import { Analytics } from '@vercel/analytics/next'
import { useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'

const STORAGE_KEY = 'opiope_cookie_consent_v1'
const CONSENT_EVENT = 'opiope:consent-changed'
type Consent = 'all' | 'essential' | null

function readConsent(): Consent { if (typeof window === 'undefined') return null; const saved = window.localStorage.getItem(STORAGE_KEY); return saved === 'all' || saved === 'essential' ? saved : null }
function subscribe(onStoreChange: () => void) { if (typeof window === 'undefined') return () => undefined; window.addEventListener(CONSENT_EVENT, onStoreChange); window.addEventListener('storage', onStoreChange); return () => { window.removeEventListener(CONSENT_EVENT, onStoreChange); window.removeEventListener('storage', onStoreChange) } }

export default function PrivacyRuntime() {
  const sv = usePathname().startsWith('/course/sv')
  const consent = useSyncExternalStore(subscribe, readConsent, () => null)
  function save(value: Exclude<Consent, null>) { window.localStorage.setItem(STORAGE_KEY, value); window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value })) }
  return <>{process.env.NODE_ENV === 'production' && consent === 'all' ? <Analytics /> : null}{consent === null ? <div className="cookie-banner" role="dialog" aria-label={sv ? 'Inställningar för kakor' : 'Evästeasetukset'} aria-live="polite"><div><strong>{sv ? 'Integritet först.' : 'Yksityisyys ensin.'}</strong><p>{sv ? 'OpiOpe använder nödvändig lagring för att tjänsten ska fungera. Analys aktiveras endast med ditt samtycke.' : 'OpiOpe käyttää välttämättömiä tallennuksia palvelun toimintaan. Analytiikka käynnistyy vain, jos hyväksyt sen.'} <a href={sv ? '/course/sv/privacy' : '/cookies'}>{sv ? 'Läs om integritet och kakor' : 'Lue evästeistä'}</a>.</p></div><div className="cookie-actions"><button className="outline-button" onClick={() => save('essential')}>{sv ? 'Endast nödvändiga' : 'Vain välttämättömät'}</button><button className="primary-button" onClick={() => save('all')}>{sv ? 'Godkänn analys' : 'Hyväksy analytiikka'}</button></div></div> : null}</>
}
