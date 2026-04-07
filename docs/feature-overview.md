# Feature Overview

A consolidated reference of supported Melody Auth product capabilities and customer-visible controls, with support indicators for each access method. This overview focuses on product-facing functionality rather than low-level SDK helper APIs or deployment mechanics.

**Legend:** ✓ = Supported

---

## Authentication & Sign-In

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Password sign-in | Sign in with email and password | ✓ | | | ✓ |
| Password sign-in toggle | Enable or disable email/password sign-in independently of other sign-in methods | ✓ | | | |
| Passwordless sign-in | Sign in via a one-time code sent to email | ✓ | | | |
| Passwordless sign-in toggle | Enable or disable passwordless sign-in independently of other sign-in methods | ✓ | | | |
| Magic link sign-in | Use passwordless flow as a one-click email link instead of a code | ✓ | | | |
| Sign-up | Register a new user account | ✓ | | | ✓ |
| Sign-up toggle | Enable or disable user self-registration | ✓ | | | |
| Collect names at sign-up | Require, allow, or hide first/last name fields on the sign-up form | ✓ | | | ✓ |
| Sign-out | End the current session | ✓ | | | ✓ |
| Email verification | Require users to verify their email address after sign-up | ✓ | ✓ | ✓ | |
| Password reset | Send a reset code and let the user set a new password | ✓ | | | ✓ |
| Account linking | Link or unlink a second auth identity (e.g. social + password) to one user account | | ✓ | ✓ | |
| Social sign-in — Google | OAuth 2.0 sign-in via Google | ✓ | | | |
| Social sign-in — Facebook | OAuth 2.0 sign-in via Facebook | ✓ | | | |
| Social sign-in — GitHub | OAuth 2.0 sign-in via GitHub | ✓ | | | |
| Social sign-in — Discord | OAuth 2.0 sign-in via Discord | ✓ | | | |
| Social sign-in — Apple | OAuth 2.0 sign-in via Apple | ✓ | | | |
| OIDC SSO | Sign in through an external OpenID Connect provider | ✓ | | | |
| SAML SSO | Sign in through a configured SAML 2.0 identity provider (Node.js deployment) | ✓ | | ✓ | |

---

## Multi-Factor Authentication (MFA)

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Email MFA | Send a one-time code to the user's email as a second factor | ✓ | ✓ | ✓ | ✓ |
| OTP (TOTP) MFA | Time-based one-time password via an authenticator app | ✓ | ✓ | ✓ | ✓ |
| SMS MFA | Send a one-time code via SMS as a second factor | ✓ | ✓ | ✓ | ✓ |
| Passkeys (WebAuthn) | Enroll and verify a device-bound passkey for phishing-resistant sign-in and MFA bypass | ✓ | ✓ | ✓ | ✓ |
| Recovery codes | Generate and use a one-time backup code to recover access when MFA is unavailable | ✓ | | | ✓ |
| Remember device | Skip MFA on subsequent logins from a trusted device for 30 days | ✓ | | | ✓ |
| Enforce one MFA enrollment | Require users to enroll at least one MFA method before completing sign-in | ✓ | | | |
| Email MFA as backup | Allow email MFA as a fallback when the primary MFA method is unavailable | ✓ | | | ✓ |
| App-level MFA configuration | Override MFA requirements and email-backup behavior per application | | ✓ | ✓ | |
| MFA enrollment prompt | Guide users through MFA setup as part of the auth flow | ✓ | | | ✓ |

---

## OAuth 2.0 & Token Management

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Authorization code flow (PKCE) | Issue an authorization code that is exchanged for tokens, with PKCE protection | ✓ | | | |
| Token exchange | Exchange an authorization code for access, refresh, and ID tokens | ✓ | | | ✓ |
| Token refresh | Use a refresh token to obtain a new access token | ✓ | | | ✓ |
| Popup authorize | Open the authorize flow in a popup window instead of a redirect | ✓ | | | |
| Token revocation | Revoke an active refresh token | ✓ | | | |
| Client credentials grant | Issue an access token directly to a server application using client ID + secret | | ✓ | | |
| App consent & scopes | Prompt users to approve the scopes an application is requesting | ✓ | ✓ | | ✓ |
| UserInfo endpoint | Return authenticated user profile data from an access token | ✓ | | | |
| OpenID configuration | Expose a `.well-known` discovery document for OpenID Connect clients | ✓ | | | |
| JWKS endpoint | Expose the public keys used to verify JWTs | ✓ | | | |
| JWT secret rotation | Replace the active JWT signing secret with zero downtime | | ✓ | | |
| Active sessions — list | List all active refresh token sessions for a user | | ✓ | ✓ | |
| Active sessions — revoke | Revoke a specific active session for a user | | ✓ | ✓ | |
| Token lifetime configuration | Configure expiry durations for auth codes, access tokens, refresh tokens, ID tokens, and server sessions | ✓ | ✓ | | |

---

## User Management

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| List users | Retrieve a paginated, searchable list of users | | ✓ | ✓ | |
| Get user | Fetch full profile details for a single user | | ✓ | ✓ | |
| Update user | Modify user profile fields (name, email, locale, org, roles, attributes, etc.) | | ✓ | ✓ | |
| Delete user | Permanently remove a user account | | ✓ | ✓ | |
| User activation | Activate or deactivate a user account to allow or block future sign-ins | | ✓ | ✓ | |
| Verification email resend | Send a fresh verification email to an unverified user | | ✓ | ✓ | |
| Locked IP — list | View IP addresses locked out for a user due to brute-force protection | | ✓ | ✓ | |
| Locked IP — unlock | Clear all locked IPs for a user | | ✓ | ✓ | |
| Consented apps — list | View the apps a user has granted consent to | | ✓ | ✓ | |
| Consented apps — revoke | Remove a user's consent for a specific app | | ✓ | ✓ | |
| Passkey management | List and remove passkeys registered to a user | | ✓ | ✓ | |
| MFA management | Enroll or remove email, OTP, and SMS MFA methods for a user | | ✓ | ✓ | |
| User invite | Send an invitation email to a new user; the user sets a password to activate their account | | ✓ | ✓ | |
| Reinvite user | Resend the invitation email with a fresh token and extended expiration | | ✓ | ✓ | |
| Revoke invitation | Cancel a pending invitation before the user accepts it | | ✓ | ✓ | |
| Impersonation | Generate a token that allows an admin to act as another user | | ✓ | ✓ | |

---

## Role-Based Access Control (RBAC)

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Role CRUD | Create, read, update, and delete roles | | ✓ | ✓ | |
| Assign role to user | Grant a role to a specific user | | ✓ | ✓ | |
| Remove role from user | Revoke a role from a specific user | | ✓ | ✓ | |
| List users by role | Retrieve all users assigned to a specific role | | ✓ | ✓ | |
| Roles in JWT | Include the user's roles as a claim in issued access and ID tokens | ✓ | | | ✓ |

---

## Admin Panel Access Control

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Admin panel role gate | Restrict admin panel sign-in to allowed roles; by default only `super_admin` can sign in | | | ✓ | |
| Custom admin permissions | Allow custom admin roles with scoped read/write access by resource plus optional impersonation and SAML-management privileges | | | ✓ | |

---

## Organizations

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Org CRUD | Create, read, update, and delete organizations | | ✓ | ✓ | |
| Multiple org memberships | Allow a user to belong to more than one organization at the same time | | ✓ | ✓ | |
| User org memberships — list/update | Retrieve and update the organizations a user belongs to | | ✓ | ✓ | |
| Active org — set | Set a user's active organization from among their memberships | | ✓ | ✓ | |
| List org active users | Retrieve users who are currently active members of an organization | | ✓ | ✓ | |
| List all org users | Retrieve all users ever associated with an organization, including inactive members | | ✓ | ✓ | |
| Org public registration | Allow or block self-service registration for a specific organization | ✓ | ✓ | ✓ | ✓ |
| Branding-only org mode | Apply an org's branding during auth without adding the user as an org member | ✓ | ✓ | ✓ | ✓ |
| Org switch at sign-in | Let users select which org to sign into when they belong to multiple orgs | ✓ | | | ✓ |
| Org in JWT | Include the user's active org as a claim in issued tokens | ✓ | | | ✓ |

---

## Organization Groups

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Org group CRUD | Create, read, update, and delete groups within an organization | | ✓ | ✓ | |
| Assign user to org group | Add a user to an org group | | ✓ | ✓ | |
| Remove user from org group | Remove a user from an org group | | ✓ | ✓ | |
| Multiple org-group memberships | Allow a user to belong to more than one group within an organization | | ✓ | ✓ | |
| List users in org group | Retrieve or filter to all users belonging to a specific org group | | ✓ | ✓ | |

---

## User Attributes

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Attribute definition CRUD | Define custom fields to capture on users (text, boolean, etc.) | | ✓ | ✓ | |
| Attribute labels & validation locales | Localize attribute labels and validation notes per language | | ✓ | ✓ | |
| Collect attributes at sign-up | Render optional or required custom attribute fields on the sign-up form | ✓ | | | ✓ |
| Attribute validation & uniqueness | Enforce regex and unique-value rules for custom attributes during sign-up | ✓ | ✓ | ✓ | ✓ |
| Update attribute values | Allow users to update their custom attribute values via the update_info policy | ✓ | | | |
| Attributes in JWT | Embed user attribute values as claims in issued tokens | ✓ | | | ✓ |
| Attributes in UserInfo | Return selected user attribute values from the `/userinfo` endpoint | ✓ | | | |

---

## Policies

Policies allow you to route users to specific auth flows without changing application logic. Trigger via the `policy` query parameter on the authorize URL or via the SDK `loginRedirect` helper.

| Policy | Description | OAuth Server | S2S | Admin Panel | Embedded |
|--------|-------------|:---:|:---:|:---:|:---:|
| `sign_in_or_sign_up` | Default flow — sign in or register | ✓ | | | |
| `update_info` | Let users update their profile information | ✓ | | | |
| `change_password` | Let users change their password (requires `ENABLE_PASSWORD_RESET=true`) | ✓ | | | |
| `change_email` | Let users change their email address (requires `ENABLE_EMAIL_VERIFICATION=true`) | ✓ | | | |
| `reset_mfa` | Let users reset their enrolled MFA method | ✓ | | | |
| `change_org` | Let users switch their active organization (requires `ENABLE_ORG=true` and the policy not be blocked) | ✓ | | | |
| `manage_passkey` | Let users add or remove passkeys (requires `ALLOW_PASSKEY_ENROLLMENT=true`) | ✓ | | | |
| `manage_recovery_code` | Let users view or regenerate their MFA recovery code (requires `ENABLE_RECOVERY_CODE=true`) | ✓ | | | |
| `saml_sso_[idp_name]` | Initiate sign-in via a named SAML identity provider | ✓ | | | |
| `oidc_sso_[provider_name]` | Initiate sign-in via a named OIDC provider | ✓ | | | |
| Blocked policies | Disable specific policies from being triggered via configuration | ✓ | | | |

---

## App & Scope Management

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| App CRUD | Register, read, update, activate/deactivate, and delete OAuth client applications (SPA or S2S) | | ✓ | ✓ | |
| Scope CRUD | Create, read, update, and delete OAuth scopes | | ✓ | ✓ | |
| Consent toggle | Enable or disable the user consent screen globally | ✓ | | | |
| Scope locales | Add translated display names for scopes shown on the consent screen | | ✓ | ✓ | |
| App banners — manage | Create, localize, activate, and assign typed notification banners for an application | | ✓ | ✓ | |
| App banners — display | Retrieve active banners to display within the auth flow, with locale fallback support | ✓ | | | ✓ |

---

## Branding & Localization

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Company logo | Show a custom logo on all hosted auth pages and emails | ✓ | | | |
| Email logo | Use a separate logo specifically in transactional emails | ✓ | | | |
| Custom colors / theme | Override the primary and secondary brand colors on auth pages | ✓ | | | |
| Custom fonts / typography | Override auth-page fonts and font asset URLs | ✓ | | | |
| Localization | Translate hosted auth UI strings and transactional emails into supported languages | ✓ | | | |
| Locale selector | Show a language picker on auth pages so users can switch locales | ✓ | | | |
| Terms of Service link | Show a link to your Terms of Service on auth pages | ✓ | | | |
| Privacy Policy link | Show a link to your Privacy Policy on auth pages | ✓ | | | |
| Email sender name | Customize the sender name used in transactional emails | ✓ | | | ✓ |
| Org branding override | Apply per-org logo, email logo, colors, fonts, sender name, and legal links during org-branded auth flows | ✓ | ✓ | ✓ | |

---

## Security & Brute-Force Protection

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Login attempt lockout | Lock a user's account after too many failed sign-in attempts | ✓ | | | |
| Unlock via password reset | Automatically unlock a locked account when the user resets their password | ✓ | | | |
| Password reset rate limit | Limit how many password reset emails can be sent in a window | ✓ | | | |
| Email MFA rate limit | Limit how many email MFA codes can be sent in a window | ✓ | | | |
| SMS MFA rate limit | Limit how many SMS MFA codes can be sent in a window | ✓ | | | |
| Change-email rate limit | Limit how many change-email verification emails can be sent in a window | ✓ | | | |
| View locked IPs | Inspect which IPs are currently locked for a user | | ✓ | ✓ | |
| Unlock IPs | Clear all IP locks for a user | | ✓ | ✓ | |
| Embedded auth origin allowlist | Restrict which browser origins can call embedded auth APIs via `EMBEDDED_AUTH_ORIGINS` | ✓ | | | ✓ |
| Server-side sessions | Encrypted cookie sessions with configurable expiry for server-rendered flows | ✓ | | | |

---

## Logging & Monitoring

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Per-log-type enablement | Enable email, SMS, and sign-in logs independently | ✓ | | | |
| Email logs — view | List and inspect outbound email records | | ✓ | ✓ | |
| Email logs — delete | Remove email log entries older than a given date | | ✓ | ✓ | |
| SMS logs — view | List and inspect outbound SMS records | | ✓ | ✓ | |
| SMS logs — delete | Remove SMS log entries older than a given date | | ✓ | ✓ | |
| Sign-in logs — view | List and inspect user sign-in events and related client/IP metadata | | ✓ | ✓ | |
| Sign-in logs — delete | Remove sign-in log entries older than a given date | | ✓ | ✓ | |
| Configurable log levels | Set the log verbosity (silent, info, warn, error) for request logging | ✓ | | | |

---

## External Identity Providers

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| SAML IdP CRUD | Configure, activate/deactivate, and manage SAML 2.0 identity providers with attribute mapping (Node.js deployment) | | ✓ | ✓ | |
| OIDC provider config | Configure one or more named external OpenID Connect providers for sign-in buttons and policy-based routing | ✓ | | | |
| Social provider config | Enable Google, Facebook, GitHub, Discord, and Apple via `wrangler.toml` | ✓ | | | |

---

## Email & SMS Delivery

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| SendGrid | Send transactional emails via SendGrid | ✓ | | | ✓ |
| Mailgun | Send transactional emails via Mailgun | ✓ | | | ✓ |
| Brevo | Send transactional emails via Brevo | ✓ | | | ✓ |
| Resend | Send transactional emails via Resend | ✓ | | | ✓ |
| Postmark | Send transactional emails via Postmark | ✓ | | | ✓ |
| SMTP | Send transactional emails via any SMTP server (Node.js only) | ✓ | | | ✓ |
| Welcome email | Replace the verification email with a welcome email after sign-up when configured | ✓ | | | ✓ |
| Twilio SMS | Send one-time codes via Twilio SMS | ✓ | | | ✓ |
| Dev mode routing | Route all outbound emails and SMS to a designated dev address for safe testing | ✓ | | | |

---

## SDKs & Client Libraries

| SDK | Description | Notable capabilities |
|-----|-------------|----------------------|
| React SDK | React hooks and provider for authentication flows | Redirect and popup login, policy/org/locale parameters, token refresh, user info helpers |
| Vue SDK | Vue composables and plugin for authentication flows | Redirect and popup login, token refresh, user info helpers |
| Angular SDK | Angular service and provider for authentication flows | Redirect and popup login, token refresh, user info helpers |
| Web (vanilla JS) SDK | Framework-agnostic JavaScript SDK for browser authentication flows | Redirect and popup login, auth-code exchange, token refresh, user info, logout helpers |
| Next.js SDK | Next.js-optimized SDK with server and client helpers | Cookie storage, middleware protection, SSR session helpers, auth wrappers |

---

## Extensibility

Server-side hooks are async functions defined in `server/src/hooks/` that execute at key points in the auth flow. They can be used to add custom business logic, logging, or side effects without modifying core server code.

| Hook | Trigger point |
|------|---------------|
| `preSignUp` / `postSignUp` | Before and after a new user account is created |
| `preSignIn` / `postSignIn` | Before and after a user successfully signs in |
| `preTokenExchangeWithAuthCode` / `postTokenExchangeWithAuthCode` | Before and after an authorization code is exchanged for tokens |
| `preTokenClientCredentials` / `postTokenClientCredentials` | Before and after a client credentials token is issued |

---

## Developer Tools

| Tooling | Description |
|---------|-------------|
| Swagger UI (S2S) | Interactive API documentation for server-to-server endpoints |
| Swagger UI (Embedded) | Interactive API documentation for embedded auth endpoints |
| Configuration info endpoint | Public `/info` endpoint exposing feature flags and client configuration |
| Dashboard — config viewer | Admin panel page showing all active server configuration values and quick links to well-known, Swagger, and `/info` endpoints |
| Admin account self-service | Admin panel page for the signed-in administrator to update profile, change password/email, reset MFA, manage passkeys, and manage recovery codes |

---

## Deployment & Infrastructure

Production deployment choices only. Local development workflows, Docker setups, and CI/CD automation are intentionally omitted here.

| Production option | Description |
|-------------------|-------------|
| Auth server — Cloudflare Workers + D1 + KV | Default managed production deployment on Cloudflare Workers using D1 (SQLite) for data and KV for secret/runtime storage |
| Auth server — Cloudflare Workers + PostgreSQL | Cloudflare Workers production deployment using `nodejs_compat` and PostgreSQL instead of the default D1-backed setup |
| Auth server — Cloudflare multi-environment rollout | Separate Wrangler configs and Cloudflare resources can be used for staging, QA, demo, and production environments |
| Auth server — Self-hosted Node.js + PostgreSQL + Redis | Production deployment of the auth server as a Node.js application outside Cloudflare |
| Admin panel — Standard Next.js / Node.js hosting | Production deployment of the admin panel as a regular Next.js application in a Node-compatible hosting environment |
| Admin panel — Cloudflare Workers | Production deployment of the admin panel to Cloudflare Workers via OpenNext; when both admin panel and auth server run on Cloudflare, custom domains or separate accounts may be required |
| Admin panel — Vercel | Production deployment of the admin panel to Vercel with the documented environment-variable setup |
