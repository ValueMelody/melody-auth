## PROMPT

Create the complete `auth-ui/` Vue 3 static SPA project that replaces the existing Hono JSX authentication pages. This is a full implementation including project setup, all 24 authentication views, form composables, UI components, stores, routing, i18n, and theming.

**You are building a production-ready authentication UI.** Every auth flow (sign-in, sign-up, MFA, passkey, password reset, etc.) must work end-to-end with the existing API server.

## COMPLEXITY

High

## CONTEXT REFERENCE

**For complete environment context, read:**
- `/home/pedro/storage/www/goauth.me/.claudiomiro/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create

New directory structure at `auth-ui/`:
```
auth-ui/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts (if needed)
├── .env.example
├── index.html
└── src/
    ├── main.ts
    ├── App.vue
    ├── router/index.ts
    ├── stores/
    │   ├── auth.ts
    │   ├── locale.ts
    │   └── branding.ts
    ├── api/auth.ts
    ├── composables/
    │   ├── useSignInForm.ts
    │   ├── useSignUpForm.ts
    │   ├── useMfaForm.ts
    │   ├── usePasskey.ts
    │   ├── useSocialAuth.ts
    │   ├── useChangePasswordForm.ts
    │   ├── useChangeEmailForm.ts
    │   └── useResetPasswordForm.ts
    ├── components/
    │   ├── ui/ (13 components)
    │   ├── social/ (6 components)
    │   └── layout/ (2 components)
    ├── views/ (24 views)
    ├── i18n/
    │   ├── index.ts
    │   └── locales/
    │       ├── en.json
    │       ├── pt.json
    │       └── fr.json
    └── styles/main.css
```

### Reference Files to Study

Before implementing, read these files to understand existing patterns:

**Page Views (port these to Vue):**
- `server/src/pages/blocks/SignIn.tsx` - Main login page
- `server/src/pages/blocks/SignUp.tsx` - Registration page
- `server/src/pages/blocks/Consent.tsx` - OAuth consent
- `server/src/pages/blocks/MfaEnroll.tsx` - MFA method selection
- `server/src/pages/blocks/OtpSetup.tsx` - Authenticator setup with QR
- `server/src/pages/blocks/Layout.tsx` - Page layout wrapper

**Form Hooks (port to composables):**
- `server/src/pages/hooks/useSignInForm.tsx` - Form state pattern with Yup

**Components (port to Vue):**
- `server/src/pages/components/*.tsx` - UI component patterns

**Locale (port to vue-i18n):**
- `server/src/pages/tools/locale.ts` - Translation keys

### API Endpoints

Auth UI calls these endpoints (already implemented on server):
```
POST /authorize/password     - Password login
POST /authorize/passwordless - Passwordless login start
POST /authorize/social/*     - Social login callbacks
POST /authorize/mfa/*        - MFA verification
POST /authorize/passkey/*    - Passkey flows
GET  /authorize              - Get auth session info
POST /identity/*             - Account management
```

### CSS Variables for Theming

Must preserve exact variable names (fetched from API per org):
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

### Dependencies to Install

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
    "@tailwindcss/vite": "^4.0",
    "vue-tsc": "^2.0"
  }
}
```

## EXTRA DOCUMENTATION

### Vue 3 Composition API Pattern

All components must use `<script setup lang="ts">`:
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const loading = ref(false)
</script>

<template>
  <button :disabled="loading">{{ t('common.submit') }}</button>
</template>
```

### Composable Pattern (porting from React hooks)

React hook:
```tsx
const [email, setEmail] = useState('')
const [errors, setErrors] = useState({})
const isValid = useMemo(() => !errors.email, [errors])
```

Vue composable:
```ts
const email = ref('')
const errors = ref<Record<string, string>>({})
const isValid = computed(() => !errors.value.email)
```

### Passkey Integration

Use @simplewebauthn/browser:
```ts
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'

// In usePasskey.ts composable
const authenticate = async () => {
  const options = await fetch('/authorize/passkey/options').then(r => r.json())
  const credential = await startAuthentication(options)
  await fetch('/authorize/passkey/verify', {
    method: 'POST',
    body: JSON.stringify(credential)
  })
}
```

### Vite Proxy Configuration

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/authorize': {
        target: 'http://localhost:8787',
        changeOrigin: true
      },
      '/identity': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
})
```

## LAYER

1

## PARALLELIZATION

Parallel with: TASK1

## CONSTRAINTS

- IMPORTANT: Do not perform any git commit or git push.
- Prefer CLI or script-based actions over manual edits
- Use `npm create vue@latest` or equivalent for project initialization
- Use Tailwind CSS v4 with @tailwindcss/vite (NOT PostCSS config)
- Must work with existing API server at port 8787/8788
- DO NOT modify existing `server/src/pages/` - this is a replacement, not refactor
- DO NOT use React patterns - pure Vue 3 Composition API
- DO NOT use any CSS-in-JS - Tailwind classes + CSS variables only
- DO NOT create mock data - use real API calls
- All 24 views must be implemented (see AI_PROMPT.md Section 3)
- All 3 locales must have translation files (en, pt, fr)
- TypeScript strict mode - no `any` types
- Mobile-responsive layouts required

## VERIFICATION COMMANDS

After implementation, run these to verify:
```bash
cd auth-ui
npm install
npm run dev          # Should start on port 5173
npm run build        # Should produce dist/
npm run type-check   # Should pass with no errors
```

## SUCCESS CRITERIA

The auth-ui project is complete when:
1. All 24 auth pages render correctly
2. Forms validate input with Yup and show errors
3. API calls work with the existing Hono server
4. Theming loads from API and applies CSS variables
5. i18n works in all 3 locales
6. Passkey flows work with WebAuthn
7. Social login buttons redirect correctly
8. Build produces valid static files for deployment
