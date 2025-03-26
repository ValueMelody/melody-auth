import {
  describe, expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import { View } from './useCurrentView'
import useSignInForm from 'pages/hooks/useSignInForm'
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

// Note: For testing purposes, we pass a dummy params object.
const dummyParams = {} as any

describe(
  'useSignInForm',
  () => {
    test(
      'returns initial state with empty values and no errors',
      () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        const { result } = renderHook(() =>
          useSignInForm({
            locale: 'en',
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        expect(result.current.values).toEqual({
          email: '',
          password: '',
        })
        // Since touched flags are false, errors are not shown.
        expect(result.current.errors).toEqual({
          email: undefined,
          password: undefined,
        })
        expect(typeof result.current.handleChange).toBe('function')
        expect(typeof result.current.handleSubmit).toBe('function')
      },
    )

    test(
      'handleChange updates email and password, and resets onSubmitError',
      () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        const { result } = renderHook(() =>
          useSignInForm({
            locale: 'en',
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        act(() => {
          result.current.handleChange(
            'email',
            'test@example.com',
          )
        })
        // Verify onSubmitError is reset.
        expect(onSubmitError).toHaveBeenCalledWith(null)
        expect(result.current.values.email).toBe('test@example.com')

        act(() => {
          result.current.handleChange(
            'password',
            'ValidPassword123!',
          )
        })
        expect(onSubmitError).toHaveBeenCalledWith(null)
        expect(result.current.values.password).toBe('ValidPassword123!')
      },
    )

    test(
      'handleSubmit blocks submission when validation errors exist',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        const { result } = renderHook(() =>
          useSignInForm({
            locale: 'en',
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        // With default values (empty strings), the validation should fail.
        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        )

        await act(async () => {
          result.current.handleSubmit(fakeEvent)
          await Promise.resolve()
        })

        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        // Since there should be validation errors the fetch call should not occur.
        expect(fetchSpy).not.toHaveBeenCalled()
        // With touched set to true after submit, errors should be defined.
        expect(result.current.errors.email).not.toBeUndefined()
        expect(result.current.errors.password).not.toBeUndefined()

        fetchSpy.mockRestore()
      },
    )

    test(
      'handleSubmit submits data successfully and calls handleAuthorizeStep',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const params = { extra: 'data' } as any
        const { result } = renderHook(() =>
          useSignInForm({
            locale: 'en',
            params,
            onSubmitError,
            onSwitchView,
          }))

        // Update with valid values.
        act(() => {
          result.current.handleChange(
            'email',
            'test@example.com',
          )
          result.current.handleChange(
            'password',
            'ValidPassword123!',
          )
        })

        // Prepare a fake fetch response.
        const fakeResponse = {
          ok: true, json: async () => ({}),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResponse as Response)

        // Spy on handleAuthorizeStep to simulate a successful authorization.
        const handleAuthorizeSpy = vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation((
          response, locale, onSwitchView,
        ) => {
          onSwitchView(View.Consent)
        })

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
        await act(async () => {
          result.current.handleSubmit(fakeEvent)
          await Promise.resolve()
        })

        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        expect(fetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.AuthorizePassword,
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Accept: 'application/json',
              'Content-Type': 'application/json',
            }),
            body: expect.any(String),
          }),
        )
        // Verify that upon a successful fetch the onSwitchView ("nextView") is triggered.
        expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

        fetchSpy.mockRestore()
        handleAuthorizeSpy.mockRestore()
      },
    )

    test(
      'handleSubmit calls onSubmitError when fetch fails',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useSignInForm({
            locale: 'en',
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        // Provide valid form values.
        act(() => {
          result.current.handleChange(
            'email',
            'test@example.com',
          )
          result.current.handleChange(
            'password',
            'ValidPassword123!',
          )
        })

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
        const fetchError = new Error('Network error')
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(fetchError)

        await act(async () => {
          result.current.handleSubmit(fakeEvent)
          await Promise.resolve()
        })

        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        expect(onSubmitError).toHaveBeenCalledWith(fetchError)

        fetchSpy.mockRestore()
      },
    )

    test(
      'handlePasswordlessSignIn submits email successfully and calls handleAuthorizeStep',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const params = { extra: 'data' } as any
        const { result } = renderHook(() =>
          useSignInForm({
            locale: 'en',
            params,
            onSubmitError,
            onSwitchView,
          }))

        // Set valid email
        act(() => {
          result.current.handleChange(
            'email',
            'test@example.com',
          )
        })

        // Mock successful response
        const fakeResponse = {
          ok: true,
          json: async () => ({ status: 'success' }),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResponse as Response)

        // Spy on handleAuthorizeStep
        const handleAuthorizeSpy = vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation((
          response,
          locale,
          onSwitchViewFn,
        ) => {
          onSwitchViewFn(View.Consent)
        })

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
        await act(async () => {
          result.current.handlePasswordlessSignIn(fakeEvent)
          await Promise.resolve()
        })

        // Verify the request
        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        expect(fetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.AuthorizePasswordless,
          expect.objectContaining({
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: expect.stringContaining('"email":"test@example.com"'),
          }),
        )
        expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

        fetchSpy.mockRestore()
        handleAuthorizeSpy.mockRestore()
      },
    )

    test(
      'handlePasswordlessSignIn calls onSubmitError when fetch fails',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useSignInForm({
            locale: 'en',
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        // Set valid email
        act(() => {
          result.current.handleChange(
            'email',
            'test@example.com',
          )
        })

        // Clear onSubmitError calls from handleChange
        onSubmitError.mockClear()

        // Mock fetch failure
        const error = new Error('Network error')
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(error)

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
        await act(async () => {
          result.current.handlePasswordlessSignIn(fakeEvent)
          await Promise.resolve()
        })

        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        expect(onSubmitError).toHaveBeenCalledWith(error)

        fetchSpy.mockRestore()
      },
    )

    test(
      'handlePasswordlessSignIn stops execution when email validation error exists',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useSignInForm({
            locale: 'en',
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        // Set invalid email
        act(() => {
          result.current.handleChange(
            'email',
            'invalid-email',
          )
        })

        // Clear onSubmitError calls from handleChange
        onSubmitError.mockClear()

        // Spy on fetch to ensure it's not called
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        )

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
        await act(async () => {
          result.current.handlePasswordlessSignIn(fakeEvent)
          await Promise.resolve()
        })

        // Verify that:
        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        // Email error should be visible (touched)
        expect(result.current.errors.email).toBeDefined()
        // Password should remain untouched
        expect(result.current.errors.password).toBeUndefined()
        // Fetch should not be called due to validation error
        expect(fetchSpy).not.toHaveBeenCalled()
        // onSubmitError should not be called
        expect(onSubmitError).not.toHaveBeenCalled()

        fetchSpy.mockRestore()
      },
    )
  },
)
