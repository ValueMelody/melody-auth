# Email Provider Setup
Melody Auth relies on an email provider to send password reset links, email verification notices, and email-based MFA codes. This guide explains how to configure either SendGrid, Mailgun, Brevo, or SMTP (Node.js only) depending on your needs.

## Supported Email Providers
- **Cloudflare Workers or Node.js**: SendGrid, Mailgun, Resend.com and Brevo
-	**Node.js (Only)**: SMTP server (in addition to the above)

## Environment Variables
Use the table below to configure your chosen email provider. Some variables are required only if you’re using a specific provider (e.g., SendGrid).

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| ENVIRONMENT | Determines email routing behavior | "prod" or "dev" |
| DEV_EMAIL_RECEIVER | When ENVIRONMENT ≠ prod, all emails go here (for testing only) | "test@example.com" |
| SENDGRID_API_KEY | Your SendGrid API key (Required if you intend to use SendGrid) | "SG.xxxxxxxxxxxxxxxxxxxxxxxx" |
| SENDGRID_SENDER_ADDRESS | Verified sender email address in SendGrid (Required if you intend to use SendGrid) | "noreply@yourdomain.com" |
| MAILGUN_API_KEY | Your Mailgun API key (Required if you intend to use Mailgun) | "xxxxxxxxxxxxxxxxxx-xxxxxxxxx" |
| MAILGUN_SENDER_ADDRESS | Sender email address in Mailgun (Required if you intend to use Mailgun) | "noreply@yourdomain.com" |
| BREVO_API_KEY | Your Brevo API key (Required if you intend to use Brevo) | "xkeysib-xxxxxxxxxxxxxxxxxxxxxxxx" |
| BREVO_SENDER_ADDRESS | Verified sender address in Brevo (Required if you intend to use Brevo) | "noreply@yourdomain.com" |
| RESEND_API_KEY | Your Resend.com API key (Required if you intend to use Resend.com) | "re_xxxxxxxxxxxxxxxxxxxxxxx" |
| RESEND_SENDER_ADDRESS | Verified sender address in Resend.com (Required if you intend to use Resend.com) |
| SMTP_SENDER_ADDRESS | SMTP sender email address (Node.js only) | "noreply@yourdomain.com" |
| SMTP_CONNECTION_STRING | SMTP connection string (Node.js only) | "smtp://username:password@smtp.mailserver.com:587" |

## Production vs. Development Behavior
- Production (ENVIRONMENT = "prod")
  - Emails are sent to actual user addresses.
  - Ideal for live deployments.

- Development (ENVIRONMENT ≠ "prod")
  - All emails are redirected to the address in DEV_EMAIL_RECEIVER.
  - Prevents emailing real users during testing.

## Priority Between Providers
- Node.js Environment
  - If SMTP_CONNECTION_STRING is defined, SMTP will always be used—regardless of SendGrid, Mailgun, Brevo or Resend settings.
  - Otherwise, if more than one API key and sender address are provided (SendGrid, Mailgun, Brevo, Resend), SendGrid is used first, then Mailgun, Brevo and finally Resend.

- Cloudflare Environment
  - SMTP settings are ignored.
  - If you set up multiple providers (SendGrid, Mailgun, Brevo), SendGrid takes priority, followed by Mailgun, Brevo and then Resend.

## Cloudflare Remote/Production Configuration
1. Navigate to the Cloudflare dashboard -> Go to "Workers & Pages"
2. Select your "melody-auth" worker -> "Settings" -> "Variables"
3. Add any environment variables that apply to your use case.
4. Click "Save and deploy" to apply the changes.

## Cloudflare Local/Development or Node.js Environment
1. In your melody-auth/server directory, locate or create a .dev.vars file (you can copy .dev.vars.example if needed).
2. Update any environment variables that apply to your use case to .dev.vars
