import {
  expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import useChangeEmailForm from 'pages/hooks/useChangeEmailForm'
import { routeConfig } from 'configs'

// Mock hooks from hono/jsx
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
  }),
)

// Mock getFollowUpParams to return a test redirectUri.
vi.mock(
  'pages/tools/param',
  () => ({ getFollowUpParams: vi.fn(() => ({ redirectUri: 'test-redirect' })) }),
)

test(
  'returns initial state with empty values and no errors',
  () => {
    const onSubmitError = vi.fn()
    const { result } = renderHook(() =>
      useChangeEmailForm({
        locale: 'en',
        onSubmitError,
      }))

    expect(result.current.values).toEqual({
      email: '',
      mfaCode: null,
    })
    expect(result.current.errors).toEqual({
      email: '',
      mfaCode: '',
    })
    expect(result.current.success).toBe(false)
    expect(result.current.resent).toBe(false)
    expect(result.current.redirectUri).toBe('test-redirect')
  },
)

test(
  'handleChange updates email and mfaCode',
  () => {
    const onSubmitError = vi.fn()
    const { result } = renderHook(() =>
      useChangeEmailForm({
        locale: 'en',
        onSubmitError,
      }))

    act(() => {
      result.current.handleChange(
        'email',
        'user@example.com',
      )
      result.current.handleChange(
        'mfaCode',
        ['1', '2', '3', '4', '5', '6'],
      )
    })

    // onSubmitError should be reset to null.
    expect(onSubmitError).toHaveBeenCalledWith(null)
    expect(result.current.values).toEqual({
      email: 'user@example.com',
      mfaCode: ['1', '2', '3', '4', '5', '6'],
    })
  },
)

test(
  'submits code when mfaCode is null (send code branch)',
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
      useChangeEmailForm({
        locale: 'en',
        onSubmitError,
      }))

    // Provide a valid email. mfaCode remains null.
    act(() => {
      result.current.handleChange(
        'email',
        'user@example.com',
      )
    })
    expect(result.current.values.mfaCode).toBeNull()

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    // Verify that fetch was called using the ChangeEmailCode route.
    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.ChangeEmailCode,
      expect.any(Object),
    )
    // After sending code, mfaCode should be set to an array of six empty strings.
    expect(result.current.values.mfaCode).toEqual(new Array(6).fill(''))
    // The success flag remains false.
    expect(result.current.success).toBe(false)

    fetchSpy.mockRestore()
  },
)

test(
  'submits form successfully when mfaCode is provided (change email branch)',
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
      useChangeEmailForm({
        locale: 'en',
        onSubmitError,
      }))

    act(() => {
      result.current.handleChange(
        'email',
        'user@example.com',
      )
      result.current.handleChange(
        'mfaCode',
        ['1', '2', '3', '4', '5', '6'],
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    // Verify that fetch was called using the ChangeEmail route.
    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.ChangeEmail,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
        body: expect.any(String),
      }),
    )
    // After a successful submit, the success flag should be true.
    expect(result.current.success).toBe(true)

    fetchSpy.mockRestore()
  },
)

test(
  'handleResend sends code and updates resent state',
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
      useChangeEmailForm({
        locale: 'en',
        onSubmitError,
      }))

    act(() => {
      result.current.handleChange(
        'email',
        'user@example.com',
      )
    })

    await act(async () => {
      result.current.handleResend()
      await Promise.resolve()
    })

    // Verify that fetch was called with the ChangeEmailCode endpoint.
    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.ChangeEmailCode,
      expect.any(Object),
    )
    expect(result.current.resent).toBe(true)
    expect(result.current.values.mfaCode).toEqual(new Array(6).fill(''))

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
      useChangeEmailForm({
        locale: 'en',
        onSubmitError,
      }))

    // Do not update email so that a validation error (empty email) exists.
    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    // Expect fetch not to be called when there are validation errors.
    expect(fetchSpy).not.toHaveBeenCalled()

    fetchSpy.mockRestore()
  },
)

test(
  'calls onSubmitError when send code submission fails',
  async () => {
    const onSubmitError = vi.fn()
    const errorMessage = 'Network error'
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() =>
      useChangeEmailForm({
        locale: 'en',
        onSubmitError,
      }))

    act(() => {
      result.current.handleChange(
        'email',
        'user@example.com',
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(onSubmitError).toHaveBeenCalledWith(expect.any(Error))

    fetchSpy.mockRestore()
  },
)

test(
  'calls onSubmitError when change email submission fails',
  async () => {
    const onSubmitError = vi.fn()
    const errorMessage = 'Submission failed'
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() =>
      useChangeEmailForm({
        locale: 'en',
        onSubmitError,
      }))

    act(() => {
      result.current.handleChange(
        'email',
        'user@example.com',
      )
      result.current.handleChange(
        'mfaCode',
        ['1', '2', '3', '4', '5', '6'],
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(onSubmitError).toHaveBeenCalledWith(expect.any(Error))

    fetchSpy.mockRestore()
  },
)
