# Server Configuration

The Melody Auth server provides various customizable configurations. You can change the values under the `[vars]` section in the `server/wrangler.toml` file.

## AUTHORIZATION_CODE_EXPIRES_IN
- **Default:** 60 (1 minute)  
- **Description:** Determines how long the authorization code is valid before it expires.

## SPA_ACCESS_TOKEN_EXPIRES_IN
- **Default:** 1800 (30 minutes)  
- **Description:** Determines how long the access token granted for single page applications is valid before it expires.

## SPA_REFRESH_TOKEN_EXPIRES_IN
- **Default:** 604800 (7 days)
- **Description:** Determines how long the refresh token granted for single page applications is valid before it expires.

## S2S_ACCESS_TOKEN_EXPIRES_IN
- **Default:** 3600 (1 hour)
- **Description:** Determines how long the access token granted for server-to-server applications is valid before it expires.

## ID_TOKEN_EXPIRES_IN
- **Default:** 1800 (30 minutes)
- **Description:** Determines how long the ID token is valid before it expires.

## SERVER_SESSION_EXPIRES_IN
- **Default:** 1800 (30 minutes)
- **Description:** Determines how long the server session is valid before it expires. If set to 0, the server session will be disabled.

## AUTH_SERVER_URL
- **Default:** http://localhost:8787
- **Description:** The URL where you host the Melody Auth server.

## COMPANY_LOGO_URL
- **Default:** https://raw.githubusercontent.com/ValueMelody/melody-homepage/main/logo.jpg
- **Description:** The logo used for branding.

## ENABLE_SIGN_UP
- **Default:** true
- **Description:** Determines if user sign-up is allowed. If set to false, the sign-up button will be suppressed on the sign-in page.

## ENABLE_NAMES
- **Default:** true
- **Description:** Provides fields for users to enter their first and last names during sign-up. If set to false, the first and last name fields will not show up on the sign-up page.

## NAMES_IS_REQUIRED
- **Default:** false
- **Description:** Determines if users are required to provide their first and last names during sign-up.

## ENABLE_USER_APP_CONSENT
- **Default:** true
- **Description:** Requires users to consent to grant access to each app after authentication.

## ENABLE_EMAIL_VERIFICATION
- **Default:** true
- **Description:** If set to true, users will receive an email to verify their email address after signing up. (To enable email functionality, you need to set valid `SENDGRID_API_KEY` and `SENDGRID_SENDER_ADDRESS` environment variables first.)
