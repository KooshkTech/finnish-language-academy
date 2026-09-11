'use client'

import { Analytics } from '@vercel/analytics/next'
import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'opiope_cookie_consent_v1'
const CONSENT_EVENT = 'opiope:consent-changed'
type Consent = 'all' | 'essential' | null

function readConsent(): Consent { if (typeof window === 'undefined') return null; const saved = window.localStorage.getItem(STORAGE_KEY); return saved === 'all' || saved === 'essential' ? saved : null }
function subscribe(onStoreChange: () => void) { if (typeof window === 'undefined') return () => undefined; window.addEventListener(CONSENT_EVENT, onStoreChange); window.addEventListener('storage', onStoreChange); return () => { window.removeEventListener(CONSENT_EVENT, onStoreChange); window.removeEventListener('storage', onStoreChange) } }

export default function PrivacyRuntime() {
  const consent = useSyncExternalStore(subscribe, readConsent, () => null)
  function save(value: Exclude<Consent, null>) { window.localStorage.setItem(STORAGE_KEY, value); window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value })) }
  return <>{process.env.NODE_ENV === 'production' && consent === 'all' ? <Analytics /> : null}{consent === null ? <div className="cookie-banner" role="dialog" aria-label="Evästeasetukset" aria-live="polite"><div><strong>Yksityisyys ensin.</strong><p>OpiOpe käyttää välttämättömiä tallennuksia palvelun toimintaan. Analytiikka käynnistyy vain, jos hyväksyt sen. <a href="/cookies">Lue evästeistä</a>.</p></div><div className="cookie-actions"><button className="outline-button" onClick={() => save('essential')}>Vain välttämättömät</button><button className="primary-button" onClick={() => save('all')}>Hyväksy analytiikka</button></div></div> : null}</>
}
