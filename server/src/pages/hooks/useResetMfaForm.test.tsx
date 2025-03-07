import { expect, test, vi } from 'vitest'
import React from 'react'
import { renderHook, act } from '@testing-library/react'

// Mock hooks from hono/jsx
vi.mock('hono/jsx', () => ({
  useMemo: React.useMemo,
  useState: React.useState,
}))

// Mock getFollowUpParams from pages/tools/param to return a dummy redirectUri.
vi.mock('pages/tools/param', () => ({
  getFollowUpParams: vi.fn(() => ({
    redirectUri: 'test-redirect',
  })),
}))


import useResetMfaForm from 'pages/hooks/useResetMfaForm'
import { routeConfig } from 'configs'

test('returns initial state with success false and proper redirectUri', () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() => useResetMfaForm({ locale: 'en', onSubmitError }))

  expect(result.current.success).toBe(false)
  expect(typeof result.current.handleSubmit).toBe('function')
  expect(result.current.redirectUri).toBe('test-redirect')
})

test('handleSubmit sets success to true on successful fetch', async () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() => useResetMfaForm({ locale: 'en', onSubmitError }))
  
  // Create a fake event with a preventDefault spy.
  const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

  // Spy on fetch to simulate a successful response.
  const fakeResponse = { ok: true, json: async () => ({}) }
  const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse as Response)

  await act(async () => {
    result.current.handleSubmit(fakeEvent)
    // Ensure promise chain resolves.
    await Promise.resolve()
  })

  expect(fakeEvent.preventDefault).toHaveBeenCalled()
  expect(fetchSpy).toHaveBeenCalledWith(
    routeConfig.IdentityRoute.ResetMfa,
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      body: expect.any(String),
    })
  )
  expect(result.current.success).toBe(true)

  fetchSpy.mockRestore()
})

test('handleSubmit calls onSubmitError when fetch fails', async () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() => useResetMfaForm({ locale: 'en', onSubmitError }))
  
  const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
  const error = new Error('Fetch failed')
  
  // Simulate a fetch error.
  const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(error)

  await act(async () => {
    result.current.handleSubmit(fakeEvent)
    await Promise.resolve()
  })

  expect(fakeEvent.preventDefault).toHaveBeenCalled()
  expect(onSubmitError).toHaveBeenCalledWith(error)

  fetchSpy.mockRestore()
}) 