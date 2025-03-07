import { expect, test, vi } from 'vitest'
import * as React from 'react'
import { renderHook, act } from '@testing-library/react'

// Mock hooks from hono/jsx
vi.mock('hono/jsx', () => ({
  useCallback: React.useCallback,
  useMemo: React.useMemo,
  useState: React.useState,
}))

// Mock getFollowUpParams to return test parameters.
vi.mock('pages/tools/param', () => ({
  getFollowUpParams: vi.fn(() => ({
    code: 'testcode',
    org: 'testorg',
    redirectUri: 'test-redirect',
  })),
}))

// Mock passkey enrollment module.
vi.mock('pages/tools/passkey', () => ({
  enroll: vi.fn(),
}))

// Mock request helpers.
vi.mock('pages/tools/request', () => ({
  parseAuthorizeFollowUpValues: vi.fn(() => ({ mockKey: 'mockValue' })),
  parseResponse: vi.fn(async (response) => await response.json()),
}))

import useManagePasskeyForm from 'pages/hooks/useManagePasskeyForm'
import { routeConfig, localeConfig } from 'configs'

// Extract expected success messages from localeConfig.
const successRemoveMsgEn = localeConfig.managePasskey.removeSuccess['en']
const successEnrollMsgEn = localeConfig.managePasskey.enrollSuccess['en']

test('returns initial state correctly', () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useManagePasskeyForm({
      locale: 'en',
      onSubmitError,
    })
  )

  expect(result.current.successMessage).toBeNull()
  expect(result.current.passkey).toBeNull()
  expect(result.current.enrollOptions).toBeNull()
  expect(result.current.redirectUri).toBe('test-redirect')
  expect(typeof result.current.getManagePasskeyInfo).toBe('function')
  expect(typeof result.current.handleRemove).toBe('function')
  expect(typeof result.current.handleEnroll).toBe('function')
})

test('getManagePasskeyInfo fetches passkey info and sets state', async () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useManagePasskeyForm({
      locale: 'en',
      onSubmitError,
    })
  )

  // Prepare fake response (simulate GetManagePasskeyRes).
  const fakeResponse = {
    ok: true,
    json: async () => ({
      passkey: { id: 'p1' },
      enrollOptions: { challenge: 'chal1' },
    }),
  }
  const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse as Response)

  await act(async () => {
    result.current.getManagePasskeyInfo()
    await Promise.resolve() // Ensure promise chain resolves.
  })

  const expectedUrl = `${routeConfig.IdentityRoute.ManagePasskey}?code=testcode&locale=en&org=testorg`
  expect(fetchSpy).toHaveBeenCalledWith(
    expectedUrl,
    expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    })
  )
  
  expect(result.current.passkey).toEqual({ id: 'p1' })
  expect(result.current.enrollOptions).toEqual({ challenge: 'chal1' })

  fetchSpy.mockRestore()
})

test('getManagePasskeyInfo calls onSubmitError on fetch failure', async () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useManagePasskeyForm({
      locale: 'en',
      onSubmitError,
    })
  )

  const error = new Error('Fetch error')
  const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(error)

  await act(async () => {
    result.current.getManagePasskeyInfo()
    await Promise.resolve()
  })

  expect(onSubmitError).toHaveBeenCalledWith(error)
  fetchSpy.mockRestore()
})

test('handleRemove removes passkey and sets successMessage', async () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useManagePasskeyForm({
      locale: 'en',
      onSubmitError,
    })
  )

  // Simulate an existing passkey (for removal).
  result.current.passkey = { id: 'p1' }

  const fakeResponse = {
    ok: true,
    json: async () => ({}),
  }
  const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse as Response)

  await act(async () => {
    result.current.handleRemove()
    await Promise.resolve()
  })

  expect(fetchSpy).toHaveBeenCalledWith(
    routeConfig.IdentityRoute.ManagePasskey,
    expect.objectContaining({
      method: 'DELETE',
      headers: expect.objectContaining({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ mockKey: 'mockValue' }),
    })
  )
  expect(result.current.successMessage).toBe(successRemoveMsgEn)
  expect(result.current.passkey).toBeNull()

  fetchSpy.mockRestore()
})

test('handleRemove calls onSubmitError on fetch failure', async () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useManagePasskeyForm({
      locale: 'en',
      onSubmitError,
    })
  )

  const error = new Error('Remove failed')
  const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(error)

  await act(async () => {
    result.current.handleRemove()
    await Promise.resolve()
  })

  expect(onSubmitError).toHaveBeenCalledWith(error)
  fetchSpy.mockRestore()
})
