import { describe, expect, test, vi } from 'vitest'
import * as React from 'react'
import { renderHook, act } from '@testing-library/react'

// Mock hooks from hono/jsx.
vi.mock('hono/jsx', () => ({
  useCallback: React.useCallback,
  useMemo: React.useMemo,
  useState: React.useState,
}))

import useSignInForm from 'pages/hooks/useSignInForm'
import { routeConfig } from 'configs'
import * as requestModule from 'pages/tools/request'

// Note: For testing purposes, we pass a dummy params object.
const dummyParams = {} as any

describe('useSignInForm', () => {
  test('returns initial state with empty values and no errors', () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    
    const { result } = renderHook(() =>
      useSignInForm({
        locale: 'en',
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      })
    )

    expect(result.current.values).toEqual({
      email: '',
      password: '',
    })
    // Since touched flags are false, errors are not shown.
    expect(result.current.errors).toEqual({
      email: undefined,
      password: undefined,
    })
    expect(typeof result.current.handleChange).toBe('function')
    expect(typeof result.current.handleSubmit).toBe('function')
  })

  test('handleChange updates email and password, and resets onSubmitError', () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    
    const { result } = renderHook(() =>
      useSignInForm({
        locale: 'en',
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      })
    )

    act(() => {
      result.current.handleChange('email', 'test@example.com')
    })
    // Verify onSubmitError is reset.
    expect(onSubmitError).toHaveBeenCalledWith(null)
    expect(result.current.values.email).toBe('test@example.com')

    act(() => {
      result.current.handleChange('password', 'ValidPassword123!')
    })
    expect(onSubmitError).toHaveBeenCalledWith(null)
    expect(result.current.values.password).toBe('ValidPassword123!')
  })

  test('handleSubmit blocks submission when validation errors exist', async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    
    const { result } = renderHook(() =>
      useSignInForm({
        locale: 'en',
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      })
    )

    // With default values (empty strings), the validation should fail.
    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    const fetchSpy = vi.spyOn(global, 'fetch')

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    // Since there should be validation errors the fetch call should not occur.
    expect(fetchSpy).not.toHaveBeenCalled()
    // With touched set to true after submit, errors should be defined.
    expect(result.current.errors.email).not.toBeUndefined()
    expect(result.current.errors.password).not.toBeUndefined()

    fetchSpy.mockRestore()
  })

  test('handleSubmit submits data successfully and calls handleAuthorizeStep', async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const params = { extra: 'data' } as any
    const { result } = renderHook(() =>
      useSignInForm({
        locale: 'en',
        params,
        onSubmitError,
        onSwitchView,
      })
    )

    // Update with valid values.
    act(() => {
      result.current.handleChange('email', 'test@example.com')
      result.current.handleChange('password', 'ValidPassword123!')
    })

    // Prepare a fake fetch response.
    const fakeResponse = { ok: true, json: async () => ({}) }
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse as Response)

    // Spy on handleAuthorizeStep to simulate a successful authorization.
    const handleAuthorizeSpy = vi.spyOn(requestModule, 'handleAuthorizeStep').mockImplementation(
      (response, locale, onSwitchView) => {
        onSwitchView('nextView')
      }
    )

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.AuthorizePassword,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
        body: expect.any(String),
      })
    )
    // Verify that upon a successful fetch the onSwitchView ("nextView") is triggered.
    expect(onSwitchView).toHaveBeenCalledWith('nextView')

    fetchSpy.mockRestore()
    handleAuthorizeSpy.mockRestore()
  })

  test('handleSubmit calls onSubmitError when fetch fails', async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useSignInForm({
        locale: 'en',
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      })
    )

    // Provide valid form values.
    act(() => {
      result.current.handleChange('email', 'test@example.com')
      result.current.handleChange('password', 'ValidPassword123!')
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event
    const fetchError = new Error('Network error')
    const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(fetchError)

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    expect(onSubmitError).toHaveBeenCalledWith(fetchError)

    fetchSpy.mockRestore()
  })
}) 