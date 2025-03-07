import { expect, test, vi } from 'vitest'
import * as React from 'react'
import { renderHook, act } from '@testing-library/react'

// Mock hooks from hono/jsx
vi.mock('hono/jsx', () => ({
  useCallback: React.useCallback,
  useMemo: React.useMemo,
  useState: React.useState,
}))

// Mock getFollowUpParams to return a test parameter.
vi.mock('pages/tools/param', () => ({
  getFollowUpParams: vi.fn(() => ({ testParam: 'testValue' })),
}))

import useEmailMfaForm from 'pages/hooks/useEmailMfaForm'
import { routeConfig } from 'configs'
import * as requestModule from 'pages/tools/request'

test('returns initial state with empty mfaCode and no errors', () => {
  const onSubmitError = vi.fn()
  const onSwitchView = vi.fn()
  const { result } = renderHook(() =>
    useEmailMfaForm({
      locale: 'en',
      onSubmitError,
      onSwitchView,
    })
  )

  expect(result.current.values).toEqual({
    mfaCode: new Array(6).fill(''),
  })
  expect(result.current.resent).toBe(false)
  // Since the "touched" flag is false, errors should be undefined.
  expect(result.current.errors).toEqual({ mfaCode: undefined })
})

test('handleChange updates mfaCode and resets onSubmitError', () => {
  const onSubmitError = vi.fn()
  const onSwitchView = vi.fn()
  const { result } = renderHook(() =>
    useEmailMfaForm({
      locale: 'en',
      onSubmitError,
      onSwitchView,
    })
  )

  act(() => {
    result.current.handleChange('mfaCode', ['1', '2', '3', '4', '5', '6'])
  })

  expect(onSubmitError).toHaveBeenCalledWith(null)
  expect(result.current.values.mfaCode).toEqual(['1', '2', '3', '4', '5', '6'])
})

test('sendEmailMfa sends request and sets resent when isResend true', async () => {
  const onSubmitError = vi.fn()
  const onSwitchView = vi.fn()
  const { result } = renderHook(() =>
    useEmailMfaForm({
      locale: 'en',
      onSubmitError,
      onSwitchView,
    })
  )

  const fakeResponse = { ok: true, json: async () => ({}) }
  const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse as Response)

  await act(async () => {
    result.current.sendEmailMfa(true)
    await Promise.resolve() // ensure fetch promise chain resolves
  })

  expect(fetchSpy).toHaveBeenCalledWith(
    routeConfig.IdentityRoute.SendEmailMfa,
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      body: expect.any(String),
    })
  )
  expect(result.current.resent).toBe(true)

  fetchSpy.mockRestore()
})

test('sendEmailMfa calls onSubmitError on fetch failure', async () => {
  const onSubmitError = vi.fn()
  const onSwitchView = vi.fn()
  const { result } = renderHook(() =>
    useEmailMfaForm({
      locale: 'en',
      onSubmitError,
      onSwitchView,
    })
  )

  const error = new Error('Fetch failed')
  const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(error)

  await act(async () => {
    result.current.sendEmailMfa(true)
    await Promise.resolve()
  })

  expect(onSubmitError).toHaveBeenCalledWith(error)

  fetchSpy.mockRestore()
})

test('handleSubmit blocks submission when validation errors exist', async () => {
  const onSubmitError = vi.fn()
  const onSwitchView = vi.fn()
  const { result } = renderHook(() =>
    useEmailMfaForm({
      locale: 'en',
      onSubmitError,
      onSwitchView,
    })
  )

  // Provide an invalid MFA code (fewer than 6 digits) to trigger a validation error.
  act(() => {
    result.current.handleChange('mfaCode', ['1', '2', '3'])
  })

  const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
  const fetchSpy = vi.spyOn(global, 'fetch')

  await act(async () => {
    result.current.handleSubmit(fakeEvent)
    await Promise.resolve()
  })

  expect(fakeEvent.preventDefault).toHaveBeenCalled()
  // No fetch call should occur because validation failed.
  expect(fetchSpy).not.toHaveBeenCalled()
  // With touched set to true, the error message should be defined.
  expect(result.current.errors.mfaCode).toBeDefined()

  fetchSpy.mockRestore()
})

test('handleSubmit submits data successfully and calls onSwitchView', async () => {
  const onSubmitError = vi.fn()
  // Mock handleAuthorizeStep to simulate a successful authorization step.
  vi.spyOn(requestModule, 'handleAuthorizeStep').mockImplementation((response, locale, onSwitchView) => {
    onSwitchView('nextView')
  })

  const onSwitchView = vi.fn()
  const { result } = renderHook(() =>
    useEmailMfaForm({
      locale: 'en',
      onSubmitError,
      onSwitchView,
    })
  )

  // Provide a valid MFA code (6 digits)
  act(() => {
    result.current.handleChange('mfaCode', ['1', '2', '3', '4', '5', '6'])
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
    routeConfig.IdentityRoute.ProcessEmailMfa,
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      body: expect.any(String),
    })
  )
  expect(onSwitchView).toHaveBeenCalledWith('nextView')

  fetchSpy.mockRestore()
})

test('handleSubmit calls onSubmitError when fetch fails', async () => {
  const onSubmitError = vi.fn()
  const onSwitchView = vi.fn()
  const { result } = renderHook(() =>
    useEmailMfaForm({
      locale: 'en',
      onSubmitError,
      onSwitchView,
    })
  )

  // Provide a valid MFA code (6 digits)
  act(() => {
    result.current.handleChange('mfaCode', ['1', '2', '3', '4', '5', '6'])
  })

  const error = new Error('Submission failed')
  const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(error)
  const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

  await act(async () => {
    result.current.handleSubmit(fakeEvent)
    await Promise.resolve()
  })

  expect(fakeEvent.preventDefault).toHaveBeenCalled()
  expect(onSubmitError).toHaveBeenCalledWith(error)

  fetchSpy.mockRestore()
}) 