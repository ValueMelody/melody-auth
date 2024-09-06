# Server Setup

## Environment Setup (Cloudflare)

### 1. Cloudflare Account Setup
1. Sign up for a Cloudflare account if you don't have one already.
2. Install Wrangler CLI and authenticate:
```
npx wrangler
wrangler login
```

### 2. Cloudflare Resource Creation
Go to Cloudflare dashboard

1. Create a Worker:
- Go to Workers & Pages -> Overview -> Click "Create" button
- Name the worker "melody-auth"
- After creation, go to the worker settings -> Variables
- Add a variable named "AUTH_SERVER_URL" with the value set to your worker's URL 
  (e.g., https://melody-auth.[your-account-name].workers.dev)

2. Create a D1 database:
- Go to Workers & Pages -> D1 -> Click "Create database" button

3. Create a KV namespace:
- Go to Workers & Pages -> KV -> Click "Create a namespace" button

### 3. Project Setup

1. Clone the repository:
```
git clone git@github.com:ValueMelody/melody-auth.git
cd melody-auth
npm install
npm run build
```

2. Update `server/wrangler.toml`:
Replace the KV id and D1 id with your newly created resources:
```toml
[[kv_namespaces]]
binding = "KV"
id = "your_kv_namespace_id"

[[d1_databases]]
binding = "DB"
database_name = "melody-auth"
database_id = "your_d1_database_id"
```

### 4. Deploy
Run the following commands to set up your remote D1, KV, and deploy the code to your Worker:
```
cd server
npm run prod:secret:generate
npm run prod:migration:apply
npm run prod:deploy
```
Now you are all set, you can verify your server by accessing: `[your_worker_url]/.well-known/openid-configuration`

### Cloudflare Local development
To set up your local development environment, follow these steps:
```
git clone git@github.com:ValueMelody/melody-auth.git
cd melody-auth
npm install
npm run build

cd server
# Configure your email-related environment variables in dev.vars
cp dev.vars.example dev.vars
npm run dev:secret:generate
npm run dev:migration:apply
npm run dev:start
```

## Environment Setup (Node)

### 1. Node, Postgres and Redis setup
Begin by setting up your PostgreSQL and Redis servers, and ensure you have the connection strings ready for integration. Please also ensure you are using <b>Node.js version 20.05 or higher</b> for compatibility.

### 2. Project setup
```
git clone git@github.com:ValueMelody/melody-auth.git
cd melody-auth
npm install
npm run build

cd server
# Add your PostgreSQL and Redis connection strings to dev.vars
# Configure your email-related environment variables in dev.vars
cp dev.vars.example dev.vars
npm run node:secret:generate
npm run node:migration:apply
npm run node:dev
```

### 3. Production Build
To prepare for production, follow these steps:
1. Update server/src/routes/other.tsx file  
```
# Comment out the current swagger.json import statement:
// import swaggerSpec from '../scripts/swagger.json';

# Uncomment the other swagger.json import statement which contains with { type: "json" }:
import swaggerSpec from '../scripts/swagger.json' with { type: "json" }
```

2. Run the following commands to build and start the server:
```
cd server
npm run node:build
npm run node:start
```

## Mailer Setup
Melody Auth supports email-based features such as password reset, email verification and email MFA. To make sure these features works as expected, you need to set up SendGrid or Brevo integration and configure the necessary environment variables in your Cloudflare Worker.

### Prerequisites
- A SendGrid/Brevo account
- SendGrid/Brevo API key
- Verified sender email address in SendGrid/Brevo

### Configuration Steps (Cloudflare Production)

1. Navigate to the Cloudflare dashboard:
   - Go to Workers & Pages
   - Select your Melody Auth worker
   - Click on "Settings" -> "Variables"

2. Add the following environment variables:

   | Variable Name | Description | Example Value |
   |---------------|-------------|---------------|
   | ENVIRONMENT | Determines the email sending behavior | "prod" or "dev" |
   | DEV_EMAIL_RECEIVER | Email address for testing (used when ENVIRONMENT is not 'prod') | "test@example.com" |
   | SENDGRID_API_KEY | Your SendGrid API key (not needed if you intend to use Brevo) | "SG.xxxxxxxxxxxxxxxxxxxxxxxx" |
   | SENDGRID_SENDER_ADDRESS | Your verified sender email address in SendGrid (not needed if you intend to use Brevo) | "noreply@yourdomain.com" |
   | BREVO_API_KEY | Your Brevo API key (not needed if you intend to use SendGrid) | "xkeysib-.xxxxxxxxxxxxxxxxxxxxxxxx" |
   | BREVO_SENDER_ADDRESS | Your verified sender email address in Brevo (not needed if you intend to use SendGrid) | "noreply@yourdomain.com" |

3. Click "Save and deploy" to apply the changes.

### Configuration Steps (Cloudflare Local or Node)
Update environment variables in server/.dev.vars file accordingly.

### Environment Behavior

- When `ENVIRONMENT` is set to "prod":
  - Emails will be sent to the actual user email addresses.
  - Use this setting for production deployments.

- When `ENVIRONMENT` is not set to "prod" (e.g., set to "dev"):
  - All emails will be redirected to the address specified in `DEV_EMAIL_RECEIVER`.
  - This is useful for testing and development to avoid sending emails to real users.

- Priority Between SendGrid and Brevo:
  - If both SendGrid and Brevo keys and sender addresses are provided, SendGrid will take precedence.

## Additional Configs

Melody Auth offers a range of customizable options to tailor the server to your specific needs. You can modify these settings by adjusting the values in the `[vars]` section of the `server/wrangler.toml` file.

To apply your changes:

1. Open `server/wrangler.toml` in your preferred text editor.
2. Locate the `[vars]` section.
3. Modify the values as needed.
4. Save the file.
5. Redeploy your server using the command:
```
cd server
npm run prod:deploy
```

### AUTHORIZATION_CODE_EXPIRES_IN
- **Default:** 300 (5 minutes)  
- **Description:** Determines how long the authorization code is valid before it expires.

### SPA_ACCESS_TOKEN_EXPIRES_IN
- **Default:** 1800 (30 minutes)  
- **Description:** Determines how long the access token granted for single page applications is valid before it expires.

### SPA_REFRESH_TOKEN_EXPIRES_IN
- **Default:** 604800 (7 days)
- **Description:** Determines how long the refresh token granted for single page applications is valid before it expires.

### S2S_ACCESS_TOKEN_EXPIRES_IN
- **Default:** 3600 (1 hour)
- **Description:** Determines how long the access token granted for server-to-server applications is valid before it expires.

### ID_TOKEN_EXPIRES_IN
- **Default:** 1800 (30 minutes)
- **Description:** Determines how long the ID token is valid before it expires.

### SERVER_SESSION_EXPIRES_IN
- **Default:** 1800 (30 minutes)
- **Description:** Determines how long the server session is valid before it expires. If set to 0, the server session will be disabled.

### COMPANY_LOGO_URL
- **Default:** https://raw.githubusercontent.com/ValueMelody/melody-homepage/main/logo.jpg
- **Description:** The logo used for branding.

### GOOGLE_AUTH_CLIENT_ID
- **Default:** ""
- **Description:** The Google Authentication Client ID is required to enable the Google Sign-In function. This ID is obtained from the Google Developer Console and uniquely identifies your application to Google. If this value is left empty, the Google Sign-In button will be suppressed and the sign-in functionality will not be available.

### ENABLE_SIGN_UP
- **Default:** true
- **Description:** Determines if user sign-up is allowed. If set to false, the sign-up button will be suppressed on the sign-in page.

### ENABLE_PASSWORD_SIGN_IN
- **Default:** true
- **Description:** Determines if password sign-in is allowed. If you only want to support social sign-in, you can set ENABLE_SIGN_UP, ENABLE_PASSWORD_SIGN_IN and ENABLE_PASSWORD_RESET to false.

### ENABLE_PASSWORD_RESET
- **Default:** true
- **Description:** Determines if user password reset is allowed. If set to false, the reset password button will be suppressed on the sign-in page.
[Email functionality setup required](#email-functionality-setup)

### PASSWORD_RESET_EMAIL_THRESHOLD
- **Default:** 5
- **Description:** Limits the number of password reset email requests allowed per email and IP address per day to protect against abuse.

### ENABLE_NAMES
- **Default:** true
- **Description:** Provides fields for users to enter their first and last names during sign-up. If set to false, the first and last name fields will not show up on the sign-up page.

### NAMES_IS_REQUIRED
- **Default:** false
- **Description:** Determines if users are required to provide their first and last names during sign-up.

### ENABLE_USER_APP_CONSENT
- **Default:** true
- **Description:** Requires users to consent to grant access to each app after authentication.

### ENABLE_EMAIL_VERIFICATION
- **Default:** true
- **Description:** If set to true, users will receive an email to verify their email address after signing up.
[Email functionality setup required](#email-functionality-setup)

### OTP_MFA_IS_REQUIRED
- **Default:** false
- **Description:** Enables OTP-based multi-factor authentication (MFA) for user sign-in. When set to true, users are required to configure OTP using an app like Google Authenticator during the sign-in process.

### EMAIL_MFA_IS_REQUIRED
- **Default:** false
- **Description:** Controls email-based multi-factor authentication (MFA) for user sign-in. If set to true, users receive an MFA code via email to confirm their login.
[Email functionality setup required](#email-functionality-setup)

### ENFORCE_ONE_MFA_ENROLLMENT
- **Default:** true
- **Description:** This setting requires that users enroll in at least one form of Multi-Factor Authentication (MFA). This setting is only effective if both OTP_MFA_IS_REQUIRED and EMAIL_MFA_IS_REQUIRED are set to false.
[Email functionality setup required](#email-functionality-setup)

### ALLOW_EMAIL_MFA_AS_BACKUP
- **Default:** true
- **Description:** This setting allows users to use email-based MFA as an alternative method for signing in if they are enrolled in OTP MFA and not enrolled in email MFA.
[Email functionality setup required](#email-functionality-setup)

### ACCOUNT_LOCKOUT_THRESHOLD
- **Default:** 5
- **Description:** Number of failed login attempts before the user account is locked. Set to 0 to disable the account lockout feature.

### ACCOUNT_LOCKOUT_EXPIRES_IN
- **Default:** 86400 (1 day)
- **Description:** Duration (in seconds) for which the account remains locked after reaching the lockout threshold. Set to 0 for indefinite lockout until manual intervention.

### UNLOCK_ACCOUNT_VIA_PASSWORD_RESET
- **Default:** true
- **Description:** User can unlock their account by reset password. 
[Email functionality setup required](#email-functionality-setup)

### SUPPORTED_LOCALES
- **Default:** ['en', 'fr']
- **Description:** Specifies the locales supported for identity pages and emails.

### ENABLE_LOCALE_SELECTOR
- **Default:** true
- **Description:** Determines whether users can switch to a different locale on identity pages. If only one locale is supported (`SUPPORTED_LOCALE`), the locale selector will be suppressed, regardless of this setting.
