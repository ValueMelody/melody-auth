# Research for TASK0

## Context Reference
**For tech stack and conventions, see:**
- `/home/pedro/storage/www/goauth.me/.claudiomiro/AI_PROMPT.md` - Universal context (Vue 3, Vite, Tailwind v4, Pinia, vue-i18n, Yup, @simplewebauthn/browser)
- `/home/pedro/storage/www/goauth.me/.claudiomiro/TASK0/TASK.md` - Task-level context (24 auth views, 8 composables, 13 UI components)
- `/home/pedro/storage/www/goauth.me/.claudiomiro/TASK0/PROMPT.md` - Task-specific context (directory structure, dependencies, proxy config)

**This file contains ONLY new information discovered during research.**

## Task Understanding Summary
Create a complete Vue 3 SPA at `auth-ui/` that ports all 24 Hono JSX authentication views to Vue 3 Composition API, including form composables (porting React hooks), UI components, Pinia stores, vue-i18n translations (en/pt/fr), and CSS variable theming.

## Files Discovered to Read/Modify

### React Hooks to Port as Vue Composables
- `server/src/pages/hooks/useSignInForm.tsx:25-187` - Core form hook pattern with useState → ref, useMemo → computed, useCallback → function
- `server/src/pages/hooks/usePasskeyVerifyForm.tsx:28-143` - WebAuthn integration using @simplewebauthn/browser's startAuthentication
- `server/src/pages/hooks/useSocialSignIn.tsx:26-168` - Social OAuth handlers with Google/Facebook/GitHub/Discord/Apple/OIDC
- `server/src/pages/hooks/useSubmitError.tsx:12-115` - Error message mapping from API errors to localized messages

### Form Utilities
- `server/src/pages/tools/form.ts:1-89` - Yup validation fields (emailField, passwordField, confirmPasswordField, codeField) and validate function
- `server/src/pages/tools/request.ts:1-103` - parseResponse, parseAuthorizeBaseValues, handleAuthorizeStep utilities

### Component Patterns Found
- `server/src/pages/components/vanilla/PrimaryButton.tsx:1-33` - Button with loading spinner pattern
- `server/src/pages/components/vanilla/PasswordField.tsx:1-116` - Password field with show/hide toggle using local state
- `server/src/pages/components/vanilla/EmailField.tsx:1-89` - Email field with lock/unlock for passkey flows
- `server/src/pages/components/vanilla/CodeInput.tsx:1-196` - 6-digit OTP input with auto-focus, paste handling, keyboard navigation
- `server/src/pages/components/vanilla/Banner.tsx:76-129` - Info/warning/success/error banner with icons
- `server/src/pages/components/vanilla/LocaleSelector.tsx:1-41` - Simple select dropdown for locale switching
- `server/src/pages/components/vanilla/RecoveryCodeContainer.tsx:1-65` - Copy/download recovery code functionality

### Page View Patterns
- `server/src/pages/blocks/SignIn.tsx:44-231` - Complex view with password/passwordless/passkey/social login options
- `server/src/pages/blocks/SignUp.tsx:25-176` - Registration with dynamic user attributes from initialProps
- `server/src/pages/blocks/Consent.tsx:18-66` - OAuth consent screen with scope display
- `server/src/pages/blocks/OtpSetup.tsx:26-101` - QR code display with canvas ref and manual key reveal
- `server/src/pages/blocks/ResetPassword.tsx:33-157` - Multi-step flow (email → code → new password)
- `server/src/pages/blocks/Layout.tsx:13-50` - Main layout wrapper with logo, locale selector, footer

### Route Configuration
- `server/src/configs/route.ts:83-107` - View enum with all 24 view values to use as route names

### API Endpoints
- `server/src/configs/route.ts:26-81` - IdentityRoute enum with all API endpoints

### Error Messages
- `server/src/configs/message.ts:41-123` - RequestError enum for API error message matching

## Code Patterns Found

### React Hook → Vue Composable Conversion Pattern
From `server/src/pages/hooks/useSignInForm.tsx:31-58`:
```typescript
// React pattern
const [email, setEmail] = useState('')
const values = useMemo(() => ({ email, password }), [email, password])
const handleChange = useCallback((name, value) => {...}, [deps])

// Vue 3 equivalent
const email = ref('')
const values = computed(() => ({ email: email.value, password: password.value }))
const handleChange = (name: string, value: string) => {...}
```

### Form Validation Pattern
From `server/src/pages/tools/form.ts:65-89`:
```typescript
const validate = <T>(schema: ObjectSchema<T>, values: T) => {
  // Returns Record<keyof T, string | undefined>
  // Uses schema.validateSync with abortEarly: false
}
```

### Touched State Pattern
From `server/src/pages/hooks/useSignInForm.tsx:37-40`:
```typescript
const [touched, setTouched] = useState({ email: false, password: false })
// Errors only shown when touched.field is true
errors: { email: touched.email ? errors.email : undefined }
```

### API Request Pattern
From `server/src/pages/tools/request.ts:18-33`:
```typescript
parseAuthorizeBaseValues(params, locale) // Returns OAuth params for API calls
handleAuthorizeStep(response, locale, onSwitchView) // Handles redirect or view switch
```

### Component Props Pattern
All components receive typed props with:
- `locale: typeConfig.Locale` for i18n
- `onSubmit` or `onChange` handlers
- `values` and `errors` objects
- `isSubmitting` / `isLoading` states
- `submitError: string | null`

### CSS Variable Usage
From `server/src/pages/components/vanilla/PrimaryButton.tsx:17`:
```tsx
className='bg-primaryButtonColor text-primaryButtonLabelColor border border-primaryButtonBorderColor'
```
These map to CSS variables:
- `--color-primaryButtonColor`
- `--color-primaryButtonLabelColor`
- `--color-primaryButtonBorderColor`

### Layout Width Pattern
Uses `w-(--text-width)` Tailwind class which maps to CSS variable `--text-width: 300px`

## Integration & Impact Analysis

### API Endpoints to Call
All endpoints are at `server/src/configs/route.ts:26-81`:
- `POST /identity/v1/authorize-password` - Password login
- `POST /identity/v1/authorize-passwordless` - Passwordless start
- `GET /identity/v1/authorize-passkey-verify` - Get passkey options
- `POST /identity/v1/authorize-passkey-verify` - Verify passkey
- `POST /identity/v1/authorize-google` - Google OAuth
- `POST /identity/v1/process-mfa-enroll` - Select MFA type
- `POST /identity/v1/process-otp-mfa` - Verify OTP
- `POST /identity/v1/process-email-mfa` - Verify email MFA
- `POST /identity/v1/process-sms-mfa` - Verify SMS MFA
- `POST /identity/v1/app-consent` - Accept OAuth consent
- `POST /identity/v1/change-password` - Change password
- `POST /identity/v1/change-email-code` - Request email change code
- `POST /identity/v1/change-email` - Change email
- `POST /identity/v1/reset-password-code` - Request password reset code
- `POST /identity/v1/reset-password` - Reset password
- `POST /identity/v1/reset-mfa` - Reset MFA
- `POST /identity/v1/update-info` - Update user info

### OAuth Flow Parameters
From `server/src/pages/tools/request.ts:18-33`:
```typescript
{
  clientId, redirectUri, responseType, state,
  policy, codeChallenge, codeChallengeMethod,
  locale, org, scope
}
```

### Branding/Theme Variables
From `PROMPT.md:99-113` - CSS variables fetched from API per org:
- `--color-layoutColor` - Background color
- `--color-labelColor` - Text color
- `--color-primaryButtonColor/LabelColor/BorderColor`
- `--color-secondaryButtonColor/LabelColor/BorderColor`
- `--color-criticalIndicatorColor` - Error color
- `--font-default` - Font family
- `--text-width: 300px` - Form width

## Test Strategy Discovered

### Existing Test Patterns
Found test files in `server/src/pages/blocks/*.test.tsx`:
- Uses `@testing-library/react` patterns
- Tests component rendering and interactions
- Mocks API calls

### For Vue Implementation
- Use Vitest as testing framework (Vite-native)
- Use @vue/test-utils for component testing
- Type checking: `vue-tsc --noEmit`
- Build verification: `npm run build`

## Risks & Challenges Identified

### Tailwind CSS v4 with @tailwindcss/vite
- New plugin architecture, different from PostCSS-based v3
- May need to follow exact setup from https://tailwindcss.com/docs/installation/vite
- CSS import syntax: `@import "tailwindcss";`

### @simplewebauthn/browser Integration
- Uses `startAuthentication(options)` and `startRegistration(options)`
- Options come from API response
- Must handle browser compatibility and user cancellation

### Google Sign-In SDK
From `server/src/pages/components/vanilla/GoogleSignIn.tsx`:
- Loads external script: `https://accounts.google.com/gsi/client`
- Uses `data-callback='handleGoogleSignIn'` attribute
- Callback function attached to `window`
- Must handle in Vue's onMounted/onUnmounted lifecycle

### Translation Key Structure
From `server/src/pages/tools/locale.ts`:
- Object-based: `signIn.title.en = 'Authentication'`
- Must convert to JSON: `{ "signIn": { "title": "Authentication" } }`
- Variables use `{{variable}}` syntax
- vue-i18n interpolation: `t('key', { variable })`

### Multi-step Forms
- ResetPassword has 3 states: email input → code entry → new password
- Manage with Vue refs and conditional rendering

## Execution Strategy Recommendation

### Phase 1: Project Setup
1. Initialize Vite + Vue 3 + TypeScript project at `auth-ui/`
2. Configure Tailwind CSS v4 with @tailwindcss/vite plugin
3. Set up path aliases in tsconfig.json (`@/` → `src/`)
4. Configure Vite proxy for `/identity/v1/*` to `http://localhost:8787`
5. Install dependencies: vue, vue-router, pinia, vue-i18n, @vueuse/core, yup, @simplewebauthn/browser

### Phase 2: Core Infrastructure
1. Create `src/main.ts` with Vue app, Pinia, Router, vue-i18n
2. Create `src/stores/auth.ts` - OAuth params, session state
3. Create `src/stores/locale.ts` - i18n state with persistence
4. Create `src/stores/branding.ts` - Theme config with CSS variable injection
5. Create `src/api/auth.ts` - Fetch-based API client
6. Create `src/router/index.ts` - Routes for all 24 views using View enum values

### Phase 3: Base Components
1. Port UI components from `server/src/pages/components/vanilla/`:
   - PrimaryButton.vue, SecondaryButton.vue
   - FieldInput.vue, FieldLabel.vue, FieldError.vue
   - PasswordField.vue, EmailField.vue, PhoneField.vue
   - CodeInput.vue, Spinner.vue, Banner.vue
   - SubmitError.vue, SuccessMessage.vue, ViewTitle.vue
   - RecoveryCodeContainer.vue

2. Create social login components:
   - GoogleSignIn.vue (with script loading in onMounted)
   - FacebookSignIn.vue, GithubSignIn.vue, DiscordSignIn.vue
   - AppleSignIn.vue, OidcSignIn.vue

3. Create layout components:
   - AuthLayout.vue (logo, locale selector, footer)
   - LocaleSelector.vue

### Phase 4: Form Composables
Port hooks from `server/src/pages/hooks/`:
1. `useSignInForm.ts` - Email/password with validation
2. `useSignUpForm.ts` - Registration with dynamic attributes
3. `useMfaForm.ts` - Covers OTP, Email, SMS MFA
4. `usePasskey.ts` - WebAuthn with @simplewebauthn/browser
5. `useSocialAuth.ts` - Social login handlers
6. `useChangePasswordForm.ts`, `useChangeEmailForm.ts`
7. `useResetPasswordForm.ts`, `useConsentForm.ts`, `useRecoveryCodeForm.ts`
8. `useSubmitError.ts` - Error message mapping

Create utilities:
- `src/composables/form.ts` - Yup validation fields
- `src/composables/request.ts` - API helpers

### Phase 5: Translations
Convert `server/src/pages/tools/locale.ts` to JSON:
1. Create `src/i18n/locales/en.json`
2. Create `src/i18n/locales/pt.json`
3. Create `src/i18n/locales/fr.json`
4. Configure lazy loading in `src/i18n/index.ts`

### Phase 6: Page Views
Create all 24 views in `src/views/`:
- SignIn.vue, SignUp.vue, Consent.vue
- MfaEnroll.vue, OtpSetup.vue, OtpMfa.vue, EmailMfa.vue, SmsMfa.vue
- PasskeyEnroll.vue, RecoveryCodeEnroll.vue, RecoveryCodeSignIn.vue
- PasswordlessVerify.vue
- UpdateInfo.vue, ChangePassword.vue, ChangeEmail.vue
- VerifyEmail.vue, ResetPassword.vue, ResetMfa.vue
- ManagePasskey.vue, ManageRecoveryCode.vue
- SwitchOrg.vue, ChangeOrg.vue, AuthCodeExpired.vue

### Phase 7: Theming & Integration
1. Implement branding store with CSS variable injection to `:root`
2. Handle `?org=slug` query param for org-specific branding
3. Create `src/styles/main.css` with CSS variable definitions
4. Update `src/App.vue` with AuthLayout wrapper

### Verification
```bash
cd auth-ui
npm install           # Must succeed
npm run dev           # Must start on port 5173
npm run build         # Must produce dist/
npm run type-check    # Must pass with no errors
```
