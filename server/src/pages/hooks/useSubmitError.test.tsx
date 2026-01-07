import {
  describe, expect, test, vi, beforeEach,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import { View } from './useCurrentView'
import useSubmitError from './useSubmitError'
import {
  messageConfig, routeConfig,
} from 'configs'
import {
  requestError, validateError,
} from 'pages/tools/locale'

// Mock hooks from hono/jsx
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useState: React.useState,
  }),
)

describe(
  'useSubmitError',
  () => {
    const locale = 'en'
    const onSwitchView = vi.fn()

    beforeEach(() => {
      onSwitchView.mockClear()
      // Reset window.location.href before each test
      Object.defineProperty(
        window,
        'location',
        {
          writable: true,
          value: {
            href: 'http://localhost', origin: 'http://localhost',
          },
        },
      )
    })

    test(
      'initializes with null submitError',
      () => {
        const { result } = renderHook(() =>
          useSubmitError({
            onSwitchView, locale,
          }))

        expect(result.current.submitError).toBeNull()
      },
    )

    test(
      'clears error when null is passed',
      () => {
        const { result } = renderHook(() =>
          useSubmitError({
            onSwitchView, locale,
          }))

        act(() => {
          result.current.handleSubmitError('some error')
        })
        expect(result.current.submitError).not.toBeNull()

        act(() => {
          result.current.handleSubmitError(null)
        })
        expect(result.current.submitError).toBeNull()
      },
    )

    test.each([
      ['isEmail', validateError.isNotEmail.en],
      [validateError.isNotEmail.en, validateError.isNotEmail.en],
      ['isStrongPassword', validateError.isWeakPassword.en],
      [messageConfig.RequestError.NoUser, requestError.noUser.en],
      [messageConfig.RequestError.UserDisabled, requestError.disabledUser.en],
      [messageConfig.RequestError.AccountLocked, requestError.accountLocked.en],
      [messageConfig.RequestError.OtpMfaLocked, requestError.optMfaLocked.en],
      [messageConfig.RequestError.SmsMfaLocked, requestError.smsMfaLocked.en],
      [messageConfig.RequestError.EmailMfaLocked, requestError.emailMfaLocked.en],
      [messageConfig.RequestError.PasswordResetLocked, requestError.passwordResetLocked.en],
      [messageConfig.RequestError.ChangeEmailLocked, requestError.changeEmailLocked.en],
      [messageConfig.RequestError.EmailTaken, requestError.emailTaken.en],
      [messageConfig.RequestError.WrongCode, requestError.wrongCode.en],
      [messageConfig.RequestError.RequireDifferentPassword, requestError.requireNewPassword.en],
      [messageConfig.RequestError.EmailAlreadyVerified, requestError.emailAlreadyVerified.en],
      [messageConfig.RequestError.RequireDifferentEmail, requestError.requireNewEmail.en],
      [messageConfig.RequestError.WrongMfaCode, requestError.wrongCode.en],
    ])(
      'sets correct error message for %s error',
      (
        errorInput, expectedMessage,
      ) => {
        const { result } = renderHook(() =>
          useSubmitError({
            onSwitchView, locale,
          }))

        act(() => {
          result.current.handleSubmitError(errorInput)
        })

        expect(result.current.submitError).toBe(expectedMessage)
      },
    )

    test(
      'handles WrongAuthCode error by redirecting and switching view',
      () => {
        const { result } = renderHook(() =>
          useSubmitError({
            onSwitchView,
            locale,
          }))

        // Mock URL and history
        const mockPushState = vi.fn()
        const originalHistory = window.history
        Object.defineProperty(
          window,
          'history',
          {
            value: { pushState: mockPushState },
            writable: true,
          },
        )

        // Set up a test redirect_uri in the current URL
        Object.defineProperty(
          window,
          'location',
          {
            value: {
              href: 'http://localhost?redirect_uri=http://example.com',
              origin: 'http://localhost',
              searchParams: new URLSearchParams({ redirect_uri: 'http://example.com' }),
            },
            writable: true,
          },
        )

        act(() => {
          result.current.handleSubmitError(messageConfig.RequestError.WrongAuthCode)
        })

        // Get the URL object from the mockPushState call
        const urlArg = mockPushState.mock.calls[0][2]
        expect(urlArg).toBeInstanceOf(URL)

        // Verify the URL properties
        expect(urlArg.origin).toBe('http://localhost')
        expect(urlArg.pathname).toBe(routeConfig.IdentityRoute.AuthCodeExpiredView)
        expect(urlArg.searchParams.get('locale')).toBe('en')
        expect(urlArg.searchParams.get('redirect_uri')).toBe('http://example.com')

        // Verify view switch
        expect(onSwitchView).toHaveBeenCalledWith(View.AuthCodeExpired)

        // Restore window.history
        Object.defineProperty(
          window,
          'history',
          {
            value: originalHistory,
            writable: true,
          },
        )
      },
    )

    test(
      'handles WrongAuthCode error when no redirect_uri is present',
      () => {
        const { result } = renderHook(() =>
          useSubmitError({
            onSwitchView,
            locale,
          }))

        // Mock URL and history
        const mockPushState = vi.fn()
        const originalHistory = window.history
        Object.defineProperty(
          window,
          'history',
          {
            value: { pushState: mockPushState },
            writable: true,
          },
        )

        // Set up URL without redirect_uri
        Object.defineProperty(
          window,
          'location',
          {
            value: {
              href: 'http://localhost',
              origin: 'http://localhost',
              searchParams: new URLSearchParams(),
            },
            writable: true,
          },
        )

        act(() => {
          result.current.handleSubmitError(messageConfig.RequestError.WrongAuthCode)
        })

        // Get the URL object from the mockPushState call
        const urlArg = mockPushState.mock.calls[0][2]
        expect(urlArg).toBeInstanceOf(URL)

        // Verify the URL properties
        expect(urlArg.origin).toBe('http://localhost')
        expect(urlArg.pathname).toBe(routeConfig.IdentityRoute.AuthCodeExpiredView)
        expect(urlArg.searchParams.get('locale')).toBe('en')
        // Verify redirect_uri is empty string when not present
        expect(urlArg.searchParams.get('redirect_uri')).toBe('')

        // Verify view switch
        expect(onSwitchView).toHaveBeenCalledWith(View.AuthCodeExpired)

        // Restore window.history
        Object.defineProperty(
          window,
          'history',
          {
            value: originalHistory,
            writable: true,
          },
        )
      },
    )

    test(
      'sets default error message for unknown errors',
      () => {
        const { result } = renderHook(() =>
          useSubmitError({
            onSwitchView, locale,
          }))

        act(() => {
          result.current.handleSubmitError('unknown error')
        })

        expect(result.current.submitError).toBe(requestError.authFailed.en)
      },
    )

    test(
      'handles duplicate attribute value error with correct parsing',
      () => {
        const { result } = renderHook(() =>
          useSubmitError({
            onSwitchView, locale,
          }))

        act(() => {
          result.current.handleSubmitError('Duplicate value "EMP001" for attribute "employee_id"')
        })

        expect(result.current.submitError).toBe('Duplicate value "EMP001" for attribute "employee_id".')
      },
    )

    test(
      'handles duplicate attribute value error with different values',
      () => {
        const { result } = renderHook(() =>
          useSubmitError({
            onSwitchView, locale,
          }))

        act(() => {
          result.current.handleSubmitError('Duplicate value "user@example.com" for attribute "email"')
        })

        expect(result.current.submitError).toBe('Duplicate value "user@example.com" for attribute "email".')
      },
    )

    test(
      'handles malformed duplicate attribute error without proper format',
      () => {
        const { result } = renderHook(() =>
          useSubmitError({
            onSwitchView, locale,
          }))

        act(() => {
          result.current.handleSubmitError('Duplicate value without proper format')
        })

        // Should return the raw error string when parsing fails
        expect(result.current.submitError).toBe('Duplicate value without proper format')
      },
    )

    test(
      'handles validation failed error',
      () => {
        const { result } = renderHook(() =>
          useSubmitError({
            onSwitchView, locale,
          }))

        act(() => {
          result.current.handleSubmitError('Value for attribute "employee_id" does not match the validation rule')
        })

        expect(result.current.submitError).toBe('Value for attribute "employee_id" does not match the validation rule.')
      },
    )

    test(
      'handles validation failed error with french locale',
      () => {
        const { result } = renderHook(() =>
          useSubmitError({
            onSwitchView, locale: 'fr',
          }))

        act(() => {
          result.current.handleSubmitError('Value for attribute "employee_id" does not match the validation rule')
        })

        expect(result.current.submitError).toBe('La valeur pour l\'attribut "employee_id" ne correspond pas à la règle de validation.')
      },
    )
  },
)
