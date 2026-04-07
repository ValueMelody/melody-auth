import {
  expect, test, vi, beforeEach, Mock,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'
import useAcceptInvitationForm from 'pages/hooks/useAcceptInvitationForm'
import { routeConfig } from 'configs'
import { getInvitationParams } from 'pages/tools/param'

vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
    useEffect: React.useEffect,
  }),
)

vi.mock(
  'pages/tools/param',
  () => ({
    getInvitationParams: vi.fn(() => ({
      locale: 'en',
      invitationToken: '',
      signinUrl: '',
    })),
  }),
)

beforeEach(() => {
  (getInvitationParams as unknown as Mock).mockReturnValue({
    locale: 'en',
    invitationToken: '',
    signinUrl: '',
  })
})

test(
  'sets isTokenValid to false when invitationToken is empty',
  async () => {
    const { result } = renderHook(() => useAcceptInvitationForm({
      locale: 'en',
      onSubmitError: vi.fn(),
    }))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.isTokenValid).toBe(false)
    expect(result.current.values).toEqual({
      password: '',
      confirmPassword: '',
    })
    expect(result.current.success).toBe(false)
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.signinUrl).toBeNull()
  },
)

test(
  'sets isTokenValid to true when token check succeeds',
  async () => {
    (getInvitationParams as unknown as Mock).mockReturnValue({
      locale: 'en',
      invitationToken: 'valid-token',
      signinUrl: '',
    })

    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useAcceptInvitationForm({
      locale: 'en',
      onSubmitError: vi.fn(),
    }))

    await act(async () => {
      await Promise.resolve()
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      `${routeConfig.IdentityRoute.AcceptInvitation}?invitationToken=valid-token`,
      { method: 'GET' },
    )
    expect(result.current.isTokenValid).toBe(true)

    fetchSpy.mockRestore()
  },
)

test(
  'sets isTokenValid to false when token check fails',
  async () => {
    (getInvitationParams as unknown as Mock).mockReturnValue({
      locale: 'en',
      invitationToken: 'invalid-token',
      signinUrl: '',
    })

    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(new Error('Token invalid'))

    const { result } = renderHook(() => useAcceptInvitationForm({
      locale: 'en',
      onSubmitError: vi.fn(),
    }))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.isTokenValid).toBe(false)

    fetchSpy.mockRestore()
  },
)

test(
  'handleChange updates password and confirmPassword',
  () => {
    const onSubmitError = vi.fn()
    const { result } = renderHook(() => useAcceptInvitationForm({
      locale: 'en',
      onSubmitError,
    }))

    act(() => {
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
    })

    expect(onSubmitError).toHaveBeenCalledWith(null)
    expect(result.current.values).toEqual({
      password: 'Password1!',
      confirmPassword: 'Password1!',
    })
  },
)

test(
  'handleSubmit blocks submission when validation errors exist',
  async () => {
    const onSubmitError = vi.fn()
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    )

    const { result } = renderHook(() => useAcceptInvitationForm({
      locale: 'en',
      onSubmitError,
    }))

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    // fetch is only called for token validation GET, not the POST
    expect(fetchSpy).not.toHaveBeenCalledWith(
      routeConfig.IdentityRoute.AcceptInvitation,
      expect.objectContaining({ method: 'POST' }),
    )

    fetchSpy.mockRestore()
  },
)

test(
  'handleSubmit posts and sets success on valid submission',
  async () => {
    (getInvitationParams as unknown as Mock).mockReturnValue({
      locale: 'en',
      invitationToken: 'valid-token',
      signinUrl: '',
    })

    const onSubmitError = vi.fn()
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useAcceptInvitationForm({
      locale: 'en',
      onSubmitError,
    }))

    // Wait for token validation effect
    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.AcceptInvitation,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          token: 'valid-token',
          password: 'Password1!',
        }),
      }),
    )
    expect(result.current.success).toBe(true)

    fetchSpy.mockRestore()
  },
)

test(
  'handleSubmit sets signinUrl when provided in invitation params',
  async () => {
    (getInvitationParams as unknown as Mock).mockReturnValue({
      locale: 'en',
      invitationToken: 'valid-token',
      signinUrl: 'https://example.com/signin',
    })

    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useAcceptInvitationForm({
      locale: 'en',
      onSubmitError: vi.fn(),
    }))

    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(result.current.success).toBe(true)
    expect(result.current.signinUrl).toBe('https://example.com/signin')

    fetchSpy.mockRestore()
  },
)

test(
  'handleSubmit calls onSubmitError on fetch failure',
  async () => {
    (getInvitationParams as unknown as Mock).mockReturnValue({
      locale: 'en',
      invitationToken: 'valid-token',
      signinUrl: '',
    })

    const onSubmitError = vi.fn()
    const error = new Error('Network error')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(error)

    const { result } = renderHook(() => useAcceptInvitationForm({
      locale: 'en',
      onSubmitError,
    }))

    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(result.current.success).toBe(false)
    expect(onSubmitError).toHaveBeenCalledWith(error)

    fetchSpy.mockRestore()
  },
)
