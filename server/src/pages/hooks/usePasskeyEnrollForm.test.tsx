import {
  describe, expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

// Import the hook and external dependencies.
import { View } from './useCurrentView'
import usePasskeyEnrollForm from 'pages/hooks/usePasskeyEnrollForm'
import { routeConfig } from 'configs'
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

// Mock getFollowUpParams to return test parameters needed for the query string.
vi.mock(
  'pages/tools/param',
  () => ({
    getFollowUpParams: vi.fn(() => ({
      code: 'test-code',
      org: 'test-org',
    })),
  }),
)

// Mock the enroll function from pages/tools/passkey.
vi.mock(
  'pages/tools/passkey',
  () => ({ enroll: vi.fn() }),
)

describe(
  'usePasskeyEnrollForm',
  () => {
    const locale = 'en'

    test(
      'initial state returns null enrollOptions and rememberSkip false',
      () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          usePasskeyEnrollForm({
            locale, onSubmitError, onSwitchView,
          }))

        expect(result.current.enrollOptions).toBeNull()
        expect(result.current.rememberSkip).toBe(false)
      },
    )

    test(
      'handleRememberSkip updates rememberSkip state',
      () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          usePasskeyEnrollForm({
            locale, onSubmitError, onSwitchView,
          }))

        act(() => {
          result.current.handleRememberSkip(true)
        })
        expect(result.current.rememberSkip).toBe(true)
      },
    )

    test(
      'getEnrollOptions updates enrollOptions on successful fetch',
      async () => {
        const fakeEnrollOptions = { option: 'optionValue' }
        const fakeGetEnrollResponse = {
          ok: true,
          json: async () => ({ enrollOptions: fakeEnrollOptions }),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeGetEnrollResponse as unknown as Response)

        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          usePasskeyEnrollForm({
            locale, onSubmitError, onSwitchView,
          }))

        await act(async () => {
          await result.current.getEnrollOptions()
          // wait for promise chain to resolve
          await Promise.resolve()
        })

        // Verify the fetch was called with the expected URL and options.
        expect(fetchSpy).toHaveBeenCalledWith(
          `${routeConfig.IdentityRoute.ProcessPasskeyEnroll}?code=test-code&locale=${locale}&org=test-org`,
          {
            method: 'GET', headers: { 'Content-Type': 'application/json' },
          },
        )
        expect(result.current.enrollOptions).toEqual(fakeEnrollOptions)
        fetchSpy.mockRestore()
      },
    )

    test(
      'getEnrollOptions calls onSubmitError on fetch failure',
      async () => {
        const error = new Error('Fetch failed')
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(error)

        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          usePasskeyEnrollForm({
            locale, onSubmitError, onSwitchView,
          }))

        await act(async () => {
          await result.current.getEnrollOptions()
          await Promise.resolve()
        })
        expect(onSubmitError).toHaveBeenCalledWith(error)
        fetchSpy.mockRestore()
      },
    )

    test(
      'handleEnroll does nothing if enrollOptions is null',
      async () => {
        const enrollModule = await import('pages/tools/passkey')
        const enrollMock = vi.spyOn(
          enrollModule,
          'enroll',
        )

        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          usePasskeyEnrollForm({
            locale, onSubmitError, onSwitchView,
          }))

        act(() => {
          result.current.handleEnroll()
        })
        expect(enrollMock).not.toHaveBeenCalled()
        enrollMock.mockRestore()
      },
    )

    test(
      'handleEnroll calls enroll and submitEnroll on successful enrollment',
      async () => {
        // First, set enrollOptions by calling getEnrollOptions.
        const fakeEnrollOptions = { option: 'value' }
        const fakeGetEnrollResponse = {
          ok: true,
          json: async () => ({ enrollOptions: fakeEnrollOptions }),
        }
        const fetchSpyGet = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeGetEnrollResponse as unknown as Response)

        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          usePasskeyEnrollForm({
            locale, onSubmitError, onSwitchView,
          }))

        await act(async () => {
          await result.current.getEnrollOptions()
          await Promise.resolve()
        })
        expect(result.current.enrollOptions).toEqual(fakeEnrollOptions)
        fetchSpyGet.mockRestore()

        // Now, simulate the enroll function to return an enrollment info.
        const fakeEnrollInfo = { credential: 'passkey-credential' }
        const enrollModule = await import('pages/tools/passkey')
        const enrollMock = vi.spyOn(
          enrollModule,
          'enroll',
        ).mockResolvedValue(fakeEnrollInfo as unknown as Credential)

        // Stub the POST call in submitEnroll:
        const fakeSubmitResponse = {
          ok: true,
          json: async () => ({ status: 'ok' }),
        }
        const fetchSpyPost = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeSubmitResponse as unknown as Response)

        // Spy on handleAuthorizeStep to simulate a successful authorization flow.
        const handleAuthorizeSpy = vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation((
          response, locale, onSwitchViewFn,
        ) => {
          onSwitchViewFn(View.Consent)
        })

        await act(async () => {
          await result.current.handleEnroll()
          await Promise.resolve()
        })

        // Ensure enroll was called with the previously set enrollOptions.
        expect(enrollMock).toHaveBeenCalledWith(fakeEnrollOptions)
        // Expect that fetch was called to submit enrollment information.
        expect(fetchSpyPost).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.ProcessPasskeyEnroll,
          expect.objectContaining({
            method: 'POST',
            headers: {
              Accept: 'application/json', 'Content-Type': 'application/json',
            },
            body: expect.any(String),
          }),
        )
        // Verify that onSwitchView was triggered (via handleAuthorizeStep).
        expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

        enrollMock.mockRestore()
        fetchSpyPost.mockRestore()
        handleAuthorizeSpy.mockRestore()
      },
    )

    test(
      'handleEnroll does not continue if enroll returns undefined',
      async () => {
        // Set enrollOptions.
        const fakeEnrollOptions = { option: 'value' }
        const fakeGetEnrollResponse = {
          ok: true,
          json: async () => ({ enrollOptions: fakeEnrollOptions }),
        }
        const fetchSpyGet = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeGetEnrollResponse as unknown as Response)

        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          usePasskeyEnrollForm({
            locale, onSubmitError, onSwitchView,
          }))

        await act(async () => {
          await result.current.getEnrollOptions()
          await Promise.resolve()
        })
        expect(result.current.enrollOptions).toEqual(fakeEnrollOptions)
        fetchSpyGet.mockRestore()

        const enrollModule = await import('pages/tools/passkey')
        const enrollMock = vi.spyOn(
          enrollModule,
          'enroll',
        ).mockResolvedValue(null)
        const fetchSpyPost = vi.spyOn(
          global,
          'fetch',
        )

        await act(async () => {
          await result.current.handleEnroll()
          await Promise.resolve()
        })
        expect(enrollMock).toHaveBeenCalledWith(fakeEnrollOptions)
        expect(fetchSpyPost).not.toHaveBeenCalled()

        enrollMock.mockRestore()
        fetchSpyPost.mockRestore()
      },
    )

    test(
      'handleDecline sends POST request and calls onSwitchView on success',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          usePasskeyEnrollForm({
            locale, onSubmitError, onSwitchView,
          }))

        // Update rememberSkip (to later check it appears in the request body).
        act(() => {
          result.current.handleRememberSkip(true)
        })
        expect(result.current.rememberSkip).toBe(true)

        const fakeDeclineResponse = {
          ok: true,
          json: async () => ({ status: 'declined' }),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeDeclineResponse as unknown as Response)

        const handleAuthorizeSpy = vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation((
          response, locale, onSwitchViewFn,
        ) => {
          onSwitchViewFn(View.Consent)
        })

        await act(async () => {
          await result.current.handleDecline()
          await Promise.resolve()
        })

        expect(fetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.ProcessPasskeyEnrollDecline,
          expect.objectContaining({
            method: 'POST',
            headers: {
              Accept: 'application/json', 'Content-Type': 'application/json',
            },
            body: expect.any(String),
          }),
        )
        expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

        fetchSpy.mockRestore()
        handleAuthorizeSpy.mockRestore()
      },
    )

    test(
      'handleDecline calls onSubmitError on fetch failure',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          usePasskeyEnrollForm({
            locale, onSubmitError, onSwitchView,
          }))

        const error = new Error('Decline failed')
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(error)

        await act(async () => {
          await result.current.handleDecline()
          await Promise.resolve()
        })
        expect(onSubmitError).toHaveBeenCalledWith(error)
        fetchSpy.mockRestore()
      },
    )

    test(
      'handleEnroll calls onSubmitError when submitEnroll fails',
      async () => {
        // First set enrollOptions via getEnrollOptions
        const fakeEnrollOptions = { option: 'value' }
        const fakeGetEnrollResponse = {
          ok: true,
          json: async () => ({ enrollOptions: fakeEnrollOptions }),
        }
        const fetchSpyGet = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeGetEnrollResponse as unknown as Response)

        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          usePasskeyEnrollForm({
            locale,
            onSubmitError,
            onSwitchView,
          }))

        await act(async () => {
          await result.current.getEnrollOptions()
          await Promise.resolve()
        })
        expect(result.current.enrollOptions).toEqual(fakeEnrollOptions)
        fetchSpyGet.mockRestore()

        // Mock successful enroll returning credential
        const fakeEnrollInfo = { credential: 'passkey-credential' }
        const enrollModule = await import('pages/tools/passkey')
        const enrollMock = vi.spyOn(
          enrollModule,
          'enroll',
        ).mockResolvedValue(fakeEnrollInfo as unknown as Credential)

        // Mock POST request to fail
        const error = new Error('Submit enroll failed')
        const fetchSpyPost = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(error)

        await act(async () => {
          await result.current.handleEnroll()
          await Promise.resolve()
        })

        // Verify error handling
        expect(onSubmitError).toHaveBeenCalledWith(error)
        expect(onSwitchView).not.toHaveBeenCalled()

        // Cleanup
        enrollMock.mockRestore()
        fetchSpyPost.mockRestore()
      },
    )
  },
)
