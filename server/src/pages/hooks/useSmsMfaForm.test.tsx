import { expect, test, vi } from 'vitest'
import * as React from 'react'
import { renderHook, act } from '@testing-library/react'

// Mock hooks from hono/jsx.
vi.mock('hono/jsx', () => ({
  useCallback: React.useCallback,
  useMemo: React.useMemo,
  useState: React.useState,
}))

// Mock getFollowUpParams to return test parameters.
vi.mock('pages/tools/param', () => ({
  getFollowUpParams: vi.fn(() => ({
    code: 'test-code',
    org: 'test-org',
  })),
}))

import useSmsMfaForm from 'pages/hooks/useSmsMfaForm'
import { routeConfig, localeConfig, typeConfig } from 'configs'
import * as requestModule from 'pages/tools/request'

const dummyLocale: typeConfig.Locale = 'en'

test('returns initial state correctly', () => {
  const onSubmitError = vi.fn()
  const onSwitchView = vi.fn()

  const { result } = renderHook(() =>
    useSmsMfaForm({ locale: dummyLocale, onSubmitError, onSwitchView })
  )

  // Initial values: empty phoneNumber, null mfaCode, no currentNumber, not resent.
  expect(result.current.values).toEqual({ phoneNumber: '', mfaCode: null })
  expect(result.current.currentNumber).toBeNull()
  expect(result.current.resent).toBe(false)
  // Errors are undefined because the fields have not yet been touched.
  expect(result.current.errors).toEqual({ phoneNumber: undefined, mfaCode: undefined })
})

test('handleChange updates phoneNumber and resets onSubmitError', () => {
  const onSubmitError = vi.fn()
  const onSwitchView = vi.fn()
  
  const { result } = renderHook(() =>
    useSmsMfaForm({ locale: dummyLocale, onSubmitError, onSwitchView })
  )
  
  act(() => {
    result.current.handleChange('phoneNumber', '+12345678901')
  })
  
  expect(onSubmitError).toHaveBeenCalledWith(null)
  expect(result.current.values.phoneNumber).toBe('+12345678901')
})

test('handleChange updates mfaCode and resets onSubmitError', () => {
  const onSubmitError = vi.fn()
  const onSwitchView = vi.fn()
  
  const { result } = renderHook(() =>
    useSmsMfaForm({ locale: dummyLocale, onSubmitError, onSwitchView })
  )
  
  act(() => {
    result.current.handleChange('mfaCode', ['1', '2', '3', '4', '5', '6'])
  })
  
  expect(onSubmitError).toHaveBeenCalledWith(null)
  expect(result.current.values.mfaCode).toEqual(['1', '2', '3', '4', '5', '6'])
})

test('getSmsMfaInfo updates state on successful fetch', async () => {
  const onSubmitError = vi.fn()
  const onSwitchView = vi.fn()
  
  const fakeResponse = {
    ok: true,
    json: async () => ({
      phoneNumber: '+12345678901',
      allowFallbackToEmailMfa: true,
      countryCode: '+1',
    }),
  }
  const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse as Response)
  
  const { result } = renderHook(() =>
    useSmsMfaForm({ locale: dummyLocale, onSubmitError, onSwitchView })
  )

  await act(async () => {
    result.current.getSmsMfaInfo()
    await Promise.resolve() // Wait for promises to resolve.
  })
  
  const qs = `?code=test-code&locale=${dummyLocale}&org=test-org`
  expect(fetchSpy).toHaveBeenCalledWith(
    `${routeConfig.IdentityRoute.ProcessSmsMfa}${qs}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )
  expect(result.current.currentNumber).toBe('+12345678901')
  // Since a phone number was returned, mfaCode should be initialized to an array of 6 empty strings.
  expect(result.current.values.mfaCode).toEqual(new Array(6).fill(''))
  expect(result.current.allowFallbackToEmailMfa).toBe(true)
  expect(result.current.countryCode).toBe('+1')
  
  fetchSpy.mockRestore()
})

test('getSmsMfaInfo calls onSubmitError on fetch failure', async () => {
  const onSubmitError = vi.fn()
  const onSwitchView = vi.fn()
  
  const error = new Error('Fetch failed')
  const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(error)
  
  const { result } = renderHook(() =>
    useSmsMfaForm({ locale: dummyLocale, onSubmitError, onSwitchView })
  )
  
  await act(async () => {
    result.current.getSmsMfaInfo()
    await Promise.resolve()
  })
  
  expect(onSubmitError).toHaveBeenCalledWith(error)
  fetchSpy.mockRestore()
})
