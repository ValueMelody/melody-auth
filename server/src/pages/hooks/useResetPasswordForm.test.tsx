import { expect, test, vi } from 'vitest'
import * as React from 'react'
import { renderHook, act } from '@testing-library/react'

// Mock hooks from hono/jsx
vi.mock('hono/jsx', () => ({
  useCallback: React.useCallback,
  useMemo: React.useMemo,
  useState: React.useState,
}))

import useResetPasswordForm from 'pages/hooks/useResetPasswordForm'
import { routeConfig } from 'configs'
import { parseResponse } from 'pages/tools/request'

// --- Tests for useResetPasswordForm ---
test('returns initial state correctly', () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useResetPasswordForm({ locale: 'en', onSubmitError })
  )

  expect(result.current.values).toEqual({
    email: '',
    mfaCode: null,
    password: '',
    confirmPassword: '',
  })
  // Since touched is false, errors should be empty strings.
  expect(result.current.errors).toEqual({
    email: '',
    mfaCode: '',
    password: '',
    confirmPassword: '',
  })
  expect(result.current.resent).toBe(false)
  expect(result.current.success).toBe(false)
})

test('handleChange updates fields and resets onSubmitError', () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useResetPasswordForm({ locale: 'en', onSubmitError })
  )

  act(() => {
    result.current.handleChange('email', 'user@example.com')
    result.current.handleChange('mfaCode', ['1', '2', '3', '4', '5', '6'])
    result.current.handleChange('password', 'Password1!')
    result.current.handleChange('confirmPassword', 'Password1!')
  })

  // onSubmitError should have been cleared.
  expect(onSubmitError).toHaveBeenCalledWith(null)
  expect(result.current.values).toEqual({
    email: 'user@example.com',
    mfaCode: ['1', '2', '3', '4', '5', '6'],
    password: 'Password1!',
    confirmPassword: 'Password1!',
  })
})

test('handleResend sends reset password code and sets resent on success', async () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useResetPasswordForm({ locale: 'en', onSubmitError })
  )

  // Set a valid email.
  act(() => {
    result.current.handleChange('email', 'user@example.com')
  })

  const fakeResponse = { ok: true, json: async () => ({}) }
  const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse as Response)

  await act(async () => {
    result.current.handleResend()
    // Wait for the promise chain to resolve.
    await Promise.resolve()
  })

  expect(fetchSpy).toHaveBeenCalledWith(
    routeConfig.IdentityRoute.ResetPasswordCode,
    expect.objectContaining({
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'en', email: 'user@example.com' }),
    })
  )
  expect(result.current.resent).toBe(true)
  fetchSpy.mockRestore()
})

test('handleResend calls onSubmitError on fetch failure', async () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useResetPasswordForm({ locale: 'en', onSubmitError })
  )

  act(() => result.current.handleChange('email', 'user@example.com'))

  const error = new Error('Network error')
  const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(error)

  await act(async () => {
    result.current.handleResend()
    await Promise.resolve()
  })

  expect(onSubmitError).toHaveBeenCalledWith(error)
  fetchSpy.mockRestore()
})

test('handleSubmit sends reset password code when mfaCode is null', async () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useResetPasswordForm({ locale: 'en', onSubmitError })
  )

  // Set a valid email; leave mfaCode as null.
  act(() => {
    result.current.handleChange('email', 'user@example.com')
  })
  expect(result.current.values.mfaCode).toBeNull()

  const fakeResponse = { ok: true, json: async () => ({}) }
  const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse as Response)
  const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

  await act(async () => {
    result.current.handleSubmit(fakeEvent)
    await Promise.resolve()
  })

  expect(fakeEvent.preventDefault).toHaveBeenCalled()
  expect(fetchSpy).toHaveBeenCalledWith(
    routeConfig.IdentityRoute.ResetPasswordCode,
    expect.objectContaining({
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'en', email: 'user@example.com' }),
    })
  )
  // After successful fetch, mfaCode is set to an array of six empty strings.
  expect(result.current.values.mfaCode).toEqual(new Array(6).fill(''))
  fetchSpy.mockRestore()
})

test('handleSubmit sends reset password form when mfaCode is provided', async () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useResetPasswordForm({ locale: 'en', onSubmitError })
  )

  // Provide valid inputs for both branches.
  act(() => {
    result.current.handleChange('email', 'user@example.com')
    result.current.handleChange('mfaCode', ['1', '2', '3', '4', '5', '6'])
    result.current.handleChange('password', 'Password1!')
    result.current.handleChange('confirmPassword', 'Password1!')
  })

  const fakeResponse = { ok: true, json: async () => ({}) }
  const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse as Response)
  const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

  await act(async () => {
    result.current.handleSubmit(fakeEvent)
    await Promise.resolve()
  })

  expect(fakeEvent.preventDefault).toHaveBeenCalled()
  expect(fetchSpy).toHaveBeenCalledWith(
    routeConfig.IdentityRoute.ResetPassword,
    expect.objectContaining({
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: expect.any(String),
    })
  )
  // On a successful submission, success should be set to true.
  expect(result.current.success).toBe(true)
  fetchSpy.mockRestore()
})

test('handleSubmit blocks submission when validation errors exist', async () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useResetPasswordForm({ locale: 'en', onSubmitError })
  )

  // Do not update email so that validation fails (empty email should be invalid).
  const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
  const fetchSpy = vi.spyOn(global, 'fetch')

  await act(async () => {
    result.current.handleSubmit(fakeEvent)
    await Promise.resolve()
  })

  expect(fakeEvent.preventDefault).toHaveBeenCalled()
  // No fetch call should be made if there are validation errors.
  expect(fetchSpy).not.toHaveBeenCalled()
  fetchSpy.mockRestore()
}) 