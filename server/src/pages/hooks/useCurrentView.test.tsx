import { describe, test, vi, expect, afterEach } from 'vitest'
import * as React from 'react'
import { renderHook, act } from '@testing-library/react'
import useCurrentView, { View } from 'pages/hooks/useCurrentView'
import { routeConfig } from 'configs'
import { getStepFromParams } from 'pages/tools/param'

// Mock hooks from hono/jsx
vi.mock('hono/jsx', () => ({
  useCallback: React.useCallback,
  useMemo: React.useMemo,
  useState: React.useState,
}))

// Mock getStepFromParams to control its return value in tests.
vi.mock('pages/tools/param', () => ({
  getStepFromParams: vi.fn(),
}))

describe('useCurrentView', () => {
  // Reset mocks and window location between tests.
  afterEach(() => {
    vi.resetAllMocks()
    window.history.pushState({}, '', '/')
  })

  test('returns view from getStepFromParams if available', () => {
    // Force getStepFromParams to return a specific view.
    (getStepFromParams as unknown as vi.Mock).mockReturnValue(View.OtpMfa)
    const { result } = renderHook(() => useCurrentView())
    expect(result.current.view).toBe(View.OtpMfa)
  })

  test('returns AuthCodeExpired view based on pathname when no step from params', () => {
    // Force getStepFromParams to return null.
    (getStepFromParams as unknown as vi.Mock).mockReturnValue(null)
    // Set the pathname to match the AuthCodeExpiredView.
    window.history.pushState({}, '', routeConfig.IdentityRoute.AuthCodeExpiredView)
    const { result } = renderHook(() => useCurrentView())
    expect(result.current.view).toBe(View.AuthCodeExpired)
  })

  test('returns VerifyEmail view based on pathname when no step from params', () => {
    (getStepFromParams as unknown as vi.Mock).mockReturnValue(null)
    // Set the pathname to match the VerifyEmailView.
    window.history.pushState({}, '', routeConfig.IdentityRoute.VerifyEmailView)
    const { result } = renderHook(() => useCurrentView())
    expect(result.current.view).toBe(View.VerifyEmail)
  })

  test('returns SignIn view as default when no matching pathname and no step from params', () => {
    (getStepFromParams as unknown as vi.Mock).mockReturnValue(null)
    // Set the pathname to a random value that does not match other cases.
    window.history.pushState({}, '', '/random-path')
    const { result } = renderHook(() => useCurrentView())
    expect(result.current.view).toBe(View.SignIn)
  })

  test('handleSwitchView updates view', () => {
    (getStepFromParams as unknown as vi.Mock).mockReturnValue(null)
    window.history.pushState({}, '', '/')
    const { result } = renderHook(() => useCurrentView())
    // Initially, the view is SignIn (as default).
    expect(result.current.view).toBe(View.SignIn)
    // Switch to a different view and verify that the view is updated.
    act(() => {
      result.current.handleSwitchView(View.MfaEnroll)
    })
    expect(result.current.view).toBe(View.MfaEnroll)
  })
}) 