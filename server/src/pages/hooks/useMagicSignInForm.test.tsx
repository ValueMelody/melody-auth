import {
  describe, expect, test, vi, afterEach,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'
import { View } from './useCurrentView'
import useMagicSignInForm from 'pages/hooks/useMagicSignInForm'
import { routeConfig } from 'configs'
import * as requestModule from 'pages/tools/request'
import * as paramModule from 'pages/tools/param'

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
    getMagicSignInParams: vi.fn(() => ({
      code: '',
      otp: '',
      locale: 'en',
      org: '',
    })),
  }),
)

const setInitialProps = (overrides: Record<string, unknown> = {}) => {
  (window as any).__initialProps = {
    enablePasswordlessSignIn: true,
    usePasswordlessAsMagicLink: true,
    ...overrides,
  }
}

describe(
  'useMagicSignInForm',
  () => {
    afterEach(() => {
      delete (window as any).__initialProps
      vi.restoreAllMocks()
    })

    test(
      'sets error to invalid when enablePasswordlessSignIn is false',
      async () => {
        setInitialProps({ enablePasswordlessSignIn: false })

        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useMagicSignInForm({
            locale: 'en',
            onSwitchView,
          }))

        await act(async () => { await Promise.resolve() })

        expect(result.current.isProcessing).toBe(false)
        expect(result.current.error).toBe('invalid')
        expect(result.current.isSuccess).toBe(false)
        expect(onSwitchView).not.toHaveBeenCalled()
      },
    )

    test(
      'sets error to invalid when usePasswordlessAsMagicLink is false',
      async () => {
        setInitialProps({ usePasswordlessAsMagicLink: false })

        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useMagicSignInForm({
            locale: 'en',
            onSwitchView,
          }))

        await act(async () => { await Promise.resolve() })

        expect(result.current.isProcessing).toBe(false)
        expect(result.current.error).toBe('invalid')
        expect(onSwitchView).not.toHaveBeenCalled()
      },
    )

    test(
      'sets error to invalid when code is missing from url params',
      async () => {
        setInitialProps()
        vi.spyOn(
          paramModule,
          'getMagicSignInParams',
        ).mockReturnValue({
          code: '',
          otp: '123456',
          locale: 'en',
          org: '',
        })

        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useMagicSignInForm({
            locale: 'en',
            onSwitchView,
          }))

        await act(async () => { await Promise.resolve() })

        expect(result.current.isProcessing).toBe(false)
        expect(result.current.error).toBe('invalid')
      },
    )

    test(
      'sets error to invalid when otp is missing from url params',
      async () => {
        setInitialProps()
        vi.spyOn(
          paramModule,
          'getMagicSignInParams',
        ).mockReturnValue({
          code: 'test-code',
          otp: '',
          locale: 'en',
          org: '',
        })

        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useMagicSignInForm({
            locale: 'en',
            onSwitchView,
          }))

        await act(async () => { await Promise.resolve() })

        expect(result.current.isProcessing).toBe(false)
        expect(result.current.error).toBe('invalid')
      },
    )

    test(
      'processes sign-in successfully and calls handleAuthorizeStep',
      async () => {
        setInitialProps()
        vi.spyOn(
          paramModule,
          'getMagicSignInParams',
        ).mockReturnValue({
          code: 'test-code',
          otp: '123456',
          locale: 'en',
          org: '',
        })

        const fakeResponse = {
          ok: true, json: async () => ({}),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResponse as Response)

        const handleAuthorizeSpy = vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation((
          _response, _locale, onSwitchViewFn,
        ) => {
          onSwitchViewFn(View.Consent)
        })

        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useMagicSignInForm({
            locale: 'en',
            onSwitchView,
          }))

        await act(async () => { await Promise.resolve() })

        expect(fetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.ProcessPasswordlessCode,
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"code":"test-code"'),
          }),
        )
        expect(fetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.ProcessPasswordlessCode,
          expect.objectContaining({ body: expect.stringContaining('"mfaCode":"123456"') }),
        )
        expect(result.current.isSuccess).toBe(true)
        expect(result.current.isProcessing).toBe(false)
        expect(result.current.error).toBeNull()
        expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

        fetchSpy.mockRestore()
        handleAuthorizeSpy.mockRestore()
      },
    )

    test(
      'passes org param when present in url',
      async () => {
        setInitialProps()
        vi.spyOn(
          paramModule,
          'getMagicSignInParams',
        ).mockReturnValue({
          code: 'test-code',
          otp: '123456',
          locale: 'en',
          org: 'my-org',
        })

        const fakeResponse = {
          ok: true, json: async () => ({}),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResponse as Response)

        vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation(() => {})

        const { result } = renderHook(() =>
          useMagicSignInForm({
            locale: 'en',
            onSwitchView: vi.fn(),
          }))

        await act(async () => { await Promise.resolve() })

        expect(fetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.ProcessPasswordlessCode,
          expect.objectContaining({ body: expect.stringContaining('"org":"my-org"') }),
        )

        fetchSpy.mockRestore()
        expect(result.current.isSuccess).toBe(true)
      },
    )

    test(
      'sets error message when fetch fails',
      async () => {
        setInitialProps()
        vi.spyOn(
          paramModule,
          'getMagicSignInParams',
        ).mockReturnValue({
          code: 'test-code',
          otp: '123456',
          locale: 'en',
          org: '',
        })

        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(new Error('Network error'))

        const onSwitchView = vi.fn()
        const { result } = renderHook(() =>
          useMagicSignInForm({
            locale: 'en',
            onSwitchView,
          }))

        await act(async () => { await Promise.resolve() })

        expect(result.current.isProcessing).toBe(false)
        expect(result.current.error).toBe('Network error')
        expect(result.current.isSuccess).toBe(false)
        expect(onSwitchView).not.toHaveBeenCalled()

        fetchSpy.mockRestore()
      },
    )
  },
)
