# Full Vue.js Static Rewrite Guide

## Overview

Rewrite **both frontends** as static Vue.js SPAs:

| Frontend | Current Stack | Location |
|----------|---------------|----------|
| **Auth UI** | Hono JSX + Tailwind | `server/src/pages/` |
| **Admin Panel** | Next.js + React | `admin-panel/` |

---

# Part 1: Auth UI (Login/Signup/MFA)

## Current Stack → Target

| Current | Target |
|---------|--------|
| Hono JSX | Vue 3 + Vite |
| Hono hooks | Vue Composition API |
| Tailwind CSS v4 | Tailwind CSS v4 |
| Custom i18n | vue-i18n |
| Server-rendered | Static SPA |

## Current Auth Pages (24 pages)

**Core Authentication:**
- `SignIn.tsx` - Login (email/password, passkey, passwordless, social)
- `SignUp.tsx` - Registration with custom attributes
- `Consent.tsx` - OAuth consent page

**MFA:**
- `MfaEnroll.tsx` - MFA method selection
- `OtpSetup.tsx` - Authenticator QR setup
- `OtpMfa.tsx` - OTP verification
- `EmailMfa.tsx` - Email MFA
- `SmsMfa.tsx` - SMS MFA
- `PasskeyEnroll.tsx` - Passkey enrollment
- `RecoveryCodeEnroll.tsx` - Recovery codes

**Account Management:**
- `UpdateInfo.tsx` - Update profile
- `ChangePassword.tsx` - Change password
- `ChangeEmail.tsx` - Change email
- `VerifyEmail.tsx` - Email verification
- `ResetPassword.tsx` - Password reset
- `ResetMfa.tsx` - Reset MFA

**Advanced:**
- `ManagePasskey.tsx` - Manage passkeys
- `ManageRecoveryCode.tsx` - Manage recovery codes
- `RecoveryCodeSignIn.tsx` - Login with recovery code
- `PasswordlessVerify.tsx` - Passwordless verification
- `SwitchOrg.tsx` - Org switching
- `ChangeOrg.tsx` - Change org
- `AuthCodeExpired.tsx` - Error page

## Current Components

**Vanilla Components** (`pages/components/vanilla/`):
- `PrimaryButton.tsx`, `SecondaryButton.tsx`
- `ViewTitle.tsx`
- `FieldInput.tsx`, `PasswordField.tsx`, `EmailField.tsx`, `PhoneField.tsx`
- `CodeInput.tsx`, `CheckboxInput.tsx`
- `SubmitError.tsx`, `SuccessMessage.tsx`
- `LocaleSelector.tsx`, `Spinner.tsx`, `Banner.tsx`
- `RecoveryCodeContainer.tsx`
- Social buttons: `GoogleSignIn.tsx`, `FacebookSignIn.tsx`, `GithubSignIn.tsx`, `DiscordSignIn.tsx`, `AppleSignIn.tsx`, `OidcSignIn.tsx`

**Hooks** (`pages/hooks/`):
- `useSignInForm`, `useSignUpForm`, `useChangePasswordForm`
- `useCurrentView`, `useLocale`, `useInitialProps`
- `usePasskeyVerifyForm`, `useSocialSignIn`, `useAppBanners`

## Vue Auth UI Structure

```
auth-ui/
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/index.ts
│   ├── stores/
│   │   ├── auth.ts          # Auth flow state
│   │   ├── locale.ts        # i18n state
│   │   └── branding.ts      # Theme/org branding
│   ├── api/
│   │   └── auth.ts          # Auth API calls
│   ├── composables/
│   │   ├── useSignInForm.ts
│   │   ├── useSignUpForm.ts
│   │   ├── useMfaForm.ts
│   │   ├── usePasskey.ts
│   │   └── useSocialAuth.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── PrimaryButton.vue
│   │   │   ├── SecondaryButton.vue
│   │   │   ├── FieldInput.vue
│   │   │   ├── PasswordField.vue
│   │   │   ├── CodeInput.vue
│   │   │   ├── Spinner.vue
│   │   │   └── Banner.vue
│   │   ├── social/
│   │   │   ├── GoogleSignIn.vue
│   │   │   ├── FacebookSignIn.vue
│   │   │   ├── GithubSignIn.vue
│   │   │   ├── DiscordSignIn.vue
│   │   │   ├── AppleSignIn.vue
│   │   │   └── OidcSignIn.vue
│   │   └── layout/
│   │       ├── AuthLayout.vue
│   │       └── LocaleSelector.vue
│   ├── views/
│   │   ├── SignIn.vue
│   │   ├── SignUp.vue
│   │   ├── Consent.vue
│   │   ├── mfa/
│   │   │   ├── MfaEnroll.vue
│   │   │   ├── OtpSetup.vue
│   │   │   ├── OtpMfa.vue
│   │   │   ├── EmailMfa.vue
│   │   │   ├── SmsMfa.vue
│   │   │   └── RecoveryCodeEnroll.vue
│   │   ├── passkey/
│   │   │   ├── PasskeyEnroll.vue
│   │   │   └── ManagePasskey.vue
│   │   ├── account/
│   │   │   ├── UpdateInfo.vue
│   │   │   ├── ChangePassword.vue
│   │   │   ├── ChangeEmail.vue
│   │   │   ├── VerifyEmail.vue
│   │   │   └── ResetPassword.vue
│   │   └── org/
│   │       ├── SwitchOrg.vue
│   │       └── ChangeOrg.vue
│   ├── i18n/
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── en.json
│   │       ├── fr.json
│   │       ├── pt.json
│   │       └── zh.json
│   └── styles/
│       └── main.css         # Tailwind + CSS vars
├── index.html
├── vite.config.ts
└── tailwind.config.ts
```

## Auth UI Theming

Current CSS variables (preserve these):
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

These are set dynamically per-org from the backend. Load from API or query params.

## Auth API Integration

The auth UI needs to call these endpoints:
- `POST /authorize/password` - Password login
- `POST /authorize/passwordless` - Passwordless login
- `POST /authorize/social/*` - Social login callbacks
- `POST /authorize/mfa/*` - MFA verification
- `POST /authorize/passkey/*` - Passkey flows
- `GET /authorize` - Get auth session info
- etc.

These stay on the Hono server - Vue just calls them via fetch.

---

# Part 2: Admin Panel

## Current Stack → Target

| Current | Target |
|---------|--------|
| Next.js 14 | Vue 3 + Vite |
| React | Vue 3 Composition API |
| RTK Query | TanStack Query |
| Redux + Signals | Pinia |
| next-intl | vue-i18n |
| @melody-auth/react | Custom composable |
| shadcn/ui (Radix) | shadcn-vue / Radix Vue |
| Tailwind CSS | Tailwind CSS |

## Admin Pages (15 pages)

- Dashboard
- Users (list, detail)
- Apps (list, new, detail, banners)
- Orgs (list, new, detail)
- Roles (list, new, detail)
- Scopes (list, new, detail)
- User Attributes (list, new, detail)
- Logs (list, details)
- SAML (list, new, detail)
- Account

## Vue Admin Structure

```
admin-panel-vue/
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/index.ts
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── config.ts
│   │   └── error.ts
│   ├── api/
│   │   ├── client.ts
│   │   └── endpoints/
│   │       ├── users.ts
│   │       ├── apps.ts
│   │       ├── orgs.ts
│   │       ├── roles.ts
│   │       ├── scopes.ts
│   │       └── logs.ts
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useAccess.ts
│   │   └── forms/
│   │       ├── useAppForm.ts
│   │       ├── useOrgForm.ts
│   │       └── useUserForm.ts
│   ├── components/
│   │   ├── ui/              # shadcn-vue
│   │   ├── layout/
│   │   │   ├── Sidebar.vue
│   │   │   ├── Breadcrumb.vue
│   │   │   └── PageTitle.vue
│   │   └── shared/
│   │       ├── SaveButton.vue
│   │       ├── DeleteButton.vue
│   │       ├── UserTable.vue
│   │       ├── Pagination.vue
│   │       └── ConfirmModal.vue
│   ├── views/
│   │   ├── Dashboard.vue
│   │   ├── users/
│   │   ├── apps/
│   │   ├── orgs/
│   │   ├── roles/
│   │   ├── scopes/
│   │   ├── logs/
│   │   ├── saml/
│   │   └── account/
│   ├── i18n/
│   │   └── locales/
│   │       ├── en.json
│   │       ├── fr.json
│   │       └── pt.json
│   └── utils/
│       ├── access.ts
│       └── routes.ts
├── index.html
├── vite.config.ts
└── tailwind.config.ts
```

---

# Part 3: Deployment Architecture

## Option A: Separate Static Builds (Recommended)

```
                    ┌─────────────────────────┐
                    │    Cloudflare/Nginx     │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Auth UI     │     │  Admin Panel    │     │   API Server    │
│  (Vue Static) │     │  (Vue Static)   │     │    (Hono)       │
│               │     │                 │     │                 │
│ auth.foo.com  │     │ admin.foo.com   │     │ api.foo.com     │
└───────────────┘     └─────────────────┘     └─────────────────┘
```

## Option B: Single Static Build

```
frontend/
├── auth/          # Auth UI pages
├── admin/         # Admin panel
└── index.html     # Router decides based on path
```

## Option C: Monorepo with Shared Components

```
packages/
├── ui/            # Shared Vue components
├── auth-ui/       # Auth frontend
├── admin-ui/      # Admin frontend
└── api-client/    # Shared API client
```

---

# Part 4: Migration Strategy

## Phase 1: Setup (1-2 days)
1. Create Vue 3 + Vite projects for both apps
2. Setup Tailwind CSS with same config
3. Setup vue-i18n with existing translations
4. Setup Pinia stores
5. Setup TanStack Query

## Phase 2: Auth UI (3-5 days)
1. Port CSS variables theming system
2. Create base components (buttons, inputs, etc.)
3. Create auth composables (useSignInForm, etc.)
4. Port pages one by one:
   - SignIn, SignUp first (core flow)
   - MFA pages
   - Account management pages
5. Test OAuth flow end-to-end

## Phase 3: Admin Panel (5-7 days)
1. Setup auth (OAuth callback, token management)
2. Create API layer with TanStack Query
3. Port shadcn components or install shadcn-vue
4. Port pages:
   - Dashboard first
   - Users CRUD
   - Apps CRUD
   - Remaining sections
5. Test RBAC and all features

## Phase 4: Integration (1-2 days)
1. Configure CORS on API server
2. Setup deployment (Cloudflare Pages, Netlify, etc.)
3. Test custom domains with static frontend
4. Performance optimization

---

# Part 5: Key Code Examples

## Auth UI - SignIn.vue

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSignInForm } from '@/composables/useSignInForm'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import FieldInput from '@/components/ui/FieldInput.vue'
import PasswordField from '@/components/ui/PasswordField.vue'
import GoogleSignIn from '@/components/social/GoogleSignIn.vue'

const { t } = useI18n()
const {
  email,
  password,
  error,
  isLoading,
  submit
} = useSignInForm()
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-semibold text-[--color-labelColor]">
      {{ t('signIn.title') }}
    </h1>

    <FieldInput
      v-model="email"
      type="email"
      :label="t('signIn.email')"
    />

    <PasswordField
      v-model="password"
      :label="t('signIn.password')"
    />

    <p v-if="error" class="text-[--color-criticalIndicatorColor] text-sm">
      {{ error }}
    </p>

    <PrimaryButton
      :loading="isLoading"
      @click="submit"
    >
      {{ t('signIn.submit') }}
    </PrimaryButton>

    <div class="flex gap-2">
      <GoogleSignIn />
    </div>
  </div>
</template>
```

## Admin Panel - useAppForm.ts

```typescript
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { App } from '@/api/types'

export function useAppForm(initialApp?: App) {
  const { t } = useI18n()

  const name = ref(initialApp?.name ?? '')
  const type = ref(initialApp?.type ?? 'spa')
  const redirectUris = ref(initialApp?.redirectUris ?? [])
  const scopes = ref(initialApp?.scopes ?? [])

  const errors = computed(() => ({
    name: name.value.trim() ? undefined : t('common.fieldIsRequired'),
    redirectUris: redirectUris.value.length ? undefined : t('apps.redirectUrisRequired')
  }))

  const isValid = computed(() =>
    Object.values(errors.value).every(e => !e)
  )

  const values = computed(() => ({
    name: name.value,
    type: type.value,
    redirectUris: redirectUris.value,
    scopes: scopes.value
  }))

  watch(() => initialApp, (app) => {
    if (app) {
      name.value = app.name
      type.value = app.type
      redirectUris.value = app.redirectUris
      scopes.value = app.scopes
    }
  }, { immediate: true })

  return {
    name,
    type,
    redirectUris,
    scopes,
    errors,
    isValid,
    values
  }
}
```

## API Client with TanStack Query

```typescript
// api/client.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// api/endpoints/apps.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '../client'

export const useApps = () => useQuery({
  queryKey: ['apps'],
  queryFn: () => api.get('/api/v1/apps').then(r => r.data)
})

export const useApp = (id: number) => useQuery({
  queryKey: ['apps', id],
  queryFn: () => api.get(`/api/v1/apps/${id}`).then(r => r.data)
})

export const useCreateApp = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAppDto) => api.post('/api/v1/apps', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apps'] })
  })
}

export const useUpdateApp = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAppDto }) =>
      api.put(`/api/v1/apps/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apps'] })
  })
}
```

---

# Part 6: Server Changes Required

## 1. Serve Static Files

```typescript
// server/src/index.ts
import { serveStatic } from 'hono/cloudflare-workers'

// Serve auth UI
app.use('/auth/*', serveStatic({ root: './auth-ui/dist' }))

// Or configure in wrangler.toml for Cloudflare Pages
```

## 2. CORS Configuration

```typescript
// Already has cors() middleware, may need to add origins
app.use(cors({
  origin: [
    'https://auth.yourapp.com',
    'https://admin.yourapp.com',
    'http://localhost:5173'  // Dev
  ]
}))
```

## 3. API-Only Mode

Remove Hono JSX rendering, keep only API endpoints:
- Remove `server/src/pages/` (moved to Vue)
- Remove `@hono/vite-build` dependency
- Keep all `/api/*` and `/authorize/*` API routes

---

# Part 7: Estimated Effort

| Task | Hours |
|------|-------|
| **Auth UI** | |
| Project setup | 2-4 |
| Base components | 8-12 |
| SignIn/SignUp pages | 8-12 |
| MFA pages (6) | 12-16 |
| Account pages (5) | 8-12 |
| Social auth integration | 4-8 |
| Passkey/WebAuthn | 4-8 |
| i18n (4 languages) | 2-4 |
| **Auth UI Total** | **48-76** |
| | |
| **Admin Panel** | |
| Project setup | 2-4 |
| Auth flow | 4-8 |
| API layer | 4-8 |
| UI components | 8-16 |
| Pages (15) | 16-24 |
| i18n (3 languages) | 2-4 |
| **Admin Panel Total** | **36-64** |
| | |
| **Integration** | |
| CORS/deployment | 4-8 |
| Testing | 8-16 |
| **Integration Total** | **12-24** |
| | |
| **GRAND TOTAL** | **96-164 hours** |

---

# Part 8: File Mapping Reference

## Auth UI Files to Port

| Current (Hono JSX) | Target (Vue) |
|--------------------|--------------|
| `pages/views/SignIn.tsx` | `views/SignIn.vue` |
| `pages/views/SignUp.tsx` | `views/SignUp.vue` |
| `pages/views/Consent.tsx` | `views/Consent.vue` |
| `pages/views/MfaEnroll.tsx` | `views/mfa/MfaEnroll.vue` |
| `pages/views/OtpSetup.tsx` | `views/mfa/OtpSetup.vue` |
| `pages/views/OtpMfa.tsx` | `views/mfa/OtpMfa.vue` |
| `pages/views/EmailMfa.tsx` | `views/mfa/EmailMfa.vue` |
| `pages/views/SmsMfa.tsx` | `views/mfa/SmsMfa.vue` |
| `pages/hooks/useSignInForm.ts` | `composables/useSignInForm.ts` |
| `pages/hooks/useSignUpForm.ts` | `composables/useSignUpForm.ts` |
| `pages/components/vanilla/*` | `components/ui/*` |
| `pages/tools/locale.ts` | `i18n/locales/*.json` |

## Admin Panel Files to Port

| Current (Next.js) | Target (Vue) |
|-------------------|--------------|
| `app/[lang]/dashboard/page.tsx` | `views/Dashboard.vue` |
| `app/[lang]/users/page.tsx` | `views/users/UserList.vue` |
| `app/[lang]/users/[authId]/page.tsx` | `views/users/UserDetail.vue` |
| `app/[lang]/apps/page.tsx` | `views/apps/AppList.vue` |
| `app/[lang]/apps/[id]/page.tsx` | `views/apps/AppDetail.vue` |
| `app/[lang]/orgs/useEditOrg.tsx` | `composables/forms/useOrgForm.ts` |
| `services/auth/api.ts` | `api/endpoints/*.ts` |
| `stores/app.tsx` | `stores/auth.ts` |
| `signals/config.ts` | `stores/config.ts` |
| `components/ui/*` | `components/ui/*` (shadcn-vue) |
| `translations/*.json` | `i18n/locales/*.json` |
