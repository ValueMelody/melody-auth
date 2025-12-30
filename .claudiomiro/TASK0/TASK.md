@dependencies []
# Task: Auth UI Vue.js SPA Implementation

## Summary

Create the complete `auth-ui/` Vue 3 static SPA that replaces the existing Hono JSX authentication pages in `server/src/pages/`. This includes all 24 authentication views, form composables, UI components, Pinia stores, Vue Router configuration, vue-i18n setup, and the dynamic CSS variable theming system.

This project handles the entire user-facing authentication flow: sign-in, sign-up, MFA enrollment/verification, passkey management, password reset, email verification, and account management.

## Context Reference

**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**

### Files This Task Will Create
- `auth-ui/` - New directory at project root
- All files under `auth-ui/src/` as specified in acceptance criteria (~50 files)

### Reference Implementations to Port
- `server/src/pages/blocks/*.tsx` - All 24 page views (SignIn, SignUp, Consent, MFA flows, etc.)
- `server/src/pages/hooks/*.tsx` - Form hooks pattern (useSignInForm, etc.)
- `server/src/pages/components/*.tsx` - Vanilla UI components
- `server/src/pages/tools/locale.ts` - Locale definitions for i18n

### Key Patterns to Follow
- Form hooks in `server/src/pages/hooks/useSignInForm.tsx` use useState/useMemo/useCallback with Yup validation
- Port to Vue composables using `ref`, `computed`, `watch`
- CSS variables for theming (see `../AI_PROMPT.md` Section 3 for exact variable names)
- Fetch-based API calls to `/authorize/*` and `/identity/*` endpoints

## Complexity

High

## Dependencies

Depends on: None
Blocks: None
Parallel with: TASK1

## Detailed Steps

### 1. Project Initialization
1. Create `auth-ui/` directory at project root
2. Initialize Vite + Vue 3 + TypeScript project
3. Install all dependencies (vue, vue-router, pinia, vue-i18n, @vueuse/core, yup, @simplewebauthn/browser)
4. Configure Tailwind CSS v4 with @tailwindcss/vite
5. Set up `tsconfig.json` with path aliases (`@/`)
6. Configure `vite.config.ts` with proxy for `/authorize/*` and `/identity/*`
7. Create `.env.example` with `VITE_API_URL=http://localhost:8787`

### 2. Core Infrastructure
1. Create `src/main.ts` with Vue app, Pinia, Router, i18n plugins
2. Create `src/App.vue` root component with router-view
3. Set up `src/router/index.ts` with routes for all 24 auth pages
4. Create Pinia stores:
   - `src/stores/auth.ts` - Auth flow state (session, tokens, user)
   - `src/stores/locale.ts` - i18n state
   - `src/stores/branding.ts` - Theme/org branding with CSS variable injection
5. Set up vue-i18n in `src/i18n/index.ts` with locale detection
6. Create `src/api/auth.ts` with fetch-based API calls

### 3. Base Components
Create in `src/components/ui/`:
- PrimaryButton.vue, SecondaryButton.vue
- FieldInput.vue, PasswordField.vue, EmailField.vue, PhoneField.vue
- CodeInput.vue (for OTP entry)
- CheckboxInput.vue
- Spinner.vue, Banner.vue
- SubmitError.vue, SuccessMessage.vue
- ViewTitle.vue

Create in `src/components/social/`:
- GoogleSignIn.vue, FacebookSignIn.vue, GithubSignIn.vue
- DiscordSignIn.vue, AppleSignIn.vue, OidcSignIn.vue

Create in `src/components/layout/`:
- AuthLayout.vue (main layout with branding/logo)
- LocaleSelector.vue

### 4. Form Composables
Create in `src/composables/`:
- useSignInForm.ts - Email/password login with validation
- useSignUpForm.ts - Registration with custom attributes
- useMfaForm.ts - OTP, Email, SMS MFA verification
- usePasskey.ts - WebAuthn integration using @simplewebauthn/browser
- useSocialAuth.ts - Social login redirects
- useChangePasswordForm.ts
- useChangeEmailForm.ts
- useResetPasswordForm.ts

### 5. Page Views
Create all 24 views in `src/views/`:
- SignIn.vue, SignUp.vue, Consent.vue
- MfaEnroll.vue, OtpSetup.vue, OtpMfa.vue
- EmailMfa.vue, SmsMfa.vue
- PasskeyEnroll.vue, RecoveryCodeEnroll.vue, RecoveryCodeSignIn.vue
- PasswordlessVerify.vue
- UpdateInfo.vue, ChangePassword.vue, ChangeEmail.vue
- VerifyEmail.vue, ResetPassword.vue, ResetMfa.vue
- ManagePasskey.vue, ManageRecoveryCode.vue
- SwitchOrg.vue, AuthCodeExpired.vue

### 6. Theming & i18n
1. Create `src/styles/main.css` with CSS variable definitions and Tailwind imports
2. Implement branding store logic to fetch theme from API and apply to :root
3. Create translation files in `src/i18n/locales/`:
   - en.json, pt.json, fr.json
4. Port translations from `server/src/pages/tools/locale.ts`

### 7. Verification
1. Run `npm install` - verify success
2. Run `npm run dev` - verify dev server starts
3. Run `npm run build` - verify production build
4. Run `npm run type-check` - verify no TypeScript errors
5. Verify all routes are accessible
6. Verify theming applies correctly

## Acceptance Criteria

### Project Setup
- [ ] `auth-ui/` directory exists at project root
- [ ] `npm install` succeeds without errors
- [ ] `npm run dev` starts Vite dev server on port 5173
- [ ] `npm run build` produces valid `dist/` folder
- [ ] `npm run type-check` passes with no errors
- [ ] Tailwind CSS v4 is configured with @tailwindcss/vite
- [ ] Path alias `@/` resolves to `src/`
- [ ] Vite proxy configured for API routes

### Core Infrastructure
- [ ] Vue 3 app mounts with Pinia, Router, vue-i18n
- [ ] Router has routes for all 24 auth pages
- [ ] Pinia stores created: auth, locale, branding
- [ ] API client configured with base URL from env
- [ ] vue-i18n detects browser locale, supports en/pt/fr

### Components
- [ ] All 13 UI components created and functional
- [ ] All 6 social login button components created
- [ ] AuthLayout.vue provides consistent page wrapper
- [ ] LocaleSelector.vue allows switching locales

### Composables
- [ ] All 8 form composables created with Yup validation
- [ ] usePasskey.ts integrates @simplewebauthn/browser
- [ ] Composables handle loading and error states

### Views
- [ ] All 24 page views created with proper routing
- [ ] Views use composables for form logic
- [ ] Views use base components for UI
- [ ] Views display loading states during API calls
- [ ] Views display error messages on failure

### Theming
- [ ] CSS variables defined matching existing system
- [ ] Branding store fetches theme from API
- [ ] CSS variables applied to :root dynamically
- [ ] Org-specific branding via `?org=slug` query param
- [ ] Custom fonts and logos configurable

### i18n
- [ ] en.json, pt.json, fr.json translation files created
- [ ] All UI text uses vue-i18n `$t()` function
- [ ] Locale persists across page navigation

## Code Review Checklist

- [ ] Uses Vue 3 Composition API with `<script setup lang="ts">`
- [ ] No `any` types - proper TypeScript interfaces
- [ ] Component names are PascalCase, files are kebab-case
- [ ] API calls use proper error handling with try/catch
- [ ] Loading states prevent double-submission
- [ ] CSS uses Tailwind classes + CSS variables only
- [ ] No inline styles
- [ ] Follows patterns from existing Hono JSX implementation

## Reasoning Trace

**Why single task for Auth UI?**
All 24 views share:
- Same form composable patterns
- Same UI component library
- Same theming system
- Same routing/store setup
- Same API client

Splitting views into separate tasks would:
- Add 15+ minutes overhead per split
- Require repeated setup/context loading
- Create coordination overhead for shared components

**Why fetch-based API?**
The auth UI makes simple form submissions to dedicated endpoints. TanStack Query's caching isn't beneficial here - each auth action is unique and transactional.

**Why custom components instead of shadcn-vue?**
The auth UI has a specific design requirement for theming via CSS variables. Custom lightweight components give full control over this without fighting a component library.
