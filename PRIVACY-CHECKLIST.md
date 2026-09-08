# OpiOpe privacy/GDPR production checklist

Technical privacy controls are implemented, but production compliance depends on actual operations and vendors.

## Before publication

- Set the official `NEXT_PUBLIC_CONTROLLER_NAME`.
- Set a monitored `NEXT_PUBLIC_PRIVACY_EMAIL`.
- Document retention periods/criteria.
- Maintain the real subprocessor/vendor list (Supabase, Vercel, future AI/speech/payment providers).
- Review DPAs and international-transfer safeguards.
- Complete legitimate-interest or DPIA documentation when legally required.
- Do not collect sensitive health/immigration/legal data merely because lessons discuss those topics.
- Review child-user handling if the service is intentionally offered to children.

## Consent

Optional analytics is consent-gated. New non-essential analytics, marketing, AI, speech or embedded-media tracking must not load before the required choice.

## Data rights

`/account/privacy` exposes export and deletion UI. It requires the `account-data` Supabase Edge Function to be deployed and authenticated.

## Security

- Never expose `SUPABASE_SERVICE_ROLE_KEY` through `NEXT_PUBLIC_*` variables.
- Keep RLS enabled.
- Verify User A cannot access User B data.
- Avoid unnecessary logging of lesson/AI text.
