'use client'

import { Analytics } from '@vercel/analytics/next'
import { useSyncExternalStore } from 'react'

const KEY = 'opiope_cookie_consent_v1'
const EVENT = 'opiope:consent-changed'
type Consent = 'all' | 'essential' | null
function readConsent(): Consent { if (typeof window === 'undefined') return null; const value = window.localStorage.getItem(KEY); return value === 'all' || value === 'essential' ? value : null }
function subscribe(onChange: () => void) { if (typeof window === 'undefined') return () => undefined; window.addEventListener(EVENT, onChange); window.addEventListener('storage', onChange); return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener('storage', onChange) } }
export default function PrivacyRuntime() { const consent = useSyncExternalStore(subscribe, readConsent, () => null); function save(value: Exclude<Consent, null>) { window.localStorage.setItem(KEY, value); window.dispatchEvent(new Event(EVENT)) } return <>{process.env.NODE_ENV === 'production' && consent === 'all' ? <Analytics /> : null}{consent === null ? <div className="cookie-banner" role="dialog" aria-label="Evästeasetukset" aria-live="polite"><div><strong>Yksityisyys ensin.</strong><p>Välttämättömät tallennukset pitävät OpiOpen toiminnassa. Analytiikka käynnistyy vain luvallasi.</p></div><div className="cookie-actions"><button className="outline-button" onClick={() => save('essential')}>Vain välttämättömät</button><button className="primary-button" onClick={() => save('all')}>Hyväksy analytiikka</button></div></div> : null}</> }
