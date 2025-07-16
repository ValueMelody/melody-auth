import {
  describe, expect, test, vi, beforeEach,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import { View } from './useCurrentView'
import useSmsMfaForm from 'pages/hooks/useSmsMfaForm'
import {
  routeConfig, typeConfig,
} from 'configs'
import * as requestModule from 'pages/tools/request'

// Mock hooks from hono/jsx.
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
  }),
)

// Mock getFollowUpParams to return dummy values.
vi.mock(
  'pages/tools/param',
  () => ({
    getFollowUpParams: vi.fn(() => ({
      code: 'test-code',
      org: 'test-org',
    })),
  }),
)

describe(
  'useSmsMfaForm hook',
  () => {
    const dummyLocale: typeConfig.Locale = 'en'
    let onSubmitError: ReturnType<typeof vi.fn>
    let onSwitchView: ReturnType<typeof vi.fn>

    beforeEach(() => {
      onSubmitError = vi.fn()
      onSwitchView = vi.fn()
    })

    test(
      'should initialize with correct default state',
      () => {
        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))
        expect(result.current.currentNumber).toBeNull()
        expect(result.current.allowFallbackToEmailMfa).toBe(false)
        expect(result.current.countryCode).toBe('')
        expect(result.current.values).toEqual({
          phoneNumber: '', mfaCode: null, rememberDevice: false,
        })
        // Errors are not shown initially since the touched flags are false.
        expect(result.current.errors).toEqual({
          phoneNumber: undefined, mfaCode: undefined,
        })
        expect(result.current.resent).toBe(false)
        expect(typeof result.current.handleChange).toBe('function')
        expect(typeof result.current.getSmsMfaInfo).toBe('function')
        expect(typeof result.current.handleResend).toBe('function')
        expect(typeof result.current.handleSubmit).toBe('function')
      },
    )

    test(
      'handleChange updates phoneNumber and mfaCode and resets error',
      () => {
        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))

        act(() => {
          result.current.handleChange(
            'phoneNumber',
            '+11234567890',
          )
        })
        expect(onSubmitError).toHaveBeenCalledWith(null)
        expect(result.current.values.phoneNumber).toBe('+11234567890')

        act(() => {
          result.current.handleChange(
            'mfaCode',
            ['1', '2', '3', '4', '5', '6'],
          )
        })
        expect(onSubmitError).toHaveBeenCalledWith(null)
        expect(result.current.values.mfaCode).toEqual(['1', '2', '3', '4', '5', '6'])
      },
    )

    test(
      'getSmsMfaInfo updates state on successful fetch',
      async () => {
        const fakeResponseData = {
          phoneNumber: '+19876543210',
          allowFallbackToEmailMfa: true,
          countryCode: '+1',
        }
        const fakeResponse = {
          ok: true,
          json: async () => fakeResponseData,
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResponse as Response)

        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))

        await act(async () => {
          result.current.getSmsMfaInfo()
          await Promise.resolve()
        })
        expect(fetchSpy).toHaveBeenCalledWith(
          `${routeConfig.IdentityRoute.ProcessSmsMfa}?code=test-code&locale=${dummyLocale}&org=test-org`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          },
        )
        expect(result.current.currentNumber).toBe('+19876543210')
        // Since a phone number is returned, mfaCode is initialized as an array of 6 empty strings.
        expect(result.current.values.mfaCode).toEqual(new Array(6).fill(''))
        expect(result.current.allowFallbackToEmailMfa).toBe(true)
        expect(result.current.countryCode).toBe('+1')
        fetchSpy.mockRestore()
      },
    )

    test(
      'getSmsMfaInfo calls onSubmitError on fetch failure',
      async () => {
        const error = new Error('Fetch error')
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(error)

        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))

        await act(async () => {
          result.current.getSmsMfaInfo()
          await Promise.resolve()
        })
        expect(onSubmitError).toHaveBeenCalledWith(error)
        fetchSpy.mockRestore()
      },
    )

    test(
      'handleResend calls ResendSmsMfa when currentNumber exists',
      async () => {
        // First, simulate getSmsMfaInfo to set currentNumber.
        const fakeResponseData = {
          phoneNumber: '+19876543210',
          allowFallbackToEmailMfa: false,
          countryCode: '+1',
        }
        const fakeGetResponse = {
          ok: true,
          json: async () => fakeResponseData,
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValueOnce(fakeGetResponse as Response)
        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))
        // Call getSmsMfaInfo to set the current number.
        await act(async () => {
          result.current.getSmsMfaInfo()
          await Promise.resolve()
        })
        fetchSpy.mockRestore()

        // Now test handleResend in the branch where currentNumber exists.
        const fakeResendResponse = {
          ok: true, json: async () => ({}),
        }
        const resendFetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResendResponse as Response)

        await act(async () => {
          result.current.handleResend()
          await Promise.resolve()
        })
        expect(resendFetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.ResendSmsMfa,
          expect.objectContaining({
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: expect.any(String),
          }),
        )
        expect(result.current.resent).toBe(true)
        // After resending, mfaCode is reset.
        expect(result.current.values.mfaCode).toEqual(new Array(6).fill(''))
        resendFetchSpy.mockRestore()
      },
    )

    test(
      'handleResend calls requestSetupMfa when currentNumber is not set',
      async () => {
        // In this branch, currentNumber remains null.
        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))
        // Set a valid phoneNumber to pass validation.
        act(() => {
          result.current.handleChange(
            'phoneNumber',
            '+11234567890',
          )
        })
        expect(result.current.currentNumber).toBeNull()

        // Spy on fetch for the SetupSmsMfa call.
        const fakeSetupResponse = {
          ok: true, json: async () => ({}),
        }
        const setupFetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeSetupResponse as Response)

        await act(async () => {
          result.current.handleResend()
          await Promise.resolve()
        })
        expect(setupFetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.SetupSmsMfa,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: 'test-code',
              locale: 'en',
              org: 'test-org',
              phoneNumber: '+11234567890',
            }),
          },
        )
        setupFetchSpy.mockRestore()
      },
    )

    test(
      'handleSubmit calls requestSetupMfa when mfaCode is null and no validation errors',
      async () => {
        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))
        // Set a valid phoneNumber so that phone number validation passes.
        act(() => {
          result.current.handleChange(
            'phoneNumber',
            '+11234567890',
          )
        })
        expect(result.current.values.mfaCode).toBeNull()

        const fakeSetupResponse = {
          ok: true, json: async () => ({}),
        }
        const setupFetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeSetupResponse as Response)

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
        await act(async () => {
          result.current.handleSubmit(fakeEvent)
          await Promise.resolve()
        })
        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        // Since mfaCode is null, the requestSetupMfa branch is executed.
        expect(setupFetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.SetupSmsMfa,
          expect.objectContaining({ method: 'POST' }),
        )
        // After successful requestSetupMfa, mfaCode is set.
        expect(result.current.values.mfaCode).toEqual(new Array(6).fill(''))
        setupFetchSpy.mockRestore()
      },
    )

    test(
      'handleSubmit processes mfaCode when provided',
      async () => {
        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))
        // Set a valid phoneNumber and a valid mfaCode.
        act(() => {
          result.current.handleChange(
            'phoneNumber',
            '+11234567890',
          )
          result.current.handleChange(
            'mfaCode',
            ['1', '2', '3', '4', '5', '6'],
          )
        })

        // Spy on fetch for processing the SMS MFA.
        const fakeProcessResponse = {
          ok: true, json: async () => ({ status: 'ok' }),
        }
        const processFetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeProcessResponse as Response)
        // Spy on handleAuthorizeStep to simulate a successful authorization.
        const handleAuthorizeSpy = vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation((
          response, locale, onSwitch,
        ) => {
          onSwitch(View.Consent)
        })

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
        await act(async () => {
          result.current.handleSubmit(fakeEvent)
          await Promise.resolve()
        })
        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        expect(processFetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.ProcessSmsMfa,
          expect.objectContaining({
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: expect.any(String),
          }),
        )
        expect(handleAuthorizeSpy).toHaveBeenCalledWith(
          { status: 'ok' },
          dummyLocale,
          onSwitchView,
        )
        processFetchSpy.mockRestore()
        handleAuthorizeSpy.mockRestore()
      },
    )

    test(
      'handleSubmit calls onSubmitError on fetch failure when mfaCode is provided',
      async () => {
        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))
        act(() => {
          result.current.handleChange(
            'phoneNumber',
            '+11234567890',
          )
          result.current.handleChange(
            'mfaCode',
            ['1', '2', '3', '4', '5', '6'],
          )
        })
        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
        const fetchError = new Error('Process error')
        const processFetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(fetchError)

        await act(async () => {
          result.current.handleSubmit(fakeEvent)
          await Promise.resolve()
        })
        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        expect(onSubmitError).toHaveBeenCalledWith(fetchError)
        processFetchSpy.mockRestore()
      },
    )

    test(
      'requestSetupMfa calls onSubmitError on fetch failure',
      async () => {
        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))
        // Set a valid phoneNumber to pass validation.
        act(() => {
          result.current.handleChange(
            'phoneNumber',
            '+11234567890',
          )
        })
        expect(result.current.currentNumber).toBeNull()

        const error = new Error('Setup MFA failed')
        const setupFetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(error)

        await act(async () => {
          result.current.handleResend()
          await Promise.resolve()
        })

        // Test through handleResend path
        await act(async () => {
          result.current.handleResend()
          await Promise.resolve()
        })

        expect(setupFetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.SetupSmsMfa,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: 'test-code',
              locale: 'en',
              org: 'test-org',
              phoneNumber: '+11234567890',
            }),
          },
        )
        setupFetchSpy.mockRestore()

        // Verify error handling for handleResend path
        expect(onSubmitError).toHaveBeenCalledWith(error)
        expect(result.current.values.mfaCode).toBeNull()
      },
    )

    test(
      'handleResend calls onSubmitError when ResendSmsMfa fails',
      async () => {
        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))

        // First, set up currentNumber via getSmsMfaInfo
        const fakeGetResponse = {
          ok: true,
          json: async () => ({
            phoneNumber: '+19876543210',
            allowFallbackToEmailMfa: false,
            countryCode: '+1',
          }),
        }
        const getInfoFetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValueOnce(fakeGetResponse as Response)

        await act(async () => {
          result.current.getSmsMfaInfo()
          await Promise.resolve()
        })
        expect(result.current.currentNumber).toBe('+19876543210')
        getInfoFetchSpy.mockRestore()

        // Mock ResendSmsMfa to fail
        const error = new Error('Resend SMS failed')
        const resendFetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(error)

        await act(async () => {
          result.current.handleResend()
          await Promise.resolve()
        })

        // Verify error handling
        expect(onSubmitError).toHaveBeenCalledWith(error)
        expect(result.current.resent).toBe(false)

        resendFetchSpy.mockRestore()
      },
    )

    test(
      'handleSubmit stops execution when there are validation errors',
      async () => {
        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))

        // Set an invalid phone number (empty)
        act(() => {
          result.current.handleChange(
            'phoneNumber',
            '',
          )
        })

        // Clear the onSubmitError mock AFTER handleChange
        onSubmitError.mockClear()

        // Spy on fetch to ensure it's not called
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        )

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
        await act(async () => {
          result.current.handleSubmit(fakeEvent)
          await Promise.resolve()
        })

        // Verify that:
        // 1. preventDefault was called
        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        // 2. The touched state was updated (errors should now be visible)
        expect(result.current.errors.phoneNumber).toBeDefined()
        // 3. fetch was not called (execution stopped due to validation error)
        expect(fetchSpy).not.toHaveBeenCalled()
        // 4. onSubmitError was not called after handleSubmit
        expect(onSubmitError).not.toHaveBeenCalled()

        fetchSpy.mockRestore()
      },
    )

    test(
      'handleResend stops execution when there is a phoneNumber validation error',
      async () => {
        const { result } = renderHook(() =>
          useSmsMfaForm({
            locale: dummyLocale,
            onSubmitError,
            onSwitchView,
          }))

        // Set an invalid phone number
        act(() => {
          result.current.handleChange(
            'phoneNumber',
            '', // empty phone number will cause validation error
          )
        })

        // Clear the onSubmitError mock after handleChange
        onSubmitError.mockClear()

        // Spy on fetch to ensure it's not called
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        )

        // Set touched to true to make error visible
        act(() => {
          result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as Event)
        })

        // Verify error exists
        expect(result.current.errors.phoneNumber).toBeDefined()

        // Try to resend
        await act(async () => {
          result.current.handleResend()
          await Promise.resolve()
        })

        // Verify that:
        // 1. fetch was not called (execution stopped due to validation error)
        expect(fetchSpy).not.toHaveBeenCalled()
        // 2. onSubmitError was not called
        expect(onSubmitError).not.toHaveBeenCalled()
        // 3. resent state remains false
        expect(result.current.resent).toBe(false)

        fetchSpy.mockRestore()
      },
    )
  },
)
