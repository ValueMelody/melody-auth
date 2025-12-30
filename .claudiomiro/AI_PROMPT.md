# AI_PROMPT: Vue.js Static Frontend Migration

## 1. Purpose

**What:** Create two new Vue.js 3 static SPA projects to replace the existing frontend implementations:
1. `auth-ui/` - Authentication UI (replaces Hono JSX pages in `server/src/pages/`)
2. `admin-panel-vue/` - Admin Panel (replaces Next.js React app in `admin-panel/`)

**Why:** Enable modern static deployment architecture, separate frontend concerns from the API server, improve developer experience with Vue's reactivity system, and enable a more modern/cooler theme that remains fully customizable (skinnable) from the admin panel.

**Success Definition:** Both Vue projects are fully scaffolded, configured with all necessary dependencies, follow the defined structure, and are ready for feature implementation. The projects must:
- Match 100% feature parity with existing implementations
- Support dynamic theming via CSS variables (loaded from API or query params)
- Support i18n with vue-i18n (en, pt, fr locales minimum)
- Use the specified component libraries and patterns
- Be production-ready for static deployment (Cloudflare Pages, Netlify, etc.)

---

## 2. Environment & Codebase Context

### Tech Stack Overview

| Layer | Current | Target |
|-------|---------|--------|
| **Auth UI** | Hono JSX + Tailwind v4 | Vue 3 + Vite + Tailwind v4 |
| **Admin Panel** | Next.js 14 + React + RTK Query | Vue 3 + Vite + TanStack Query |
| **UI Components** | shadcn/ui (Radix React) | shadcn-vue (Radix Vue) |
| **State Management** | Redux + Signals | Pinia |
| **i18n** | Custom locale objects / next-intl | vue-i18n |
| **Styling** | Tailwind CSS | Tailwind CSS v4 |

### Project Structure (Root: `/home/pedro/storage/www/goauth.me/`)

```
goauth.me/
├── admin-panel/          # Current Next.js admin panel (reference implementation)
│   ├── app/[lang]/       # Pages with i18n routing
│   ├── components/       # React components + shadcn/ui
│   ├── services/         # RTK Query API layer
│   ├── translations/     # JSON locale files (en.json, fr.json, pt.json)
│   └── package.json
├── server/               # Hono API server
│   ├── src/pages/        # Current Auth UI (Hono JSX) - TO BE REPLACED
│   │   ├── blocks/       # Page views (SignIn.tsx, SignUp.tsx, etc.)
│   │   ├── components/   # Vanilla components
│   │   ├── hooks/        # Form hooks (useSignInForm, etc.)
│   │   └── tools/        # Utilities, locale definitions
│   └── package.json
├── auth-ui/              # NEW: Vue Auth UI (TO BE CREATED)
└── admin-panel-vue/      # NEW: Vue Admin Panel (TO BE CREATED)
```

### Key Dependencies to Install

**Auth UI (`auth-ui/`):**
```json
{
  "dependencies": {
    "vue": "^3.4",
    "vue-router": "^4.3",
    "pinia": "^2.1",
    "vue-i18n": "^9.10",
    "@vueuse/core": "^10.7",
    "yup": "^1.6",
    "@simplewebauthn/browser": "^13.1"
  },
  "devDependencies": {
    "vite": "^5.4",
    "@vitejs/plugin-vue": "^5.0",
    "typescript": "^5.5",
    "tailwindcss": "^4.0",
    "@tailwindcss/vite": "^4.0"
  }
}
```

**Admin Panel (`admin-panel-vue/`):**
```json
{
  "dependencies": {
    "vue": "^3.4",
    "vue-router": "^4.3",
    "pinia": "^2.1",
    "vue-i18n": "^9.10",
    "@tanstack/vue-query": "^5.24",
    "axios": "^1.6",
    "@vueuse/core": "^10.7",
    "radix-vue": "^1.9",
    "class-variance-authority": "^0.7",
    "clsx": "^2.1",
    "tailwind-merge": "^2.2",
    "lucide-vue-next": "^0.372"
  },
  "devDependencies": {
    "vite": "^5.4",
    "@vitejs/plugin-vue": "^5.0",
    "typescript": "^5.5",
    "tailwindcss": "^4.0",
    "@tailwindcss/vite": "^4.0"
  }
}
```

---

## 3. Related Code Context

### Auth UI - Current Implementation References

**Page Views to Port** (`server/src/pages/blocks/`):
| File | Description | Complexity |
|------|-------------|------------|
| `SignIn.tsx` | Main login (email/password, passkey, passwordless, social) | High |
| `SignUp.tsx` | Registration with custom attributes | High |
| `Consent.tsx` | OAuth consent screen | Medium |
| `MfaEnroll.tsx` | MFA method selection | Medium |
| `OtpSetup.tsx` | Authenticator QR code setup | Medium |
| `OtpMfa.tsx` | OTP verification | Medium |
| `EmailMfa.tsx` | Email MFA verification | Medium |
| `SmsMfa.tsx` | SMS MFA verification | Medium |
| `PasskeyEnroll.tsx` | WebAuthn passkey enrollment | High |
| `RecoveryCodeEnroll.tsx` | Recovery code display | Low |
| `RecoveryCodeSignIn.tsx` | Login with recovery code | Medium |
| `PasswordlessVerify.tsx` | Passwordless email verification | Medium |
| `UpdateInfo.tsx` | Update user profile | Low |
| `ChangePassword.tsx` | Change password | Medium |
| `ChangeEmail.tsx` | Change email with verification | Medium |
| `VerifyEmail.tsx` | Email verification | Low |
| `ResetPassword.tsx` | Password reset flow | Medium |
| `ResetMfa.tsx` | MFA reset | Low |
| `ManagePasskey.tsx` | Manage registered passkeys | Medium |
| `ManageRecoveryCode.tsx` | Regenerate recovery codes | Low |
| `SwitchOrg.tsx` | Organization switching | Medium |
| `AuthCodeExpired.tsx` | Error page | Low |
| `Layout.tsx` | Main layout wrapper | Medium |

**Form Hooks Pattern** (Reference: `server/src/pages/hooks/useSignInForm.tsx`):
- Uses `useState`, `useMemo`, `useCallback` from Hono JSX
- Yup schema validation
- Form state management with touched tracking
- API calls via fetch with error handling
- **Port to:** Vue composables with `ref`, `computed`, `watch`

**Theming System** (CSS Variables - MUST PRESERVE):
```css
:root {
  --color-layoutColor: #ffffff;
  --color-labelColor: #1f2937;
  --color-primaryButtonColor: #3b82f6;
  --color-primaryButtonLabelColor: #ffffff;
  --color-primaryButtonBorderColor: #3b82f6;
  --color-secondaryButtonColor: #ffffff;
  --color-secondaryButtonLabelColor: #1f2937;
  --color-secondaryButtonBorderColor: #d1d5db;
  --color-criticalIndicatorColor: #ef4444;
  --font-default: system-ui;
}
```
These are dynamically set per-org from the backend. Vue app must:
1. Fetch theme config from API on load
2. Apply CSS variables to `:root`
3. Support org-specific branding via query param (`?org=slug`)

**Locale System** (Reference: `server/src/pages/tools/locale.ts`):
- Object-based translations with locale keys (en, fr, zh, pt)
- **Port to:** vue-i18n JSON files in `i18n/locales/`

### Admin Panel - Current Implementation References

**Pages to Port** (`admin-panel/app/[lang]/`):
| Route | Description |
|-------|-------------|
| `/dashboard` | System config overview, links |
| `/users` | User list with search/pagination |
| `/users/[authId]` | User detail, roles, orgs, MFA management |
| `/apps` | App list |
| `/apps/new` | Create new app |
| `/apps/[id]` | App detail, scopes, redirect URIs, MFA config |
| `/apps/banners/*` | App banner management |
| `/orgs` | Organization list |
| `/orgs/new` | Create organization |
| `/orgs/[id]` | Org detail, branding, groups |
| `/roles` | Role list |
| `/roles/new` | Create role |
| `/roles/[id]` | Role detail |
| `/scopes` | Scope list |
| `/scopes/new` | Create scope |
| `/scopes/[id]` | Scope detail with locales |
| `/user-attributes` | User attribute list |
| `/user-attributes/new` | Create attribute |
| `/user-attributes/[id]` | Attribute detail |
| `/logs` | Log viewer (email, SMS, sign-in) |
| `/logs/email/[id]` | Email log detail |
| `/logs/sms/[id]` | SMS log detail |
| `/logs/sign-in/[id]` | Sign-in log detail |
| `/saml` | SAML IDP list |
| `/saml/new` | Create SAML IDP |
| `/saml/[id]` | SAML IDP detail |
| `/account` | User account management links |

**API Layer Pattern** (Reference: `admin-panel/services/auth/api.ts`):
- RTK Query with code-generated endpoints
- Provides/invalidates tags for cache management
- Full TypeScript types for all DTOs
- **Port to:** TanStack Query with axios, maintain type safety

**UI Components** (Reference: `admin-panel/components/`):
- shadcn/ui components in `components/ui/`
- Custom components: `PageTitle`, `Breadcrumb`, `SaveButton`, `DeleteButton`, `ConfirmModal`, `Pagination`, `UserTable`, etc.
- **Port to:** shadcn-vue equivalents with same API

**Translation Files** (Reference: `admin-panel/translations/en.json`):
- Nested JSON structure with namespaces: `layout`, `common`, `dashboard`, `apps`, `users`, etc.
- **Port to:** Same structure in vue-i18n

---

## 4. Acceptance Criteria

### Project Setup (Layer 0 - Must be completed first)

- [ ] Create `auth-ui/` directory at project root with Vite + Vue 3 + TypeScript
- [ ] Create `admin-panel-vue/` directory at project root with Vite + Vue 3 + TypeScript
- [ ] Both projects use Tailwind CSS v4 with @tailwindcss/vite plugin
- [ ] Both projects have proper `tsconfig.json` with path aliases (`@/`)
- [ ] Both projects have `vite.config.ts` with proper plugins and proxy setup for dev
- [ ] Both projects have `.env.example` with `VITE_API_URL` configuration
- [ ] ESLint + Prettier configured (optional, follow existing project patterns if any)

### Auth UI Structure

- [ ] `src/main.ts` - Vue app entry with Pinia, Vue Router, vue-i18n
- [ ] `src/App.vue` - Root component with router-view
- [ ] `src/router/index.ts` - Vue Router setup with routes for all auth pages
- [ ] `src/stores/auth.ts` - Pinia store for auth flow state
- [ ] `src/stores/locale.ts` - Pinia store for i18n state
- [ ] `src/stores/branding.ts` - Pinia store for theme/org branding
- [ ] `src/api/auth.ts` - Auth API calls (fetch-based, matching existing endpoints)
- [ ] `src/composables/` - All form composables:
  - [ ] `useSignInForm.ts`
  - [ ] `useSignUpForm.ts`
  - [ ] `useMfaForm.ts` (covers OTP, Email, SMS MFA)
  - [ ] `usePasskey.ts` (WebAuthn integration)
  - [ ] `useSocialAuth.ts`
  - [ ] `useChangePasswordForm.ts`
  - [ ] `useChangeEmailForm.ts`
  - [ ] `useResetPasswordForm.ts`
- [ ] `src/components/ui/` - Base UI components:
  - [ ] `PrimaryButton.vue`
  - [ ] `SecondaryButton.vue`
  - [ ] `FieldInput.vue`
  - [ ] `PasswordField.vue`
  - [ ] `EmailField.vue`
  - [ ] `PhoneField.vue`
  - [ ] `CodeInput.vue`
  - [ ] `CheckboxInput.vue`
  - [ ] `Spinner.vue`
  - [ ] `Banner.vue`
  - [ ] `SubmitError.vue`
  - [ ] `SuccessMessage.vue`
  - [ ] `ViewTitle.vue`
- [ ] `src/components/social/` - Social login buttons:
  - [ ] `GoogleSignIn.vue`
  - [ ] `FacebookSignIn.vue`
  - [ ] `GithubSignIn.vue`
  - [ ] `DiscordSignIn.vue`
  - [ ] `AppleSignIn.vue`
  - [ ] `OidcSignIn.vue`
- [ ] `src/components/layout/` - Layout components:
  - [ ] `AuthLayout.vue` (main layout with branding)
  - [ ] `LocaleSelector.vue`
- [ ] `src/views/` - Page views (all 24 pages listed above)
- [ ] `src/i18n/index.ts` - vue-i18n setup
- [ ] `src/i18n/locales/` - Translation files:
  - [ ] `en.json`
  - [ ] `pt.json`
  - [ ] `fr.json`
- [ ] `src/styles/main.css` - Tailwind CSS with CSS variable theming
- [ ] `index.html` - Entry HTML with proper meta tags

### Admin Panel Structure

- [ ] `src/main.ts` - Vue app entry with Pinia, Vue Router, vue-i18n, TanStack Query
- [ ] `src/App.vue` - Root component with layout and router-view
- [ ] `src/router/index.ts` - Vue Router with all admin routes
- [ ] `src/stores/auth.ts` - Pinia store for auth state (OAuth token management)
- [ ] `src/stores/config.ts` - Pinia store for system config
- [ ] `src/stores/error.ts` - Pinia store for error handling
- [ ] `src/api/client.ts` - Axios instance with auth interceptor
- [ ] `src/api/endpoints/` - TanStack Query hooks:
  - [ ] `users.ts`
  - [ ] `apps.ts`
  - [ ] `orgs.ts`
  - [ ] `roles.ts`
  - [ ] `scopes.ts`
  - [ ] `userAttributes.ts`
  - [ ] `logs.ts`
  - [ ] `saml.ts`
  - [ ] `appBanners.ts`
  - [ ] `orgGroups.ts`
- [ ] `src/composables/` - Form and utility composables:
  - [ ] `useAuth.ts` (OAuth flow, token refresh)
  - [ ] `useAccess.ts` (role-based access control)
  - [ ] `forms/useAppForm.ts`
  - [ ] `forms/useOrgForm.ts`
  - [ ] `forms/useUserForm.ts`
  - [ ] `forms/useRoleForm.ts`
  - [ ] `forms/useScopeForm.ts`
  - [ ] `forms/useUserAttributeForm.ts`
  - [ ] `forms/useSamlForm.ts`
- [ ] `src/components/ui/` - shadcn-vue components (initialize with CLI)
- [ ] `src/components/layout/` - Layout components:
  - [ ] `Sidebar.vue`
  - [ ] `Breadcrumb.vue`
  - [ ] `PageTitle.vue`
  - [ ] `MainLayout.vue`
- [ ] `src/components/shared/` - Shared components:
  - [ ] `SaveButton.vue`
  - [ ] `DeleteButton.vue`
  - [ ] `CreateButton.vue`
  - [ ] `UserTable.vue`
  - [ ] `Pagination.vue`
  - [ ] `ConfirmModal.vue`
  - [ ] `FieldError.vue`
  - [ ] `LoadingPage.vue`
  - [ ] `LocaleEditor.vue`
  - [ ] `ColorInput.vue`
  - [ ] `LinkInput.vue`
  - [ ] `ScopesEditor.vue`
- [ ] `src/views/` - All admin views (15+ pages listed above)
- [ ] `src/i18n/` - vue-i18n setup with locales
- [ ] `src/utils/` - Utility functions:
  - [ ] `access.ts` (permission checking)
  - [ ] `routes.ts` (route constants)
- [ ] `index.html` - Entry HTML

### Theming Requirements

- [ ] Auth UI loads branding config from API or query params on startup
- [ ] CSS variables are applied dynamically to `:root`
- [ ] All UI components use CSS variable references for colors
- [ ] Font family and font URL are configurable
- [ ] Company logo URL is configurable
- [ ] Theme is editable from Admin Panel org settings
- [ ] Modern/cool default theme that looks better than current implementation

### API Configuration

- [ ] Both projects use `VITE_API_URL` environment variable
- [ ] Default to `http://localhost:8787` in development
- [ ] Vite dev server proxies `/api/*` and `/authorize/*` to API URL
- [ ] CORS handled properly in production via server config

### Build & Development

- [ ] `npm run dev` starts Vite dev server with HMR
- [ ] `npm run build` produces static `dist/` folder
- [ ] `npm run preview` previews production build
- [ ] `npm run type-check` runs TypeScript type checking
- [ ] Both projects can run independently
- [ ] Both projects work with the existing API server at port 8787/8788

---

## 5. Implementation Guidance

### Execution Layers

**Layer 0 (Foundation) - MUST complete first:**
1. Initialize both Vite + Vue 3 + TypeScript projects
2. Configure Tailwind CSS v4 with @tailwindcss/vite
3. Set up path aliases and TypeScript config
4. Install all dependencies
5. Create base folder structure

**Layer 1 (Core Infrastructure) - Parallel execution possible:**
1. Pinia stores setup (auth, locale, branding, config, error)
2. Vue Router configuration with all routes
3. vue-i18n setup with initial translations
4. API client setup (fetch for auth-ui, axios + TanStack Query for admin)
5. Base component library (buttons, inputs, layout)

**Layer 2 (Features) - Parallel execution possible:**
1. Auth UI: SignIn/SignUp flow (core authentication)
2. Auth UI: MFA flows (OTP, Email, SMS)
3. Auth UI: Passkey/WebAuthn integration
4. Auth UI: Account management pages
5. Admin Panel: Dashboard and layout
6. Admin Panel: Users CRUD
7. Admin Panel: Apps CRUD
8. Admin Panel: Other entity CRUD (orgs, roles, scopes, etc.)

**Layer 3 (Polish) - After core features:**
1. Modern theme design and implementation
2. Theme customization from admin
3. i18n completion for all locales
4. Responsive design optimization
5. Loading states and error handling
6. Build optimization

### Expected Artifacts

**Code Files:**
- All files listed in the structure above
- Follow Vue 3 Composition API with `<script setup lang="ts">`
- Use TypeScript strict mode
- Follow existing naming conventions (kebab-case for files, PascalCase for components)

**Configuration Files:**
- `package.json` with all dependencies
- `vite.config.ts` with plugins and proxy
- `tsconfig.json` with path aliases
- `tailwind.config.ts` (if needed for customization)
- `.env.example` with required variables

### Constraints

**DO NOT:**
- Create mock data or stub implementations - use real API calls
- Skip any of the 24 auth UI pages
- Skip any of the admin panel pages
- Use React patterns or syntax
- Use any UI library other than Radix Vue / shadcn-vue for admin
- Remove or modify the existing `admin-panel/` or `server/src/pages/` directories
- Use inline styles - use Tailwind classes or CSS variables

**MUST:**
- Preserve exact API contract (same endpoints, same request/response shapes)
- Preserve exact theming CSS variables
- Support all 3 locales (en, pt, fr) minimum
- Use proper TypeScript types (no `any`)
- Handle loading and error states
- Support mobile-responsive layouts

---

## 5.1 Testing Guidance

**Testing Approach:** Minimal unit tests for composables with non-trivial logic. Integration tests are NOT required for initial scaffold.

**Unit Tests (If time permits):**
- Form composables: validation logic only
- Auth store: state mutations
- Utility functions: pure functions only

**Skip Testing For:**
- Vue components (visual testing later)
- API calls (E2E testing later)
- Configuration files

---

## 6. Verification and Traceability

### Self-Verification Checklist

Before marking task complete, verify:

- [ ] Both `auth-ui/` and `admin-panel-vue/` directories exist at project root
- [ ] `npm install` succeeds in both projects
- [ ] `npm run dev` starts both projects without errors
- [ ] `npm run build` produces valid `dist/` folder in both projects
- [ ] TypeScript compilation has no errors (`npm run type-check`)
- [ ] All folder structure matches the acceptance criteria
- [ ] All required files are created (check each file in acceptance criteria)
- [ ] CSS variables theming system is implemented
- [ ] vue-i18n is configured with all 3 locale files
- [ ] Vue Router has routes for all pages
- [ ] Pinia stores are created for all required state
- [ ] API client is configured with proper base URL from env
- [ ] shadcn-vue components are initialized in admin panel

### Traceability Matrix

| Original Requirement | Implementation Location |
|---------------------|------------------------|
| Auth UI pages (24) | `auth-ui/src/views/` |
| Form hooks → composables | `auth-ui/src/composables/` |
| Admin pages (15+) | `admin-panel-vue/src/views/` |
| RTK Query → TanStack | `admin-panel-vue/src/api/endpoints/` |
| CSS theming | `auth-ui/src/styles/main.css`, `src/stores/branding.ts` |
| i18n translations | `*/src/i18n/locales/*.json` |
| shadcn/ui → shadcn-vue | `admin-panel-vue/src/components/ui/` |

---

## 7. Reasoning Boundaries

**Prefer:**
- Following existing patterns from current implementations
- Simple, readable code over clever abstractions
- Vue 3 Composition API best practices
- Type safety with proper TypeScript interfaces

**Avoid:**
- Over-engineering or premature optimization
- Creating unnecessary abstractions
- Deviating from Vue ecosystem conventions
- Adding features not in the original implementations

**When Uncertain:**
- Reference the existing Hono JSX or Next.js implementation
- Check the CLAUDE-VUE-REWRITE.md for additional context
- Ask for clarification rather than guessing

---

## Appendix A: API Endpoints Reference

Auth UI calls these endpoints (stay on Hono server):
- `POST /authorize/password` - Password login
- `POST /authorize/passwordless` - Passwordless login
- `POST /authorize/social/*` - Social login callbacks
- `POST /authorize/mfa/*` - MFA verification
- `POST /authorize/passkey/*` - Passkey flows
- `GET /authorize` - Get auth session info
- `POST /identity/*` - Account management

Admin Panel calls these endpoints:
- `GET/POST/PUT/DELETE /api/v1/users/*`
- `GET/POST/PUT/DELETE /api/v1/apps/*`
- `GET/POST/PUT/DELETE /api/v1/orgs/*`
- `GET/POST/PUT/DELETE /api/v1/roles/*`
- `GET/POST/PUT/DELETE /api/v1/scopes/*`
- `GET/POST/PUT/DELETE /api/v1/user-attributes/*`
- `GET/POST/PUT/DELETE /api/v1/logs/*`
- `GET/POST/PUT/DELETE /api/v1/saml/idps/*`
- `GET/POST/PUT/DELETE /api/v1/app-banners/*`
- `GET/POST/PUT/DELETE /api/v1/org-groups/*`

Full API types are defined in `admin-panel/services/auth/api.ts`.

---

## Appendix B: shadcn-vue Components to Initialize

For Admin Panel, initialize these shadcn-vue components:
- button
- input
- textarea
- label
- card
- table
- badge
- checkbox
- switch
- select
- alert
- alert-dialog
- dropdown-menu
- separator
- skeleton
- spinner
- tooltip
- sheet
- sidebar
- breadcrumb
- pagination
- navigation-menu

Reference: https://www.shadcn-vue.com/docs/installation/vite.html
