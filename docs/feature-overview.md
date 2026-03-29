# Feature Overview

A comprehensive reference of all Melody Auth features, with support indicators for each access method.

**Legend:** ✓ = Supported

---

## Authentication & Sign-In

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Password sign-in | Sign in with email and password | ✓ | | | ✓ |
| Passwordless sign-in | Sign in via a one-time code sent to email | ✓ | | | |
| Magic link sign-in | Use passwordless flow as a one-click email link instead of a code | ✓ | | | |
| Sign-up | Register a new user account | ✓ | | | ✓ |
| Sign-up toggle | Enable or disable user self-registration | ✓ | | | |
| Collect names at sign-up | Require, allow, or hide first/last name fields on the sign-up form | ✓ | | | ✓ |
| Sign-out | End the current session | ✓ | | | ✓ |
| Email verification | Require users to verify their email address after sign-up | ✓ | ✓ | ✓ | |
| Password reset | Send a reset code and let the user set a new password | ✓ | | | ✓ |
| Account linking | Link or unlink multiple auth identities (e.g. social + password) to one user | | ✓ | ✓ | |
| Social sign-in — Google | OAuth 2.0 sign-in via Google | ✓ | | | |
| Social sign-in — Facebook | OAuth 2.0 sign-in via Facebook | ✓ | | | |
| Social sign-in — GitHub | OAuth 2.0 sign-in via GitHub | ✓ | | | |
| Social sign-in — Discord | OAuth 2.0 sign-in via Discord | ✓ | | | |
| Social sign-in — Apple | OAuth 2.0 sign-in via Apple | ✓ | | | |
| OIDC SSO | Sign in through an external OpenID Connect provider | ✓ | | | |
| SAML SSO | Sign in through a SAML 2.0 identity provider | ✓ | | ✓ | |

---

## Multi-Factor Authentication (MFA)

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Email MFA | Send a one-time code to the user's email as a second factor | ✓ | ✓ | ✓ | ✓ |
| OTP (TOTP) MFA | Time-based one-time password via an authenticator app | ✓ | ✓ | ✓ | ✓ |
| SMS MFA | Send a one-time code via SMS as a second factor | ✓ | ✓ | ✓ | ✓ |
| Passkeys (WebAuthn) | Register and verify a device-bound passkey as a second factor | ✓ | ✓ | ✓ | ✓ |
| Recovery codes | Generate a one-time backup code to bypass MFA if locked out | ✓ | | | ✓ |
| Remember device | Skip MFA on subsequent logins from a trusted device | ✓ | | | |
| Enforce one MFA enrollment | Require users to enroll at least one MFA method before completing sign-in | ✓ | | | |
| Email MFA as backup | Allow email MFA as a fallback when the primary MFA method is unavailable | ✓ | | | |
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
| Update user | Modify user profile fields (name, email, roles, etc.) | | ✓ | ✓ | |
| Delete user | Permanently remove a user account | | ✓ | ✓ | |
| Locked IP — list | View IP addresses locked out for a user due to brute-force protection | | ✓ | ✓ | |
| Locked IP — unlock | Clear all locked IPs for a user | | ✓ | ✓ | |
| Consented apps — list | View the apps a user has granted consent to | | ✓ | ✓ | |
| Consented apps — revoke | Remove a user's consent for a specific app | | ✓ | ✓ | |
| Passkey management | List and remove passkeys registered to a user | | ✓ | ✓ | |
| MFA management | Enroll or remove email, OTP, and SMS MFA methods for a user | | ✓ | ✓ | |
| Impersonation | Generate a token that allows an admin to act as another user | | ✓ | ✓ | |

---

## Role-Based Access Control (RBAC)

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Role CRUD | Create, read, update, and delete roles | | ✓ | ✓ | |
| Assign role to user | Grant a role to a specific user | | ✓ | ✓ | |
| Remove role from user | Revoke a role from a specific user | | ✓ | ✓ | |
| Roles in JWT | Include the user's roles as a claim in issued access and ID tokens | ✓ | | | ✓ |

---

## Organizations

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Org CRUD | Create, read, update, and delete organizations | | ✓ | ✓ | |
| Assign user to org | Add or update the orgs a user belongs to | | ✓ | ✓ | |
| List org users | Retrieve users belonging to an organization | | ✓ | ✓ | |
| Org branding override | Override logo and theme colors per organization | | | ✓ | |
| SAML SSO per org | Configure a SAML IdP that is scoped to a specific organization | | | ✓ | |
| Org switch at sign-in | Let users select which org to sign into when they belong to multiple orgs | ✓ | | | ✓ |
| Org in JWT | Include the user's active org as a claim in issued tokens | ✓ | | | ✓ |

---

## Organization Groups

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Org group CRUD | Create, read, update, and delete groups within an organization | | ✓ | ✓ | |
| Assign user to org group | Add a user to an org group | | ✓ | ✓ | |
| Remove user from org group | Remove a user from an org group | | ✓ | ✓ | |

---

## User Attributes

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Attribute definition CRUD | Define custom fields to capture on users (text, boolean, etc.) | | ✓ | ✓ | |
| Collect attributes at sign-up | Render custom attribute fields on the sign-up form | ✓ | | | ✓ |
| Update attribute values | Allow users to update their custom attribute values via the update_info policy | ✓ | | | |
| Attributes in JWT | Embed user attribute values as claims in issued tokens | ✓ | | | ✓ |

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
| `change_org` | Let users switch their active organization (requires `ENABLE_ORG=true`) | ✓ | | | |
| `manage_passkey` | Let users add or remove passkeys (requires `ALLOW_PASSKEY_ENROLLMENT=true`) | ✓ | | | |
| `manage_recovery_code` | Let users view or regenerate their MFA recovery code | ✓ | | | |
| `saml_sso_[idp_name]` | Initiate sign-in via a named SAML identity provider | ✓ | | | |
| `oidc_sso_[provider_name]` | Initiate sign-in via a named OIDC provider | ✓ | | | |
| Blocked policies | Disable specific policies from being triggered via configuration | ✓ | | | |

---

## App & Scope Management

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| App CRUD | Register, read, update, and delete OAuth client applications | | ✓ | ✓ | |
| Scope CRUD | Create, read, update, and delete OAuth scopes | | ✓ | ✓ | |
| Consent toggle | Enable or disable the user consent screen globally | ✓ | | | |
| Scope locales | Add translated display names for scopes shown on the consent screen | | | ✓ | |
| App banners — manage | Create and configure notification banners for an application | | ✓ | ✓ | |
| App banners — display | Retrieve active banners to display within the auth flow | ✓ | | | ✓ |

---

## Branding & Localization

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Company logo | Show a custom logo on all hosted auth pages and emails | ✓ | | | |
| Email logo | Use a separate logo specifically in transactional emails | ✓ | | | |
| Custom colors / theme | Override the primary and secondary brand colors on auth pages | ✓ | | | |
| Localization | Translate all auth UI strings into supported languages | ✓ | | | |
| Locale selector | Show a language picker on auth pages so users can switch locales | ✓ | | | |
| Terms of Service link | Show a link to your Terms of Service on auth pages | ✓ | | | |
| Privacy Policy link | Show a link to your Privacy Policy on auth pages | ✓ | | | |
| Email sender name | Customize the sender name used in transactional emails | ✓ | | | ✓ |
| Org branding override | Apply per-org logo and colors when users sign in under that org | ✓ | | ✓ | |

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
| Server-side sessions | Encrypted cookie sessions with configurable expiry for server-rendered flows | ✓ | | | |

---

## Logging & Monitoring

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Email logs — view | List and inspect outbound email records | | ✓ | ✓ | |
| Email logs — delete | Remove email log entries older than a given date | | ✓ | ✓ | |
| SMS logs — view | List and inspect outbound SMS records | | ✓ | ✓ | |
| SMS logs — delete | Remove SMS log entries older than a given date | | ✓ | ✓ | |
| Sign-in logs — view | List and inspect user sign-in events | | ✓ | ✓ | |
| Sign-in logs — delete | Remove sign-in log entries older than a given date | | ✓ | ✓ | |
| Configurable log levels | Set the log verbosity (silent, info, warn, error) for request logging | ✓ | | | |

---

## External Identity Providers

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| SAML IdP CRUD | Configure and manage SAML 2.0 identity providers | | | ✓ | |
| OIDC provider config | Configure external OpenID Connect providers via `wrangler.toml` | ✓ | | | |
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
| SMTP | Send transactional emails via any SMTP server | ✓ | | | ✓ |
| Welcome email | Send a welcome email to new users after sign-up (separate from verification) | ✓ | | | ✓ |
| Twilio SMS | Send one-time codes via Twilio SMS | ✓ | | | ✓ |
| Dev mode routing | Route all outbound emails and SMS to a designated dev address for safe testing | ✓ | | | |

---

## SDKs & Client Libraries

| SDK | Description |
|-----|-------------|
| React SDK | React hooks and components for authentication flows |
| Vue SDK | Vue composables and plugin for authentication flows |
| Angular SDK | Angular service and module for authentication flows |
| Web (vanilla JS) SDK | Framework-agnostic JavaScript SDK for authentication flows |
| Next.js SDK | Next.js-optimized SDK with server and client helpers |

---

## Developer Tools

| Feature | Description | OAuth Server | S2S | Admin Panel | Embedded |
|---------|-------------|:---:|:---:|:---:|:---:|
| Swagger UI (S2S) | Interactive API documentation for server-to-server endpoints | | ✓ | | |
| Swagger UI (Embedded) | Interactive API documentation for embedded auth endpoints | | | | ✓ |
| Configuration info endpoint | Public `/info` endpoint exposing feature flags and client configuration | ✓ | | | |

---

## Deployment & Infrastructure

| Feature | Description |
|---------|-------------|
| Cloudflare Workers | Deploy on Cloudflare Workers with D1 (SQLite) and KV storage |
| Self-hosted Node.js | Deploy as a Node.js server with PostgreSQL and Redis |
