# Localization

This guide explains how to add and use a new locale in Melody Auth for identity pages and email templates.

## Overview
- Default locales: `en` and `fr`
- Additionally supported: `zh`
- You can add more locales by providing translations and updating configuration

## Add translations for email templates
Provide translations for your new locale in `server/src/configs/locale.ts`.

## Add translations for identity pages
You can add translations for identity pages in `server/src/pages/tools/locale.ts`.

## Allow the locale in server config
Update `SUPPORTED_LOCALES` in `server/wrangler.toml` under `[vars]` so the identity pages and emails can use it.

```toml
[vars]
SUPPORTED_LOCALES = ["en", "fr", "de"]
# Optional: show a language switcher on identity pages
ENABLE_LOCALE_SELECTOR = true
```

Notes:
- Supported locales mentioned in docs: ['en', 'fr', 'zh']
- If you include only one locale in `SUPPORTED_LOCALES`, the selector is hidden even if `ENABLE_LOCALE_SELECTOR` is true.
- You can remove any locale from `SUPPORTED_LOCALES` to disable it.

## Specify a locale for the authentication flow
You can pass a locale when starting the authentication flow via the SDKs. 
Example:

```tsx
import { useAuth } from '@melody-auth/react'

function LoginButton() {
  const { loginRedirect } = useAuth()
  return (
    <button onClick={() => loginRedirect({ locale: 'de' })}>
      Login (DE)
    </button>
  )
}
```
