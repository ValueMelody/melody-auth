# SMS Setup
Melody Auth supports SMS-based Multi-Factor Authentication. To enable it, you need to configure Twilio as your SMS provider.

## Supported SMS Providers
- Twilio

## Environment Variables
Use the table below to configure Twilio as your SMS provider.

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| ENVIRONMENT | Determines the sms sending behavior  | "prod" or "dev" |
| DEV_SMS_RECEIVER | Phone number for testing (used when ENVIRONMENT ≠ "prod"). | "+16471231234" |
| TWILIO_ACCOUNT_ID | Your Twilio account id ||
| TWILIO_AUTH_TOKEN | Your Twilio auth token ||
| TWILIO_SENDER_NUMBER | Your Twilio sender number ||

## Production vs. Development Behavior
- Production (ENVIRONMENT = "prod")
  - Messages will be sent to the actual user phone number.
  - Use this setting for production deployments.

- Development (ENVIRONMENT ≠ "prod")
  - All messages will be redirected to the phone number specified in `DEV_SMS_RECEIVER`.
  - This is useful for testing and development to avoid sending messages to real users.

## Cloudflare Remote/Production Configuration
1. Navigate to the Cloudflare dashboard -> Go to "Workers & Pages"
2. Select your "melody-auth" worker -> "Settings" -> "Variables"
3. Add any environment variables that apply to your use case.
4. Click "Save and deploy" to apply the changes.

## Cloudflare Local/Development or Node.js Environment
1. In your melody-auth/server directory, locate or create a .dev.vars file (you can copy .dev.vars.example if needed).
2. Update any environment variables that apply to your use case to .dev.vars
