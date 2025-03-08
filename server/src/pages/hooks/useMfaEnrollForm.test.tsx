import {
  expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

// Import the hook to test.
import useMfaEnrollForm from 'pages/hooks/useMfaEnrollForm'
import { routeConfig } from 'configs'
import * as requestModule from 'pages/tools/request'
import { MfaType } from 'models/user'
import { View } from './useCurrentView'

// Mock hooks from hono/jsx.
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
  }),
)

// Mock getFollowUpParams to return test data.
vi.mock(
  'pages/tools/param',
  () => ({
    getFollowUpParams: vi.fn(() => ({
      code: 'test-code', org: 'test-org',
    })),
  }),
)

test(
  'returns initial state with null mfaEnrollInfo',
  () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useMfaEnrollForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    expect(result.current.mfaEnrollInfo).toBeNull()
  },
)

test(
  'getMfaEnrollInfo successfully fetches and updates mfaEnrollInfo',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fakeEnrollResponse = { enrollment: 'success' }
    const fakeResponse = {
      ok: true,
      json: async () => fakeEnrollResponse,
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    const { result } = renderHook(() =>
      useMfaEnrollForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    // Call getMfaEnrollInfo and wait for the promise chain to resolve.
    await act(async () => {
      result.current.getMfaEnrollInfo()
      await Promise.resolve()
    })

    // Expect fetch to be called with GET and the proper URL.
    const qs = '?code=test-code&locale=en&org=test-org'
    expect(fetchSpy).toHaveBeenCalledWith(
      `${routeConfig.IdentityRoute.ProcessMfaEnroll}${qs}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
    // Verify that mfaEnrollInfo is updated.
    expect(result.current.mfaEnrollInfo).toEqual(fakeEnrollResponse)

    fetchSpy.mockRestore()
  },
)

test(
  'getMfaEnrollInfo calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fetchError = new Error('Network error')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(fetchError)

    const { result } = renderHook(() =>
      useMfaEnrollForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    await act(async () => {
      result.current.getMfaEnrollInfo()
      await Promise.resolve()
    })

    // Expect onSubmitError to have been called with the fetch error.
    expect(onSubmitError).toHaveBeenCalledWith(fetchError)
    // mfaEnrollInfo should remain null on error.
    expect(result.current.mfaEnrollInfo).toBeNull()

    fetchSpy.mockRestore()
  },
)

test(
  'handleEnroll submits enrollment and calls handleAuthorizeStep for success response',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fakeResponseData = { authorized: true }
    const fakeResponse = {
      ok: true,
      json: async () => fakeResponseData,
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    // Spy on handleAuthorizeStep to simulate the authorization step.
    const handleAuthorizeSpy = vi.spyOn(
      requestModule,
      'handleAuthorizeStep',
    ).mockImplementation((
      response, locale, onSwitchView,
    ) => {
      onSwitchView(View.Consent)
    })

    const { result } = renderHook(() =>
      useMfaEnrollForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    await act(async () => {
      result.current.handleEnroll(MfaType.Email)
      await Promise.resolve()
    })

    // Verify that fetch was called with POST and the correct parameters.
    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.ProcessMfaEnroll,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: expect.any(String), // The body contains stringified JSON.
      },
    )

    // Verify that handleAuthorizeStep was executed, triggering onSwitchView.
    expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

    fetchSpy.mockRestore()
    handleAuthorizeSpy.mockRestore()
  },
)

test(
  'handleEnroll calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fetchError = new Error('Submission failed')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(fetchError)

    const { result } = renderHook(() =>
      useMfaEnrollForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    await act(async () => {
      result.current.handleEnroll(MfaType.Email)
      await Promise.resolve()
    })

    // Verify that onSubmitError is called when the fetch fails.
    expect(onSubmitError).toHaveBeenCalledWith(fetchError)

    fetchSpy.mockRestore()
  },
)
