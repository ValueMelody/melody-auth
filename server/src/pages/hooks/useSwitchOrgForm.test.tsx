import {
  expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

// Import the hook to test.
import { View } from './useCurrentView'
import useSwitchOrgForm from 'pages/hooks/useSwitchOrgForm'
import { routeConfig } from 'configs'
import * as requestModule from 'pages/tools/request'

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
  'returns initial state with empty orgs array',
  () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useSwitchOrgForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    expect(result.current.orgs).toEqual([])
    expect(result.current.activeOrgSlug).toBe('')
    expect(result.current.isSwitching).toBe(false)
  },
)

test(
  'getUserOrgsInfo successfully fetches and updates orgs and activeOrgSlug',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fakeOrgsResponse = {
      orgs: [
        {
          slug: 'org1', name: 'Organization 1',
        },
        {
          slug: 'org2', name: 'Organization 2',
        },
      ],
      activeOrgSlug: 'org1',
    }
    const fakeResponse = {
      ok: true,
      json: async () => fakeOrgsResponse,
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    const { result } = renderHook(() =>
      useSwitchOrgForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    // Call getUserOrgsInfo and wait for the promise chain to resolve.
    await act(async () => {
      result.current.getUserOrgsInfo()
      await Promise.resolve()
    })

    // Expect fetch to be called with GET and the proper URL.
    const qs = '?code=test-code&locale=en'
    expect(fetchSpy).toHaveBeenCalledWith(
      `${routeConfig.IdentityRoute.ProcessSwitchOrg}${qs}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
    // Verify that orgs and activeOrgSlug are updated.
    expect(result.current.orgs).toEqual(fakeOrgsResponse.orgs)
    expect(result.current.activeOrgSlug).toBe('org1')

    fetchSpy.mockRestore()
  },
)

test(
  'getUserOrgsInfo calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fetchError = new Error('Network error')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(fetchError)

    const { result } = renderHook(() =>
      useSwitchOrgForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    await act(async () => {
      result.current.getUserOrgsInfo()
      await Promise.resolve()
    })

    // Expect onSubmitError to have been called with the fetch error.
    expect(onSubmitError).toHaveBeenCalledWith(fetchError)
    // orgs should remain empty on error.
    expect(result.current.orgs).toEqual([])
    expect(result.current.activeOrgSlug).toBe('')

    fetchSpy.mockRestore()
  },
)

test(
  'handleSwitchOrg submits org switch and calls handleAuthorizeStep for success response',
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
      useSwitchOrgForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    await act(async () => {
      result.current.handleSwitchOrg('org2')
      await Promise.resolve()
    })

    // Verify that fetch was called with POST and the correct parameters.
    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.ProcessSwitchOrg,
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

    // Verify that isSwitching is reset to false after completion.
    expect(result.current.isSwitching).toBe(false)

    fetchSpy.mockRestore()
    handleAuthorizeSpy.mockRestore()
  },
)

test(
  'handleSwitchOrg calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fetchError = new Error('Switch failed')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(fetchError)

    const { result } = renderHook(() =>
      useSwitchOrgForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    await act(async () => {
      result.current.handleSwitchOrg('org2')
      await Promise.resolve()
    })

    // Verify that onSubmitError is called when the fetch fails.
    expect(onSubmitError).toHaveBeenCalledWith(fetchError)

    // Verify that isSwitching is reset to false after error.
    expect(result.current.isSwitching).toBe(false)

    fetchSpy.mockRestore()
  },
)

test(
  'handleSwitchOrg sets isSwitching to true during operation',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    let resolveFetch: (value: any) => void
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve
    })
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockReturnValue(fetchPromise as Promise<Response>)

    const { result } = renderHook(() =>
      useSwitchOrgForm({
        locale: 'en', onSubmitError, onSwitchView,
      }))

    // Start the switch operation.
    act(() => {
      result.current.handleSwitchOrg('org2')
    })

    // isSwitching should be true while the operation is in progress.
    expect(result.current.isSwitching).toBe(true)

    // Resolve the fetch to complete the operation.
    await act(async () => {
      resolveFetch!({
        ok: true,
        json: async () => ({ authorized: true }),
      })
      await Promise.resolve()
    })

    // isSwitching should be false after completion.
    expect(result.current.isSwitching).toBe(false)

    fetchSpy.mockRestore()
  },
)
