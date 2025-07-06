import {
  describe, expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import { View } from './useCurrentView'
import useRecoveryCodeForm from 'pages/hooks/useRecoveryCodeForm'
import { routeConfig } from 'configs'
import * as requestModule from 'pages/tools/request'
import * as formModule from 'pages/tools/form'
import { validateError } from 'pages/tools/locale'
import { oauthDto } from 'dtos'

// Mock hooks from hono/jsx
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
  }),
)

// Mock the request module functions to avoid navigation issues
vi.mock(
  'pages/tools/request',
  () => ({
    parseResponse: vi.fn((response) => response.json()),
    parseAuthorizeBaseValues: vi.fn((
      params, locale,
    ) => ({
      clientId: params.clientId,
      redirectUri: params.redirectUri,
      locale,
    })),
    handleAuthorizeStep: vi.fn(),
  }),
)

// Mock the form validation module
vi.mock(
  'pages/tools/form',
  () => ({
    validate: vi.fn(() => ({})),
    emailField: vi.fn(() => ({ required: vi.fn(() => ({ email: 'Email is required' })) })),
  }),
)

// Mock yup validation
vi.mock(
  'yup',
  () => ({
    object: vi.fn(() => ({ validate: vi.fn() })),
    string: vi.fn(() => ({ required: vi.fn(() => ({ recoveryCode: 'Recovery code is required' })) })),
  }),
)

describe(
  'useRecoveryCodeForm',
  () => {
    const mockParams = {
      clientId: 'test-client-id',
      redirectUri: 'http://localhost:3000/callback',
    } as any

    test(
      'returns initial state with empty values and no errors',
      () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useRecoveryCodeForm({
            locale: 'en',
            params: mockParams,
            onSubmitError,
            onSwitchView,
          }))

        expect(result.current.values).toEqual({
          email: '',
          recoveryCode: '',
        })
        // Since touched flags are false, errors should be undefined
        expect(result.current.errors).toEqual({
          email: undefined,
          recoveryCode: undefined,
        })
        expect(result.current.isSubmitting).toBe(false)
        expect(typeof result.current.handleChange).toBe('function')
        expect(typeof result.current.handleSubmit).toBe('function')
      },
    )

    test(
      'handleChange updates email and resets onSubmitError',
      () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useRecoveryCodeForm({
            locale: 'en',
            params: mockParams,
            onSubmitError,
            onSwitchView,
          }))

        act(() => {
          result.current.handleChange(
            'email',
            'test@example.com',
          )
        })

        expect(onSubmitError).toHaveBeenCalledWith(null)
        expect(result.current.values.email).toBe('test@example.com')
        expect(result.current.values.recoveryCode).toBe('')
      },
    )

    test(
      'handleChange updates recoveryCode and resets onSubmitError',
      () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useRecoveryCodeForm({
            locale: 'en',
            params: mockParams,
            onSubmitError,
            onSwitchView,
          }))

        act(() => {
          result.current.handleChange(
            'recoveryCode',
            '123456',
          )
        })

        expect(onSubmitError).toHaveBeenCalledWith(null)
        expect(result.current.values.recoveryCode).toBe('123456')
        expect(result.current.values.email).toBe('')
      },
    )

    test(
      'handleSubmit blocks submission when validation errors exist',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        // Mock validation to return errors
        const validateSpy = vi.mocked(formModule.validate)
        validateSpy.mockReturnValue({
          email: validateError.fieldIsRequired.en,
          recoveryCode: validateError.fieldIsRequired.en,
        })

        const { result } = renderHook(() =>
          useRecoveryCodeForm({
            locale: 'en',
            params: mockParams,
            onSubmitError,
            onSwitchView,
          }))

        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        )

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

        await act(async () => {
          result.current.handleSubmit(fakeEvent)
          await Promise.resolve()
        })

        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        // No fetch call should occur because validation failed
        expect(fetchSpy).not.toHaveBeenCalled()
        // With touched set to true, errors should be visible
        expect(result.current.errors.email).toBe(validateError.fieldIsRequired.en)
        expect(result.current.errors.recoveryCode).toBe(validateError.fieldIsRequired.en)
        expect(result.current.isSubmitting).toBe(false)

        fetchSpy.mockRestore()
      },
    )

    test(
      'handleSubmit submits successfully and calls handleAuthorizeStep',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        // Mock validation to return no errors
        const validateSpy = vi.mocked(formModule.validate)
        validateSpy.mockReturnValue({})

        const { result } = renderHook(() =>
          useRecoveryCodeForm({
            locale: 'en',
            params: mockParams,
            onSubmitError,
            onSwitchView,
          }))

        // Set valid values
        act(() => {
          result.current.handleChange(
            'email',
            'test@example.com',
          )
          result.current.handleChange(
            'recoveryCode',
            '123456',
          )
        })

        const fakeResponseData = { status: 'success' }
        const fakeResponse = {
          ok: true,
          json: async () => fakeResponseData,
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResponse as Response)

        // Mock parseResponse to return the response data
        const parseResponseSpy = vi.mocked(requestModule.parseResponse)
        parseResponseSpy.mockResolvedValue(fakeResponseData)

        // Mock handleAuthorizeStep
        const handleAuthorizeSpy = vi.mocked(requestModule.handleAuthorizeStep)
        handleAuthorizeSpy.mockImplementation((
          response,
          locale,
          onSwitchViewFn,
        ) => {
          onSwitchViewFn(View.Consent)
        })

        // Mock parseAuthorizeBaseValues
        const parseAuthorizeBaseValuesSpy = vi.mocked(requestModule.parseAuthorizeBaseValues)
        parseAuthorizeBaseValuesSpy.mockReturnValue({
          clientId: 'test-client-id',
          redirectUri: 'http://localhost:3000/callback',
          locale: 'en',
          responseType: 'code',
          state: 'test-state',
          policy: oauthDto.Policy.SignInOrSignUp,
          codeChallenge: 'test-code-challenge',
          codeChallengeMethod: 'test-code-challenge-method',
          org: 'test-org',
          scope: 'test-scope',
        })

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

        await act(async () => {
          result.current.handleSubmit(fakeEvent)
          await Promise.resolve()
        })

        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        expect(fetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.AuthorizeRecoveryCode,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: expect.any(String),
          },
        )

        // Verify request body contains the correct data
        const fetchCall = fetchSpy.mock.calls[0]
        const requestBody = JSON.parse((fetchCall[1] as RequestInit).body as string)
        expect(requestBody).toEqual({
          email: 'test@example.com',
          recoveryCode: '123456',
          clientId: 'test-client-id',
          redirectUri: 'http://localhost:3000/callback',
          locale: 'en',
          policy: oauthDto.Policy.SignInOrSignUp,
          scope: 'test-scope',
          org: 'test-org',
          responseType: 'code',
          state: 'test-state',
          codeChallenge: 'test-code-challenge',
          codeChallengeMethod: 'test-code-challenge-method',
        })

        // Verify parseResponse was called
        expect(parseResponseSpy).toHaveBeenCalledWith(fakeResponse)

        // Verify handleAuthorizeStep was called
        expect(handleAuthorizeSpy).toHaveBeenCalledWith(
          fakeResponseData,
          'en',
          onSwitchView,
        )

        // Verify onSwitchView was called
        expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

        // Verify isSubmitting was reset
        expect(result.current.isSubmitting).toBe(false)

        fetchSpy.mockRestore()
      },
    )

    test(
      'handleSubmit calls onSubmitError when fetch fails',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        // Mock validation to return no errors
        const validateSpy = vi.mocked(formModule.validate)
        validateSpy.mockReturnValue({})

        const { result } = renderHook(() =>
          useRecoveryCodeForm({
            locale: 'en',
            params: mockParams,
            onSubmitError,
            onSwitchView,
          }))

        // Set valid values
        act(() => {
          result.current.handleChange(
            'email',
            'test@example.com',
          )
          result.current.handleChange(
            'recoveryCode',
            '123456',
          )
        })

        const fetchError = new Error('Network error')
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(fetchError)

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

        await act(async () => {
          result.current.handleSubmit(fakeEvent)
          await Promise.resolve()
        })

        expect(fakeEvent.preventDefault).toHaveBeenCalled()
        expect(onSubmitError).toHaveBeenCalledWith(fetchError)
        expect(result.current.isSubmitting).toBe(false)

        fetchSpy.mockRestore()
      },
    )

    test(
      'manages isSubmitting state correctly during submission',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        // Mock validation to return no errors
        const validateSpy = vi.mocked(formModule.validate)
        validateSpy.mockReturnValue({})

        const { result } = renderHook(() =>
          useRecoveryCodeForm({
            locale: 'en',
            params: mockParams,
            onSubmitError,
            onSwitchView,
          }))

        // Set valid values
        act(() => {
          result.current.handleChange(
            'email',
            'test@example.com',
          )
          result.current.handleChange(
            'recoveryCode',
            '123456',
          )
        })

        // Mock a slow fetch to test isSubmitting state
        let resolvePromise: (value: any) => void
        const fetchPromise = new Promise((resolve) => {
          resolvePromise = resolve
        })
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockReturnValue(fetchPromise as any)

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

        // Start submission
        act(() => {
          result.current.handleSubmit(fakeEvent)
        })

        // Should be submitting
        expect(result.current.isSubmitting).toBe(true)

        // Resolve the fetch promise
        await act(async () => {
          resolvePromise({
            ok: true,
            json: async () => ({}),
          })
          await Promise.resolve()
        })

        // Should no longer be submitting
        expect(result.current.isSubmitting).toBe(false)

        fetchSpy.mockRestore()
      },
    )

    test(
      'shows validation errors only when fields are touched',
      () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        // Mock validation to return errors
        const validateSpy = vi.mocked(formModule.validate)
        validateSpy.mockReturnValue({
          email: 'Email is invalid',
          recoveryCode: 'Recovery code is required',
        })

        const { result } = renderHook(() =>
          useRecoveryCodeForm({
            locale: 'en',
            params: mockParams,
            onSubmitError,
            onSwitchView,
          }))

        // Initially, no errors should be shown (not touched)
        expect(result.current.errors.email).toBeUndefined()
        expect(result.current.errors.recoveryCode).toBeUndefined()

        // After handleSubmit, errors should be shown (touched)
        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
        act(() => {
          result.current.handleSubmit(fakeEvent)
        })

        expect(result.current.errors.email).toBe('Email is invalid')
        expect(result.current.errors.recoveryCode).toBe('Recovery code is required')
      },
    )
  },
)
