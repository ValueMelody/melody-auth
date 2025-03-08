import {
  expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import { InitialProps } from './useInitialProps'
import { View } from './useCurrentView'
import useSignUpForm from 'pages/hooks/useSignUpForm'
import {
  localeConfig, routeConfig,
} from 'configs'
import * as requestModule from 'pages/tools/request'
import { AuthorizeParams } from 'pages/tools/param'

// Mock hooks from hono/jsx.
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
  }),
) // used for handleAuthorizeStep

// Dummy parameters to pass to the hook.
const dummyInitialProps = {
  namesIsRequired: true,
  enableNames: true,
} as InitialProps
const dummyParams = {} as AuthorizeParams // dummy value for params

test(
  'returns initial state correctly',
  () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()

    const { result } = renderHook(() =>
      useSignUpForm({
        locale: 'en',
        initialProps: dummyInitialProps,
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      }))

    expect(result.current.values).toEqual({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    })

    // Since no fields have been touched, errors should be undefined.
    expect(result.current.errors).toEqual({
      email: undefined,
      password: undefined,
      confirmPassword: undefined,
      firstName: undefined,
      lastName: undefined,
    })
  },
)

test(
  'handleChange updates fields and resets onSubmitError',
  () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useSignUpForm({
        locale: 'en',
        initialProps: dummyInitialProps,
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      }))

    act(() => {
      result.current.handleChange(
        'email',
        'test@example.com',
      )
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
      result.current.handleChange(
        'firstName',
        'John',
      )
      result.current.handleChange(
        'lastName',
        'Doe',
      )
    })

    // onSubmitError is called with null after each change.
    expect(onSubmitError).toHaveBeenCalledTimes(5)
    expect(onSubmitError).toHaveBeenLastCalledWith(null)
    expect(result.current.values).toEqual({
      email: 'test@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      firstName: 'John',
      lastName: 'Doe',
    })
  },
)

test(
  'handleSubmit blocks submission when validation errors exist',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    )

    // For this test, leave the required names empty by not calling handleChange for them.
    // Provide valid email, password, and confirmPassword.
    const { result } = renderHook(() =>
      useSignUpForm({
        locale: 'en',
        initialProps: dummyInitialProps,
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      }))

    act(() => {
      result.current.handleChange(
        'email',
        'test@example.com',
      )
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
    // Leaving firstName and lastName as empty strings (triggering validation errors)
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
    // Check that errors for firstName and lastName are set as expected.
    expect(result.current.errors.firstName).toEqual(localeConfig.validateError.firstNameIsEmpty.en)
    expect(result.current.errors.lastName).toEqual(localeConfig.validateError.lastNameIsEmpty.en)

    fetchSpy.mockRestore()
  },
)

test(
  'handleSubmit submits form successfully when valid input is provided',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()

    // Spy on handleAuthorizeStep to simulate a successful flow.
    const handleAuthorizeSpy = vi.spyOn(
      requestModule,
      'handleAuthorizeStep',
    ).mockImplementation((
      response, locale, onSwitchView,
    ) => {
      onSwitchView(View.Consent)
    })
    const fakeResponse = {
      ok: true, json: async () => ({ status: 'ok' }),
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    const { result } = renderHook(() =>
      useSignUpForm({
        locale: 'en',
        initialProps: dummyInitialProps,
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      }))

    // Provide valid input for all fields.
    act(() => {
      result.current.handleChange(
        'email',
        'test@example.com',
      )
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
      result.current.handleChange(
        'firstName',
        'John',
      )
      result.current.handleChange(
        'lastName',
        'Doe',
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    // Check that fetch was called with the expected endpoint and options.
    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.AuthorizeAccount,
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        // Verify that the request body contains the valid fields.
        body: expect.stringContaining('"email":"test@example.com"'),
      }),
    )
    expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

    fetchSpy.mockRestore()
    handleAuthorizeSpy.mockRestore()
  },
)

test(
  'handleSubmit calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fakeError = new Error('Network error')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(fakeError)

    const { result } = renderHook(() =>
      useSignUpForm({
        locale: 'en',
        initialProps: dummyInitialProps,
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      }))

    // Provide valid inputs for all fields.
    act(() => {
      result.current.handleChange(
        'email',
        'test@example.com',
      )
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
      result.current.handleChange(
        'firstName',
        'John',
      )
      result.current.handleChange(
        'lastName',
        'Doe',
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    expect(onSubmitError).toHaveBeenCalledWith(fakeError)

    fetchSpy.mockRestore()
  },
)
