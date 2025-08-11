# Multi-Factor Authentication (MFA) Setup

MFA adds an extra layer of security on top of your primary sign-in method. Melody Auth supports Email, OTP (TOTP), and SMS MFA, plus related features such as Passkey, Recovery Codes, and Remember Device.

## Configure MFA at the server level

Configure these environment variables in `server/wrangler.toml`:

```toml
# Enforce a specific MFA factor at sign-in
OTP_MFA_IS_REQUIRED=false
EMAIL_MFA_IS_REQUIRED=false # requires email provider configured
SMS_MFA_IS_REQUIRED=false   # requires SMS provider configured

# Enforce enrollment in at least one allowed MFA factor when all *_IS_REQUIRED=false
ENFORCE_ONE_MFA_ENROLLMENT=['otp', 'email'] # options: 'email', 'otp', 'sms'

# Allow Email MFA as backup when the primary factor is unavailable
ALLOW_EMAIL_MFA_AS_BACKUP=true

# Related features
ALLOW_PASSKEY_ENROLLMENT=false   # enable passkey enrollment flows
ENABLE_RECOVERY_CODE=false       # enable recovery codes
ENABLE_MFA_REMEMBER_DEVICE=false # allow users to remember device for 30 days
```

- If any of OTP_MFA_IS_REQUIRED, EMAIL_MFA_IS_REQUIRED, or SMS_MFA_IS_REQUIRED is true, that factor is required at sign-in.
- When all three are false, ENFORCE_ONE_MFA_ENROLLMENT can require users to enroll at least one factor from the allowed list.
- Configure your Email/SMS providers before enabling those MFA types.

## Enrollment options

- Admin Panel: Admins can enroll or unenroll MFA and manage recovery options.
- S2S API: Drive enrollment flows programmatically from your backend.
- Embedded Auth API: Drive enrollment flows programmatically from your frontend.

## Passkey

Passkeys provide secure, phishing-resistant sign-in without passwords and allow users to bypass MFA. Enable enrollment via:

- Enable via ALLOW_PASSKEY_ENROLLMENT=true

## Recovery codes

Recovery codes let users regain access when they forget their password or cannot complete MFA.

- Enable via ENABLE_RECOVERY_CODE=true

## Remember this device (30 days)

Users can choose to bypass MFA on a trusted device for 30 days.

- Enable via ENABLE_MFA_REMEMBER_DEVICE=true

## App-level MFA configuration

Override MFA behavior per application (client) rather than globally.

- Admin Panel: Open the target app and configure MFA requirements (e.g., required factors, email as backup).
- S2S API: Update an app’s MFA configuration programmatically.

This is useful when different apps require different assurance levels (e.g., stricter MFA for internal admin apps). However, it will be conflicting with the ENFORCE_ONE_MFA_ENROLLMENT setting, so you need to carefully consider the impact.
![App-level MFA](https://raw.githubusercontent.com/ValueMelody/melody-auth/main/docs/images/app_level_mfa.jpg)

## Related policies (shortcuts)

You can route directly to certain flows via policies:

- `reset_mfa`: Reset enrolled MFA
- `manage_recovery_code`: Manage recovery codes
- `manage_passkey`: Manage passkeys
