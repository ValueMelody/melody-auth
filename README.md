# Melody Auth

**Melody Auth** is turnkey OAuth & authentication system that can be seamlessly deployed on Cloudflare’s infrastructure, utilizing Workers, D1, and KV, or self-hosted with Node.js, Redis, and PostgreSQL. It provides a robust and user-friendly solution for implementing and hosting your own oauth and authentication system with minimal configuration required.

## Features Supported
- OAuth 2.0 Support (Authorize, Token Exchange, Token Revoke, App Consent, App Scopes, RSA256 based JWT Authentication)
- User Authorization (Sign In, Sign Up, Google Sign In, Sign Out, Email Verification, Password Reset, Email MFA, OTP MFA, MFA Enrollment, Brute-force Protection, Role-Based Access Control, Localization) [Screenshots](https://auth.valuemelody.com/screenshots.html#identity-pages-and-emails)
- S2S REST API & Admin Panel (Manage Users, Manage Apps, Manage Scopes, Manage Roles) [Screenshots](https://auth.valuemelody.com/screenshots.html#admin-panel-pages)

## Why Melody Auth?

### 1. Self-Controlled
[Server Setup (Cloudflare)](https://auth.valuemelody.com/auth-server.html#environment-setup-cloudflare)  
[Server Setup (Node)](https://auth.valuemelody.com/auth-server.html#environment-setup-node)  
[Mailer Setup](https://auth.valuemelody.com/auth-server.html#mailer-setup)
- Deploy the entire system within minutes, either using Cloudflare’s infrastructure or self-hosted with Node.js, Redis, and PostgreSQL.
- Minimize DevOps overhead by leveraging Cloudflare, or maintain full control with a self-hosted solution.
- Full access to the source code for customization and scalability.

### 2. Admin Panel
[Admin Panel Setup](https://auth.valuemelody.com/admin-panel.html)
- Web interface for managing apps, users, scopes, and roles
- Serves as a simple implementation example using the React SDK and Server-to-Server REST API

### 3. React SDK
[React SDK Guidance](https://auth.valuemelody.com/react-sdk.html)
- Enables smooth integration between React applications and the authentication server
- Implements Proof Key for Code Exchange (PKCE) for enhanced security

### 4. Server-to-Server REST API
[REST API Swagger](https://auth-server.valuemelody.com/api/v1/swagger)
- Secure communication channel for backend services using client credentials token exchange flow
- Provides functionalities for managing apps, users, scopes, and roles with scope protection

## License

This project is licensed under the MIT License. See the LICENSE file for details.
