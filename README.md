# Melody Auth

**Melody Auth** is a turnkey authentication system leveraging Cloudflare’s infrastructure. It provides a robust and user-friendly solution for implementing your own authentication system with minimal configuration required.

## Features Supported
- OAuth 2.0 Support (Authorize, Token Exchange, Token Revoke, App Consent, App Scopes, RSA256 based JWT Authentication)
- User Authorization (Sign In, Sign Up, Sign Out, Email Verification, Password Reset, Email MFA, Brute-force Protection, Role-Based Access Control)
- Admin Panel (Manage Users, Manage Apps, Manage Scopes, Manage Roles)

## Why Melody Auth?

### 1. Self-Hosted
[Server Setup](https://auth.valuemelody.com/auth-server.html)
- Deploy the entire system within minutes
- Leverage Cloudflare's infrastructure to minimize DevOps overhead
- Full access to the source code

### 2. Admin Panel
[Admin Panel Setup](https://auth.valuemelody.com/admin-panel.html)
- Web interface for managing apps, users, scopes, and roles
- Serves as a simple implementation example using the React SDK and Server-to-Server REST API

### 3. React SDK
[React SDK Guidance](https://auth.valuemelody.com/react-sdk.html)
- Enables smooth integration between React applications and the authentication server
- Implements Proof Key for Code Exchange (PKCE) for enhanced security

### 4. Server-to-Server REST API
[Rest API Swagger](https://auth-server.valuemelody.com/api/v1/swagger)
- Secure communication channel for backend services using client credentials token exchange flow
- Provides functionalities for managing apps, users, scopes, and roles with scope protection

## License

This project is licensed under the MIT License. See the LICENSE file for details.
