import {
  expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import { View } from './useCurrentView'
import useRecoveryCodeEnrollForm from 'pages/hooks/useRecoveryCodeEnrollForm'
import { routeConfig } from 'configs'
import * as requestModule from 'pages/tools/request'

// Mock hooks from hono/jsx
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
  }),
)

// Mock getFollowUpParams to return test parameters
vi.mock(
  'pages/tools/param',
  () => ({
    getFollowUpParams: vi.fn(() => ({
      code: 'test-code',
      org: 'test-org',
    })),
  }),
)

// Mock the request module functions to avoid navigation issues
vi.mock(
  'pages/tools/request',
  () => ({
    parseResponse: vi.fn((response) => response.json()),
    parseAuthorizeFollowUpValues: vi.fn((params, locale) => ({
      code: params.code,
      locale,
      org: params.org,
    })),
    handleAuthorizeStep: vi.fn(),
  }),
)

test(
  'returns initial state with null recoveryCodeEnrollInfo',
  () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useRecoveryCodeEnrollForm({
        locale: 'en',
        onSubmitError,
        onSwitchView,
      }))

    expect(result.current.recoveryCodeEnrollInfo).toBeNull()
    expect(typeof result.current.getRecoveryCodeEnrollInfo).toBe('function')
    expect(typeof result.current.handleContinue).toBe('function')
  },
)

test(
  'getRecoveryCodeEnrollInfo successfully fetches and updates recoveryCodeEnrollInfo',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fakeEnrollInfo = {
      recoveryCodes: ['code1', 'code2', 'code3'],
      qrCode: 'fake-qr-code',
    }
    const fakeResponse = {
      ok: true,
      json: async () => fakeEnrollInfo,
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    // Mock parseResponse to return the response data
    const parseResponseSpy = vi.mocked(requestModule.parseResponse)
    parseResponseSpy.mockResolvedValue(fakeEnrollInfo)

    const { result } = renderHook(() =>
      useRecoveryCodeEnrollForm({
        locale: 'en',
        onSubmitError,
        onSwitchView,
      }))

    await act(async () => {
      result.current.getRecoveryCodeEnrollInfo()
      await Promise.resolve()
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      `${routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll}?code=test-code&locale=en&org=test-org`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
    expect(parseResponseSpy).toHaveBeenCalledWith(fakeResponse)
    expect(result.current.recoveryCodeEnrollInfo).toEqual(fakeEnrollInfo)

    fetchSpy.mockRestore()
  },
)

test(
  'getRecoveryCodeEnrollInfo calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fetchError = new Error('Network error')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(fetchError)

    const { result } = renderHook(() =>
      useRecoveryCodeEnrollForm({
        locale: 'en',
        onSubmitError,
        onSwitchView,
      }))

    await act(async () => {
      result.current.getRecoveryCodeEnrollInfo()
      await Promise.resolve()
    })

    expect(onSubmitError).toHaveBeenCalledWith(fetchError)
    expect(result.current.recoveryCodeEnrollInfo).toBeNull()

    fetchSpy.mockRestore()
  },
)

test(
  'handleContinue submits successfully and calls handleAuthorizeStep',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fakeResponseData = { nextStep: 'consent' }
    const fakeResponse = {
      ok: true,
      json: async () => fakeResponseData,
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    // Mock parseResponse to return the response data
    const parseResponseSpy = vi.mocked(requestModule.parseResponse)
    parseResponseSpy.mockResolvedValue(fakeResponseData)

    // Mock handleAuthorizeStep to simulate the authorization step
    const handleAuthorizeSpy = vi.mocked(requestModule.handleAuthorizeStep)
    handleAuthorizeSpy.mockImplementation((
      response, locale, onSwitchViewFn,
    ) => {
      onSwitchViewFn(View.Consent)
    })

    const { result } = renderHook(() =>
      useRecoveryCodeEnrollForm({
        locale: 'en',
        onSubmitError,
        onSwitchView,
      }))

    await act(async () => {
      result.current.handleContinue()
      await Promise.resolve()
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      },
    )

    // Verify that parseResponse was called
    expect(parseResponseSpy).toHaveBeenCalledWith(fakeResponse)

    // Verify that handleAuthorizeStep was called
    expect(handleAuthorizeSpy).toHaveBeenCalledWith(
      fakeResponseData,
      'en',
      onSwitchView,
    )

    // Verify that onSwitchView was called by our mock
    expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

    fetchSpy.mockRestore()
  },
)

test(
  'handleContinue calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fetchError = new Error('Submission failed')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(fetchError)

    const { result } = renderHook(() =>
      useRecoveryCodeEnrollForm({
        locale: 'en',
        onSubmitError,
        onSwitchView,
      }))

    await act(async () => {
      result.current.handleContinue()
      await Promise.resolve()
    })

    expect(onSubmitError).toHaveBeenCalledWith(fetchError)

    fetchSpy.mockRestore()
  },
)

test(
  'handleContinue sends correct request body with follow-up parameters',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fakeResponseData = {}
    const fakeResponse = {
      ok: true,
      json: async () => fakeResponseData,
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    // Mock parseResponse to return the response data
    const parseResponseSpy = vi.mocked(requestModule.parseResponse)
    parseResponseSpy.mockResolvedValue(fakeResponseData)

    // Mock parseAuthorizeFollowUpValues to return test data
    const parseAuthorizeFollowUpValuesSpy = vi.mocked(requestModule.parseAuthorizeFollowUpValues)
    parseAuthorizeFollowUpValuesSpy.mockReturnValue({
      code: 'test-code',
      locale: 'en',
      org: 'test-org',
      additionalParam: 'test-value',
    })

    const { result } = renderHook(() =>
      useRecoveryCodeEnrollForm({
        locale: 'en',
        onSubmitError,
        onSwitchView,
      }))

    await act(async () => {
      result.current.handleContinue()
      await Promise.resolve()
    })

    // Verify that parseAuthorizeFollowUpValues was called with correct parameters
    expect(parseAuthorizeFollowUpValuesSpy).toHaveBeenCalledWith(
      { code: 'test-code', org: 'test-org' },
      'en',
    )

    // Verify the request body contains the parsed follow-up values
    const fetchCall = fetchSpy.mock.calls[0]
    const requestBody = JSON.parse((fetchCall[1] as RequestInit).body as string)
    expect(requestBody).toEqual({
      code: 'test-code',
      locale: 'en',
      org: 'test-org',
      additionalParam: 'test-value',
    })

    fetchSpy.mockRestore()
  },
) 