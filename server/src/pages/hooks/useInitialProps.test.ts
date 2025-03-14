import { renderHook } from '@testing-library/react'
import {
  expect, describe, test, beforeEach,
} from 'vitest'
import useInitialProps from './useInitialProps'

describe(
  'useInitialProps',
  () => {
  // Ensure __initialProps is reset before each test
    beforeEach(() => {
      delete (window as any).__initialProps
    })

    test(
      'returns default values when window.__initialProps is not defined',
      () => {
        const { result } = renderHook(() => useInitialProps())
        const initialProps = result.current.initialProps
        expect(initialProps).toEqual({
          locales: [''],
          logoUrl: '',
          googleClientId: '',
          facebookClientId: '',
          githubClientId: '',
          enableLocaleSelector: false,
          enableSignUp: false,
          enablePasswordReset: false,
          enablePasswordSignIn: false,
          enablePasswordlessSignIn: false,
          enableNames: false,
          namesIsRequired: false,
          termsLink: '',
          privacyPolicyLink: '',
          appName: '',
          allowPasskey: false,
        })
      },
    )

    test(
      'returns values from window.__initialProps when defined',
      () => {
        // Set the global window.__initialProps with test values
        (window as any).__initialProps = {
          locales: 'en,fr,es',
          logoUrl: 'http://example.com/logo.png',
          googleClientId: 'google-id-123',
          facebookClientId: 'facebook-id-456',
          githubClientId: 'github-id-789',
          enableLocaleSelector: true,
          enableSignUp: true,
          enablePasswordReset: true,
          enablePasswordSignIn: true,
          enablePasswordlessSignIn: true,
          enableNames: true,
          namesIsRequired: true,
          termsLink: 'http://example.com/terms',
          privacyPolicyLink: 'http://example.com/privacy',
          appName: 'TestApp',
          allowPasskey: true,
        }

        const { result } = renderHook(() => useInitialProps())
        const initialProps = result.current.initialProps
        expect(initialProps).toEqual({
          locales: ['en', 'fr', 'es'],
          logoUrl: 'http://example.com/logo.png',
          googleClientId: 'google-id-123',
          facebookClientId: 'facebook-id-456',
          githubClientId: 'github-id-789',
          enableLocaleSelector: true,
          enableSignUp: true,
          enablePasswordReset: true,
          enablePasswordSignIn: true,
          enablePasswordlessSignIn: true,
          enableNames: true,
          namesIsRequired: true,
          termsLink: 'http://example.com/terms',
          privacyPolicyLink: 'http://example.com/privacy',
          appName: 'TestApp',
          allowPasskey: true,
        })
      },
    )
  },
)
