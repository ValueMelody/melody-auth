import {
  describe, expect, test, vi, afterEach,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import useManageRecoveryCodeForm from 'pages/hooks/useManageRecoveryCodeForm'
import { manageRecoveryCode } from 'pages/tools/locale'

// Mock hooks from hono/jsx.
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
  }),
)

// Mock follow-up params.
vi.mock(
  'pages/tools/param',
  () => ({
    getFollowUpParams: () => ({
      code: 'test-code',
      org: 'test-org',
      redirectUri: 'http://redirect.test',
    }),
  }),
)

describe(
  'useManageRecoveryCodeForm hook',
  () => {
    const locale = 'en'
    const onSubmitError = vi.fn()

    afterEach(() => {
      vi.resetAllMocks()
    })

    test(
      'should return initial state correctly',
      () => {
        const { result } = renderHook(() =>
          useManageRecoveryCodeForm({
            locale, onSubmitError,
          }))

        expect(result.current.successMessage).toBeNull()
        expect(result.current.recoveryCode).toBeNull()
        expect(result.current.redirectUri).toBe('http://redirect.test')
        expect(result.current.isGenerating).toBe(false)
        expect(typeof result.current.handleRegenerate).toBe('function')
      },
    )

    test(
      'handleRegenerate updates recoveryCode and successMessage on successful POST',
      async () => {
        const fakeResponseData = {
          recoveryCode: 'ABC123-DEF456-GHI789',
        }
        const fakeResponse = {
          ok: true,
          json: async () => fakeResponseData,
        }
        const fetchSpy = vi
          .spyOn(
            global,
            'fetch',
          )
          .mockResolvedValue(fakeResponse as Response)

        const { result } = renderHook(() =>
          useManageRecoveryCodeForm({
            locale, onSubmitError,
          }))

        act(() => {
          result.current.handleRegenerate()
        })

        // Check that isGenerating is set to true during the request
        expect(result.current.isGenerating).toBe(true)

        // Wait for the promise chain to resolve.
        await act(async () => {
          await Promise.resolve()
        })

        expect(fetchSpy).toHaveBeenCalledWith(
          '/identity/v1/manage-recovery-code',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: 'test-code',
              locale: 'en',
              org: 'test-org',
            }),
          },
        )
        expect(result.current.recoveryCode).toBe(fakeResponseData.recoveryCode)
        expect(result.current.successMessage).toBe(manageRecoveryCode.success[locale])
        expect(result.current.isGenerating).toBe(false)

        fetchSpy.mockRestore()
      },
    )

    test(
      'handleRegenerate calls onSubmitError on fetch failure',
      async () => {
        const error = new Error('Fetch failed')
        const fetchSpy = vi
          .spyOn(
            global,
            'fetch',
          )
          .mockRejectedValue(error)

        const { result } = renderHook(() =>
          useManageRecoveryCodeForm({
            locale, onSubmitError,
          }))

        act(() => {
          result.current.handleRegenerate()
        })

        // Check that isGenerating is set to true during the request
        expect(result.current.isGenerating).toBe(true)

        await act(async () => {
          await Promise.resolve()
        })

        expect(onSubmitError).toHaveBeenCalledWith(error)
        expect(result.current.recoveryCode).toBeNull()
        expect(result.current.successMessage).toBeNull()
        expect(result.current.isGenerating).toBe(false)

        fetchSpy.mockRestore()
      },
    )

    test(
      'handleRegenerate sets isGenerating to false even on error',
      async () => {
        const error = new Error('Network error')
        const fetchSpy = vi
          .spyOn(
            global,
            'fetch',
          )
          .mockRejectedValue(error)

        const { result } = renderHook(() =>
          useManageRecoveryCodeForm({
            locale, onSubmitError,
          }))

        expect(result.current.isGenerating).toBe(false)

        act(() => {
          result.current.handleRegenerate()
        })

        expect(result.current.isGenerating).toBe(true)

        await act(async () => {
          await Promise.resolve()
        })

        expect(result.current.isGenerating).toBe(false)

        fetchSpy.mockRestore()
      },
    )

    test(
      'handleRegenerate with different locale uses correct locale value',
      async () => {
        const testLocale = 'es'
        const fakeResponseData = {
          recoveryCode: 'XYZ789-UVW456-RST123',
        }
        const fakeResponse = {
          ok: true,
          json: async () => fakeResponseData,
        }
        const fetchSpy = vi
          .spyOn(
            global,
            'fetch',
          )
          .mockResolvedValue(fakeResponse as Response)

        const { result } = renderHook(() =>
          useManageRecoveryCodeForm({
            locale: testLocale, onSubmitError,
          }))

        act(() => {
          result.current.handleRegenerate()
        })

        await act(async () => {
          await Promise.resolve()
        })

        expect(fetchSpy).toHaveBeenCalledWith(
          '/identity/v1/manage-recovery-code',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: 'test-code',
              locale: testLocale,
              org: 'test-org',
            }),
          },
        )
        expect(result.current.successMessage).toBe(manageRecoveryCode.success[testLocale])

        fetchSpy.mockRestore()
      },
    )
  },
) 