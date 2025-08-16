# Authentication

Melody Auth provides multiple authentication methods to suit different integration needs:

- **PKCE Flow** (Proof Key for Code Exchange) - The **default and recommended** OAuth 2.0 authorization code flow for frontend applications
- **Embedded Authentication Flow** - Direct API integration for custom authentication experiences

## What is PKCE?

**PKCE** (Proof Key for Code Exchange) is a security extension to the OAuth 2.0 Authorization Code Flow designed to enhance security for public clients, such as single-page applications (SPAs) and mobile apps, that cannot securely store client secrets.

PKCE introduces a dynamically generated, one-time-use secret called a **code verifier** that is used to secure the authorization code exchange process. This eliminates the need for client secrets in public clients while maintaining security.

## Security Benefits

- **Prevents Authorization Code Interception**: Even if an attacker intercepts the authorization code, they cannot exchange it for tokens without the original code verifier
- **Eliminates Client Secret Requirements**: Public clients can securely authenticate without storing sensitive secrets
- **Mitigates CSRF Attacks**: Binds the authorization request to the specific client that initiated it
- **Protects Against Code Injection**: Ensures only the legitimate client can complete the flow

## How Authentication Operations Work with PKCE

All authentication operations follow the same PKCE flow pattern but differ in the authentication step:

### Standard PKCE Flow Process

1. **Client generates code verifier and challenge**
2. **User is redirected to Melody Auth with code challenge**
3. **User performs authentication operation** (varies by operation type)
4. **Authorization code is returned to client**
5. **Client exchanges code + verifier for tokens**

## Authentication Operations via PKCE

All user authentication operations in Melody Auth can be performed through the PKCE flow, including:

- **Sign-In** - Standard email/password authentication
- **Passwordless Sign-In** - Email-based authentication without passwords
- **Sign-Up** - New user registration and account creation
- **Sign-Out** - Session termination and token revocation
- **Email Verification** - Confirming user email addresses
- **Password Reset** - Secure password recovery process
- **Multi-Factor Authentication (MFA)** - Email MFA, SMS MFA, OTP MFA, Passkey authentication, and MFA management
- **Policy-Based Authentication** - Custom policies, conditional access, and step-up authentication

Each of these operations leverages the same secure PKCE authorization code flow, ensuring consistent security across all authentication scenarios.

## Authentication Methods Comparison

### PKCE Flow (Recommended)
- **Use Case**: Standard OAuth 2.0 flow with enhanced security
- **Best For**: SPAs, mobile apps, and web applications
- **Security**: Highest security with code challenge/verifier
- **Integration**: Simple with provided SDKs
- **User Experience**: Redirects to hosted authentication pages

### Embedded Authentication Flow
- **Use Case**: Custom authentication UI within your application
- **Best For**: Applications requiring full UI control
- **Security**: Direct API calls with proper token handling
- **Integration**: More complex, requires custom implementation
- **User Experience**: Seamless, no redirects required

## SDK Integration

### PKCE Flow SDKs
- [React SDK Documentation](react-sdk.md) - React hooks and components
- [Vue SDK Documentation](vue-sdk.md) - Vue 3 composables and plugins
- [Angular SDK Documentation](angular-sdk.md) - Angular services and guards
- [Web SDK Documentation](web-sdk.md) - Vanilla JavaScript implementation

### Embedded Authentication
- [Embedded Auth API Documentation](embedded-auth-api.md) - Direct API integration guide
