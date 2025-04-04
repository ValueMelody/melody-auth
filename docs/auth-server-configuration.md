# Auth Server Configuration
Melody Auth offers a range of customizable options to tailor the authentication server to your specific needs. You can modify these settings by adjusting the values in the `[vars]` section of the `server/wrangler.toml` file.

## Applying Configuration Changes:
1. Open `server/wrangler.toml` in your preferred text editor.
2. Locate the `[vars]` section.
3. Modify the values as needed.
4. Save the file.
5. Redeploy or restart your server

## Information Configs

### COMPANY_LOGO_URL
- **Default:** https://raw.githubusercontent.com/ValueMelody/melody-homepage/main/logo.jpg
- **Description:** URL of the logo displayed on authentication pages.

### EMAIL_SENDER_NAME
- **Default:** "Melody Auth"
- **Description:** Display name in emails sent to users.

### TERMS_LINK
- **Default:** ""
- **Description:** URL of your Terms of Service. If set, a link to these terms is shown on the sign-up page.

### PRIVACY_POLICY_LINK
- **Default:** ""
- **Description:** URL of your Privacy Policy. If set, a link to this policy is shown on the sign-up page.


## Locale Configs

### SUPPORTED_LOCALES
- **Default:** ['en', 'fr']
- **Description:** Available locales for identity pages and email templates.

### ENABLE_LOCALE_SELECTOR
- **Default:** true
- **Description:** Determines whether users can switch locales on identity pages. If only one locale is in `SUPPORTED_LOCALES`, the selector is hidden.


## Suppression Configs

### ENABLE_SIGN_UP
- **Default:** true
- **Description:** Toggles whether new user sign-ups are allowed. If `false`, the sign-up button is hidden on the sign-in page.

### ENABLE_PASSWORD_SIGN_IN
- **Default:** true
- **Description:** Enables password-based sign-in. To restrict sign-ins to social providers only, set both `ENABLE_SIGN_UP`, `ENABLE_PASSWORD_SIGN_IN`, and `ENABLE_PASSWORD_RESET` to false.

### ENABLE_PASSWORDLESS_SIGN_IN
- **Default:** false
- **Description:** Enables passwordless sign-in. Setting this option to true will automatically override the following settings to false: ENABLE_SIGN_UP, ENABLE_PASSWORD_SIGN_IN, ENABLE_PASSWORD_RESET, ALLOW_PASSKEY_ENROLLMENT. Note that having both passwordless sign-in and Email MFA enabled at the same time may not be practical.

### ENABLE_PASSWORD_RESET
- **Default:** true
- **Description:** Enables password reset functionality. If `false`, the "Forgot Password" option is hidden.
- Requires [Email Provider Setup](https://auth.valuemelody.com/email-provider-setup.html)

### ENABLE_NAMES
- **Default:** true
- **Description:** Shows first and last name fields during sign-up. If `false`, name fields are hidden.

### NAMES_IS_REQUIRED
- **Default:** false
- **Description:** Makes first and last name fields mandatory if `ENABLE_NAMES` is `true`.

### ENABLE_USER_APP_CONSENT
- **Default:** true
- **Description:** Prompts users to grant permission to each app after authentication.

### ENABLE_EMAIL_VERIFICATION
- **Default:** true
- **Description:** Prompts users to grant permission to each app after authentication.
- Requires [Email Provider Setup](https://auth.valuemelody.com/email-provider-setup.html)

### ENABLE_ORG
- **Default:** false
- **Description:** Toggles the organization feature. If `true`, users can create and manage organizations via the S2S API and admin panel.

### BLOCKED_POLICIES
- **Default:** []
- **Description:** A list of policy names that should be blocked (change_password, change_email, reset_mfa, manage_passkey, update_info), preventing end users from triggering them

## Auth Configs

### AUTHORIZATION_CODE_EXPIRES_IN
- **Default:** 300 (5 minutes)  
- **Description:** Duration (in seconds) for which authorization codes remain valid.

### SPA_ACCESS_TOKEN_EXPIRES_IN
- **Default:** 1800 (30 minutes)  
- **Description:** Lifespan of access tokens issued to single-page applications (SPAs).

### SPA_REFRESH_TOKEN_EXPIRES_IN
- **Default:** 604800 (7 days)
- **Description:**  Lifespan of refresh tokens issued to SPAs

### S2S_ACCESS_TOKEN_EXPIRES_IN
- **Default:** 3600 (1 hour)
- **Description:** Lifespan of access tokens issued to server-to-server (S2S) applications.

### ID_TOKEN_EXPIRES_IN
- **Default:** 1800 (30 minutes)
- **Description:** Lifespan of ID tokens.

### SERVER_SESSION_EXPIRES_IN
- **Default:** 1800 (30 minutes)
- **Description:** Server session expiration time. If 0, server sessions are disabled.


## MFA Configs

### OTP_MFA_IS_REQUIRED
- **Default:** false
- **Description:** Forces users to set up TOTP-based MFA (e.g., Google Authenticator) during sign-in if `true`.

### SMS_MFA_IS_REQUIRED
- **Default:** false
- **Description:** Enables SMS-based MFA. If `true`, users must confirm logins via an SMS code.
- Requires [SMS Provider Setup](https://auth.valuemelody.com/sms-provider-setup.html)

### SMS_MFA_COUNTRY_CODE
- **Default:** "+1"
- **Description:** Prefix of the phone number to be used for SMS MFA. For example, if you are based in the United States, you should set this to "+1".

### EMAIL_MFA_IS_REQUIRED
- **Default:** false
- **Description:** Enables email-based MFA. If `true`, users must confirm logins via an email code.
- Requires [Email Provider Setup](https://auth.valuemelody.com/email-provider-setup.html)

### ENFORCE_ONE_MFA_ENROLLMENT
- **Default:** ['otp', 'email']
- **Description:** Forces enrollment in at least one MFA type from the list: ['otp', 'sms', 'email']. Only applies if all *_MFA_IS_REQUIRED settings are false. If empty, no MFA is enforced.
- Requires [Email Provider Setup](https://auth.valuemelody.com/email-provider-setup.html) if 'email' is in the list
- Requires [SMS Provider Setup](https://auth.valuemelody.com/sms-provider-setup.html) if 'sms' is in the list

### ALLOW_EMAIL_MFA_AS_BACKUP
- **Default:** true
- **Description:** Allows email-based MFA as a fallback if a user is enrolled in OTP or SMS but not in email MFA.
- Requires [Email Provider Setup](https://auth.valuemelody.com/email-provider-setup.html)

### ALLOW_PASSKEY_ENROLLMENT
- **Default:** false
- **Description:** Enables passkey enrollment. If `true`, users can enroll in passkeys during sign-up. By enroll a passkey, a user can bypass password and multi-factor authentication during sign-in.


## Brute-force Configs

### ACCOUNT_LOCKOUT_EXPIRES_IN
- **Default:** 86400 (1 day)
- **Description:** Duration (in seconds) of an account lockout after too many failed login attempts. If 0, the account remains locked until manual reset.

### UNLOCK_ACCOUNT_VIA_PASSWORD_RESET
- **Default:** true
- **Description:** Allows users to unlock their account by resetting their password.

### PASSWORD_RESET_EMAIL_THRESHOLD
- **Default:** 5
- **Description:** Maximum password reset email requests per email/IP per day. 0 means no limit.

### EMAIL_MFA_EMAIL_THRESHOLD
- **Default:** 10
- **Description:** Maximum email MFA requests per account/IP in a 30-minute window. 0 means no limit.

### CHANGE_EMAIL_EMAIL_THRESHOLD
- **Default:** 5
- **Description:** Maximum change-email requests per account in a 30-minute window. 0 means no limit.

### SMS_MFA_MESSAGE_THRESHOLD
- **Default:** 5
- **Description:** Maximum SMS MFA requests per account/IP in a 30-minute window. 0 means no limit.

### ACCOUNT_LOCKOUT_THRESHOLD
- **Default:** 5
- **Description:** Number of failed login attempts before lockout. 0 means no lockout.


## Social Sign-in Configs

### GOOGLE_AUTH_CLIENT_ID
- **Default:** undefined
- **Description:** Google Client ID (from Google Developer Console). If empty, Google Sign-In is hidden.

### FACEBOOK_AUTH_CLIENT_ID
- **Default:** undefined
- **Description:**  Facebook Client ID (from Facebook Developer Console). If empty, Facebook Sign-In is hidden.
- Note: Also need to set `FACEBOOK_AUTH_CLIENT_SECRET` in your .dev.vars or in Cloudflare Worker environment variables.

### GITHUB_AUTH_CLIENT_ID & GITHUB_AUTH_APP_NAME
- **Default:** undefined
- **Description:** GitHub Client ID and App Name (from GitHub Developer Console). If empty, GitHub Sign-In is hidden. <b>In your GitHub App settings, set the callback URL to [your auth server doamin]/identity/v1/authorize-github, e.g., http://localhost:8787/identity/v1/authorize-github</b>
- Note: Also need to set `GITHUB_AUTH_CLIENT_SECRET` in your .dev.vars or in Cloudflare Worker environment variables.

### DISCORD_AUTH_CLIENT_ID
- **Default:** undefined
- **Description:** Discord Client ID (from Discord Developer Console). If empty, Discord Sign-In is hidden. <b>In your Discord App settings, set the redirect URI to [your auth server domain]/identity/v1/authorize-discord, e.g., http://localhost:8787/identity/v1/authorize-discord</b>
- Note: Also need to set `DISCORD_AUTH_CLIENT_SECRET` in your .dev.vars or in Cloudflare Worker environment variables.

### OIDC_AUTH_PROVIDERS
- **Default:** undefined
- **Description:** List of OIDC authentication providers for users to sign in with. Once a provider's name is set, it should remain unchanged. The provider must supports standard OAuth 2.0 IdToken exchange with PKCE and JWKS endpoint. Example: ['Auth0', 'Azure']. You must set the configurations for each of your OIDC_AUTH_PROVIDERS in src/configs/variable.ts file accordingly.

## Log Configs

### LOG_LEVEL
- **Default:** silent
- **Description:** Controls the verbosity of logs. Valid values include:
  - silent: Suppresses all logs.
  - info: Outputs informational and error level logs
  - warn: Outputs warning, and error level logs
  - error: Only reports error level logs.
- Note: If the environment is set to dev, the log level is automatically forced to info, regardless of your configuration.

### ENABLE_EMAIL_LOG
- **Default:** false
- **Description:** Logs outgoing emails if `true`. Ensure you have a cleanup or retention policy before enabling this.

### ENABLE_SMS_LOG
- **Default:** false
- **Description:** Logs SMS messages if true. Ensure you have a cleanup or retention policy before enabling this.

### ENABLE_SIGN_IN_LOG
- **Default:** false
- **Description:** Logs user sign-in IP (production only) and geolocation data (Cloudflare only). If enabled, you must:
  - Implement a cleanup scheduler.
  - Disclose data collection in your Privacy Policy.
  - Comply with applicable privacy and data regulations.