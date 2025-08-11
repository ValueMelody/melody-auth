# Branding

Customize the look and feel of the hosted authorization (identity) pages and email templates.

## What you can customize
- Logo and email logo: `COMPANY_LOGO_URL`, `COMPANY_EMAIL_LOGO_URL`
- Font: `fontFamily`, `fontUrl`
- Colors:
  - `layoutColor`, `labelColor`
  - `primaryButtonColor`, `primaryButtonLabelColor`, `primaryButtonBorderColor`
  - `secondaryButtonColor`, `secondaryButtonLabelColor`, `secondaryButtonBorderColor`
  - `criticalIndicatorColor`
- Footer links: `termsLink`, `privacyPolicyLink`

These values are consumed by the identity page layout and components. For example, `layoutColor` controls the page background, `labelColor` controls text color, and the button colors drive the primary/secondary action styles.

## Global defaults (all clients)
There are two places to configure global branding:

1) Edit defaults in code
- File: `server/src/configs/variable.ts`
- Update the `DefaultBranding` enum values to set global defaults for fonts and colors.

2) Set logo and legal links via environment variables
- File: `server/wrangler.toml` → `[vars]`
- Set:
  - `COMPANY_LOGO_URL`
  - `COMPANY_EMAIL_LOGO_URL`
  - `TERMS_LINK`
  - `PRIVACY_POLICY_LINK`

After changes, redeploy or restart the server.

## Per-organization branding
Override branding for specific organizations (tenants/clients):

1) Enable organizations
- In `server/wrangler.toml`, set `ENABLE_ORG = true` under `[vars]`.

2) Create an org and set branding
- Open the Admin Panel.
- Go to the `Orgs` tab.
- Create a new organization with a unique slug.
- Configure the org's branding (logo, colors, fonts, links).

3) Route users to the org-branded pages
- Add the organization slug to your authorization redirect URL as a query string: `org=<slug>`
- Example: `https://your-auth-server/identity/v1/authorize?client_id=...&redirect_uri=...&response_type=code&org=acme`

### Frontend SDK example

If you are using the Frontend SDK, pass the `org` parameter to `loginRedirect` (or `loginPopup`):

```tsx
import { useAuth } from '@melody-auth/react'

export default function SignInButton() {
  const { isAuthenticated, loginRedirect } = useAuth()

  const signInAcme = () => {
    loginRedirect({ org: 'acme' })
  }

  if (isAuthenticated) return null
  return <button onClick={signInAcme}>Sign in to Acme</button>
}
```

If an org is specified and public registration is allowed for it, the values you set for that org override the global defaults on the identity pages and emails.
