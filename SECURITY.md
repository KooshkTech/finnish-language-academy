# Security

- Supabase service-role credentials must never use `NEXT_PUBLIC_*`.
- Existing learner tables and the new course progress tables use RLS.
- Public curriculum policies expose only published course/lesson content.
- Admin course mutation is intentionally unavailable until a server-verified role model is implemented.
- Course exercise scoring currently runs client-side for learning feedback only; do not treat client results as tamper-proof certification or payment entitlement data.
- No official CEFR or YKI certification is claimed.

## V21 hardening
See `V21-SECURITY-HARDENING.md`. Teacher pages now require trusted `teacher_access` approval and TOTP MFA; security-sensitive endpoints have rate limiting; uploads use random storage names and file-signature validation. These controls reduce risk but do not replace production monitoring, malware scanning, incident response, backups, or periodic penetration/security testing.

