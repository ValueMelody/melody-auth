# Melody Auth

**Melody Auth** is a user-friendly, robust solution for implementing and hosting your own OAuth and authentication system.
- Deploy to **Cloudflare** using **Workers, D1, and KV** in just minutes — minimizing infrastructure and DevOps overhead.
- **Self-Host** with **Node.js, Redis, and PostgreSQL** — giving you full control over your data and infrastructure.

[![codecov](https://codecov.io/gh/ValueMelody/melody-auth/graph/badge.svg?token=AB3C1DCJJM)](https://codecov.io/gh/ValueMelody/melody-auth)

## What's included?
- Complete **OAuth & Authentication Server**
  - [Auth Server Setup Doc](https://auth.valuemelody.com/auth-server-setup.html)
  - [Auth Server Configuration Doc](https://auth.valuemelody.com/auth-server-configuration.html)
- **Server-to-Server REST API** for backend integrations
  - [Swagger API Doc](https://auth-server.valuemelody.com/api/v1/swagger)
  - [S2S API Doc](https://auth.valuemelody.com/s2s-api.html)
- **React/Vue SDK** to seamlessly integrate authentication into your frontend
  - [React NPM Package](https://www.npmjs.com/package/@melody-auth/react)
  - [React SDK Doc](https://auth.valuemelody.com/react-sdk.html)
  - [Vue NPM Package](https://www.npmjs.com/package/@melody-auth/vue)
  - [Vue SDK Doc](https://auth.valuemelody.com/vue-sdk.html)
- **Admin Panel** for managing resources (also serves as a full-stack implementation example)
  - [Admin Panel Setup Doc](https://auth.valuemelody.com/admin-panel-setup.html)

## Auth Server Features Supported
- <b>OAuth 2.0</b>:
  - Authorize
  - Token Exchange
  - Refresh Token Revoke
  - App Consent
  - App Scopes
  - User Info Retrieval
  - OpenID Configuration
- <b>Authorization</b>:
  - Sign-In
  - Passwordless Sign-In
  - Sign-Up
  - Sign-Out
  - Email Verification
  - Password Reset
  - Role-Based Access Control
  - Account Linking
  - Localization [How to support a new locale](https://auth.valuemelody.com/q_a.html#how-to-support-a-new-locale)
- <b>Social Sign-In</b>:
  - Google Sign-In
  - Facebook Sign-In
  - GitHub Sign-In
- <b>Multi-Factor Authentication [How to setup MFA](https://auth.valuemelody.com/q_a.html#how-to-setup-mfa)</b>
  - Email MFA
  - OTP MFA
  - SMS MFA
  - MFA Self Enrollment
  - Passkey Enrollment
- <b>Policy [How to trigger a different policy](https://auth.valuemelody.com/q_a.html#how-to-trigger-a-different-policy)</b>
  - sign_in_or_sign_up
  - update_info
  - change_password
  - change_email
  - reset_mfa
  - manage_passkey
- <b>Organization</b>:
  - Branding config override
- <b>Mailer Option</b> [Email Provider Setup Doc](https://auth.valuemelody.com/email-provider-setup.html)
  - SendGrid
  - Mailgun
  - Brevo
  - Resend
  - SMTP (Node.js environment only)
- <b>SMS Option</b> [SMS Provider Setup Doc](https://auth.valuemelody.com/sms-provider-setup.html)
  - Twilio
- <b>JWT Authentication</b>
  - RSA256 based JWT Authentication [How to verify a SPA access token](https://auth.valuemelody.com/q_a.html#how-to-verify-a-spa-access-token)
  - JWT Secret Rotate [How to rotate JWT secret](https://auth.valuemelody.com/q_a.html#how-to-rotate-jwt-secret)
- <b>Brute-force Protection</b>:
  - Log in attempts
  - Password reset attempts
  - OTP MFA attempts
  - SMS MFA attempts
  - Email MFA attempts
  - Change Email attempts
- <b>Logging</b>:
  - Logger Level
  - Email Logs
  - SMS Logs
  - Sign-in Logs

## Admin Panel & S2S REST API Features Supported
- View Configurations
- Manage Users
- Manage Apps
- Manage Scopes
- Manage Roles
- Manage Organizations
- View Logs

## Demo & Examples
- [Vite React Example](https://github.com/ValueMelody/melody-auth/tree/main/examples/vite-react-demo)
  - [Demo Site: Password Sign-in/Sign-up with OTP MFA and Passkey enrollment](https://auth-demo.valuemelody.com)
- [Vite Vue Example](https://github.com/ValueMelody/melody-auth/tree/main/examples/vite-vue-example)
- [Next.js Full stack implementation Example](https://github.com/ValueMelody/melody-auth/tree/main/admin-panel)
- [Next.js Auth.js Example](https://github.com/ValueMelody/melody-auth/tree/main/examples/next-auth-js-example)
- [React Native Example](https://github.com/ValueMelody/melody-auth/tree/main/examples/react-native-example)

## Screenshots
[Authorization Screenshots](https://auth.valuemelody.com/screenshots.html#identity-pages-and-emails)  
[Admin Panel Screenshots](https://auth.valuemelody.com/screenshots.html#admin-panel-pages)

## License

This project is licensed under the MIT License. See the LICENSE file for details.
