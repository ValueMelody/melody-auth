import {
  expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import useChangePasswordForm from 'pages/hooks/useChangePasswordForm'
import { routeConfig } from 'configs'
import { validateError } from 'pages/tools/locale'

// Mock hooks from hono/jsx
vi.mock(
  'hono/jsx',
  () => ({
    useMemo: React.useMemo,
    useState: React.useState,
  }),
)

// Mock getFollowUpParams to return a test redirectUri.
vi.mock(
  'pages/tools/param',
  () => ({ getFollowUpParams: vi.fn(() => ({ redirectUri: 'test-redirect' })) }),
)

// Mock request helpers.
vi.mock(
  'pages/tools/request',
  () => ({
    parseAuthorizeFollowUpValues: vi.fn(() => ({ mockKey: 'mockValue' })),
    parseResponse: vi.fn((response) => response),
  }),
)

test(
  'returns initial state with empty values and no errors',
  () => {
    const onSubmitError = vi.fn()
    const { result } = renderHook(() =>
      useChangePasswordForm({
        locale: 'en',
        onSubmitError,
      }))

    // Initially, both password fields are empty, and errors are undefined because the fields haven't been touched.
    expect(result.current.values).toEqual({
      password: '',
      confirmPassword: '',
    })
    expect(result.current.errors).toEqual({
      password: undefined,
      confirmPassword: undefined,
    })
    expect(result.current.success).toBe(false)
    expect(result.current.redirectUri).toBe('test-redirect')
  },
)

test(
  'handleChange updates password and confirmPassword',
  () => {
    const onSubmitError = vi.fn()
    const { result } = renderHook(() =>
      useChangePasswordForm({
        locale: 'en',
        onSubmitError,
      }))

    act(() => {
      result.current.handleChange(
        'password',
        'mySecret',
      )
      result.current.handleChange(
        'confirmPassword',
        'mySecret',
      )
    })

    // onSubmitError should be reset to null after a change.
    expect(onSubmitError).toHaveBeenCalledWith(null)
    expect(result.current.values).toEqual({
      password: 'mySecret',
      confirmPassword: 'mySecret',
    })
  },
)

test(
  'submits form successfully when valid input is provided',
  async () => {
    const onSubmitError = vi.fn()
    const fakeResponse = {
      ok: true, json: async () => ({}),
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    const { result } = renderHook(() =>
      useChangePasswordForm({
        locale: 'en',
        onSubmitError,
      }))

    // Input valid passwords.
    act(() => {
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    // Verify that fetch was called with the ChangePassword endpoint.
    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.ChangePassword,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
        body: expect.any(String),
      }),
    )
    // On successful submission, success should be true and fields reset.
    expect(result.current.success).toBe(true)
    expect(result.current.values).toEqual({
      password: '',
      confirmPassword: '',
    })

    fetchSpy.mockRestore()
  },
)

test(
  'blocks submission when validation errors exist',
  async () => {
    const onSubmitError = vi.fn()
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    )

    const { result } = renderHook(() =>
      useChangePasswordForm({
        locale: 'en',
        onSubmitError,
      }))

    // Do not update any field, so validation errors (such as empty password) should exist.
    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    // Expect that no fetch call is made when validation fails.
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result.current.success).toBe(false)

    fetchSpy.mockRestore()
  },
)

test(
  'calls onSubmitError when submission fails',
  async () => {
    const onSubmitError = vi.fn()
    const errorMessage = 'Submission failed'
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() =>
      useChangePasswordForm({
        locale: 'en',
        onSubmitError,
      }))

    // Provide valid inputs.
    act(() => {
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    // Verify the onSubmitError callback is called when the fetch fails.
    expect(onSubmitError).toHaveBeenCalledWith(expect.any(Error))
    expect(result.current.success).toBe(false)

    fetchSpy.mockRestore()
  },
)

test(
  'shows validation errors when passwords do not match',
  async () => {
    const onSubmitError = vi.fn()
    const { result } = renderHook(() =>
      useChangePasswordForm({
        locale: 'en',
        onSubmitError,
      }))

    // Provide mismatched inputs.
    act(() => {
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password2!',
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    // Since passwords do not match, validation should block submission.
    expect(result.current.success).toBe(false)
    // The error message comes from confirmPasswordField using validateError.passwordNotMatch[locale]
    expect(result.current.errors.confirmPassword).toEqual(validateError.passwordNotMatch.en)
  },
)

test(
  'shows validation errors when password is weak',
  async () => {
    const onSubmitError = vi.fn()
    const { result } = renderHook(() =>
      useChangePasswordForm({
        locale: 'en',
        onSubmitError,
      }))

    act(() => {
      result.current.handleChange(
        'password',
        'abc123',
      )
      result.current.handleChange(
        'confirmPassword',
        'abc123',
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(result.current.success).toBe(false)
    expect(result.current.errors.password).toEqual(validateError.passwordFormat.en)
  },
)
