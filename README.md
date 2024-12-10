# Melody Auth

**Melody Auth** is turnkey OAuth & authentication system that can be seamlessly deployed on Cloudflare’s infrastructure, utilizing Workers, D1, and KV, or self-hosted with Node.js, Redis, and PostgreSQL. It provides a robust and user-friendly solution for implementing and hosting your own oauth and authentication system with minimal configuration required.

## Why Melody Auth?

### 1. Self-Controlled
[Server Setup (Cloudflare)](https://auth.valuemelody.com/auth-server.html#environment-setup-cloudflare)  
[Server Setup (Node)](https://auth.valuemelody.com/auth-server.html#environment-setup-node)  
[Mailer Setup](https://auth.valuemelody.com/auth-server.html#mailer-setup)  
[SMS Setup](https://auth.valuemelody.com/auth-server.html#sms-setup)  
[Configurations](https://auth.valuemelody.com/auth-server.html#additional-configs)
- Deploy the entire system within minutes, either using Cloudflare’s infrastructure or self-hosted with Node.js, Redis, and PostgreSQL.
- Minimize DevOps overhead by leveraging Cloudflare, or maintain full control with a self-hosted solution.
- Full access to the source code for customization and scalability.

### 2. Admin Panel
[Admin Panel Setup](https://auth.valuemelody.com/admin-panel.html)
- Web interface for managing apps, users, scopes, and roles
- Serves as a simple implementation example using the React SDK and Server-to-Server REST API

### 3. Server-to-Server REST API
[REST API Swagger](https://auth-server.valuemelody.com/api/v1/swagger)
- Secure communication channel for backend services using client credentials token exchange flow
- Provides functionalities for managing apps, users, scopes, and roles with scope protection

### 4. React SDK
[React SDK Guidance](https://auth.valuemelody.com/react-sdk.html)
- Enables smooth integration between React applications and the authentication server
- Implements Proof Key for Code Exchange (PKCE) for enhanced security

## Features Supported
- <b>OAuth 2.0</b>:
  - Authorize
  - Token Exchange
  - Refresh Token Revoke
  - App Consent
  - App Scopes
  - User Info Retrieval
  - openid-configuration
- <b>Authorization</b>:
  - Sign-In
  - Sign-Up
  - Sign-Out
  - Email Verification
  - Password Reset
  - Role-Based Access Control (RBAC)
  - Account Linking
  - Localization [How to support a new locale](https://auth.valuemelody.com/q_a.html#how-to-support-a-new-locale)
- <b>Social Sign-In</b>:
  - Google Sign-In
  - Facebook Sign-In
  - GitHub Sign-In
- <b>Multi-Factor Authentication</b> [How to setup MFA](https://auth.valuemelody.com/q_a.html#how-to-setup-mfa):
  - Email MFA
  - OTP MFA
  - SMS MFA
  - MFA Enrollment
- <b>Policy</b> [How to trigger a different policy](https://auth.valuemelody.com/q_a.html#how-to-trigger-a-different-policy)
  - sign_in_or_sign_up
  - change_password
  - change_email
  - reset_mfa
- <b>Mailer Option</b>:
  - SendGrid
  - Mailgun
  - Brevo
  - STMP (Node.js environment only)
- <b>SMS Option</b>:
  - Twilio
- <b>JWT Authentication</b>:
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
  - Email Logs
  - SMS Logs
  - Sign-in Logs
- <b>S2S REST API & Admin Panel</b>:
  - Manage Users
  - Manage Apps
  - Manage Scopes
  - Manage Roles
  - View Logs
  - Localization

### Screenshots
[Authorization Screenshots](https://auth.valuemelody.com/screenshots.html#identity-pages-and-emails)  
[Admin Panel Screenshots](https://auth.valuemelody.com/screenshots.html#admin-panel-pages)  

## License

This project is licensed under the MIT License. See the LICENSE file for details.
