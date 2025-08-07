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
          discordClientId: '',
          appleClientId: '',
          enableLocaleSelector: false,
          enableSignUp: false,
          enablePasswordReset: false,
          enablePasswordSignIn: false,
          enablePasswordlessSignIn: false,
          enableMfaRememberDevice: false,
          enableUserAttribute: false,
          enableNames: false,
          enableAppBanner: false,
          namesIsRequired: false,
          termsLink: '',
          privacyPolicyLink: '',
          appName: '',
          allowPasskey: false,
          allowRecoveryCode: false,
          oidcProviders: [],
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
          discordClientId: 'discord-id-101',
          appleClientId: 'apple-id-123',
          enableLocaleSelector: true,
          enableSignUp: true,
          enablePasswordReset: true,
          enablePasswordSignIn: true,
          enablePasswordlessSignIn: true,
          enableMfaRememberDevice: true,
          enableUserAttribute: true,
          enableNames: true,
          enableAppBanner: true,
          namesIsRequired: true,
          termsLink: 'http://example.com/terms',
          privacyPolicyLink: 'http://example.com/privacy',
          appName: 'TestApp',
          allowPasskey: true,
          allowRecoveryCode: true,
        }

        const { result } = renderHook(() => useInitialProps())
        const initialProps = result.current.initialProps
        expect(initialProps).toEqual({
          locales: ['en', 'fr', 'es'],
          logoUrl: 'http://example.com/logo.png',
          googleClientId: 'google-id-123',
          facebookClientId: 'facebook-id-456',
          githubClientId: 'github-id-789',
          discordClientId: 'discord-id-101',
          appleClientId: 'apple-id-123',
          enableLocaleSelector: true,
          enableSignUp: true,
          enablePasswordReset: true,
          enablePasswordSignIn: true,
          enablePasswordlessSignIn: true,
          enableMfaRememberDevice: true,
          enableUserAttribute: true,
          enableNames: true,
          enableAppBanner: true,
          namesIsRequired: true,
          termsLink: 'http://example.com/terms',
          privacyPolicyLink: 'http://example.com/privacy',
          appName: 'TestApp',
          allowPasskey: true,
          allowRecoveryCode: true,
          oidcProviders: [],
        })
      },
    )

    test(
      'returns default values for missing logoUrl and locales when window.__initialProps exists',
      () => {
        // Set window.__initialProps with minimal props, explicitly omitting logoUrl and locales
        (window as any).__initialProps = {
          googleClientId: 'google-id-123',
          enableSignUp: true,
          oidcProviders: [],
          // other props but no logoUrl or locales
        }

        const { result } = renderHook(() => useInitialProps())
        const initialProps = result.current.initialProps

        // Verify that missing properties get default values
        expect(initialProps.logoUrl).toBe('')
        expect(initialProps.locales).toEqual([])

        // Verify that provided properties are still there
        expect(initialProps.googleClientId).toBe('google-id-123')
        expect(initialProps.enableSignUp).toBe(true)
      },
    )
  },
)
