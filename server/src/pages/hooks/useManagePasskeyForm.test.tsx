import {
  describe, expect, test, vi, afterEach,
  Mock,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import useManagePasskeyForm from 'pages/hooks/useManagePasskeyForm'
import { enroll } from 'pages/tools/passkey'
import { managePasskey } from 'pages/tools/locale'

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

// Mock the enroll function from pages/tools/passkey.
vi.mock(
  'pages/tools/passkey',
  () => ({ enroll: vi.fn() }),
)

describe(
  'useManagePasskeyForm hook',
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
          useManagePasskeyForm({
            locale, onSubmitError,
          }))

        expect(result.current.successMessage).toBeNull()
        expect(result.current.passkey).toBeNull()
        expect(result.current.enrollOptions).toBeNull()
        expect(result.current.redirectUri).toBe('http://redirect.test')
      },
    )

    test(
      'getManagePasskeyInfo updates passkey and enrollOptions on successful fetch',
      async () => {
        const fakeResponseData = {
          passkey: { id: 'passkey-1' },
          enrollOptions: { option: 'value' },
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
          useManagePasskeyForm({
            locale, onSubmitError,
          }))

        act(() => {
          result.current.getManagePasskeyInfo()
        })

        // Wait for the promise chain to resolve.
        await act(async () => {
          await Promise.resolve()
        })

        expect(fetchSpy).toHaveBeenCalledWith(
          '/identity/v1/manage-passkey?code=test-code&locale=en&org=test-org',
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          },
        )
        expect(result.current.passkey).toEqual(fakeResponseData.passkey)
        expect(result.current.enrollOptions).toEqual(fakeResponseData.enrollOptions)

        fetchSpy.mockRestore()
      },
    )

    test(
      'getManagePasskeyInfo calls onSubmitError on fetch failure',
      async () => {
        const error = new Error('Fetch failed')
        const fetchSpy = vi
          .spyOn(
            global,
            'fetch',
          )
          .mockRejectedValue(error)

        const { result } = renderHook(() =>
          useManagePasskeyForm({
            locale, onSubmitError,
          }))

        act(() => {
          result.current.getManagePasskeyInfo()
        })

        await act(async () => {
          await Promise.resolve()
        })

        expect(onSubmitError).toHaveBeenCalledWith(error)
        fetchSpy.mockRestore()
      },
    )

    test(
      'handleRemove updates successMessage and resets passkey on successful DELETE',
      async () => {
        const fakeResponse = {
          ok: true,
          json: async () => ({}),
        }
        const fetchSpy = vi
          .spyOn(
            global,
            'fetch',
          )
          .mockResolvedValue(fakeResponse as Response)

        const { result } = renderHook(() =>
          useManagePasskeyForm({
            locale, onSubmitError,
          }))

        act(() => {
          result.current.handleRemove()
        })

        await act(async () => {
          await Promise.resolve()
        })

        expect(fetchSpy).toHaveBeenCalledWith(
          '/identity/v1/manage-passkey',
          {
            method: 'DELETE',
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
        expect(result.current.successMessage).toBe(managePasskey.removeSuccess[locale])
        expect(result.current.passkey).toBeNull()

        fetchSpy.mockRestore()
      },
    )

    test(
      'handleRemove calls onSubmitError on DELETE failure',
      async () => {
        const error = new Error('Delete failed')
        const fetchSpy = vi
          .spyOn(
            global,
            'fetch',
          )
          .mockRejectedValue(error)

        const { result } = renderHook(() =>
          useManagePasskeyForm({
            locale, onSubmitError,
          }))

        act(() => {
          result.current.handleRemove()
        })

        await act(async () => {
          await Promise.resolve()
        })

        expect(onSubmitError).toHaveBeenCalledWith(error)
        fetchSpy.mockRestore()
      },
    )

    test(
      'handleEnroll does nothing if enrollOptions is null',
      () => {
        const { result } = renderHook(() =>
          useManagePasskeyForm({
            locale, onSubmitError,
          }))

        act(() => {
          result.current.handleEnroll()
        })

        // When enrollOptions is null, enroll should not be called.
        expect(enroll).not.toHaveBeenCalled()
      },
    )

    test(
      'handleEnroll calls enroll and submitEnroll on successful enrollment',
      async () => {
        // First, simulate setting enrollOptions via getManagePasskeyInfo.
        const fakeManageResponse = {
          passkey: { id: 'passkey-old' },
          enrollOptions: { option: 'enroll-option' },
        }
        const fetchSpyGet = vi
          .spyOn(
            global,
            'fetch',
          )
          .mockResolvedValueOnce({
            ok: true,
            json: async () => fakeManageResponse,
          } as Response)

        const { result } = renderHook(() =>
          useManagePasskeyForm({
            locale, onSubmitError,
          }))
        act(() => {
          result.current.getManagePasskeyInfo()
        })
        await act(async () => {
          await Promise.resolve()
        })
        expect(result.current.enrollOptions).toEqual(fakeManageResponse.enrollOptions)
        fetchSpyGet.mockRestore()

        // Now, simulate enroll returning a fake credential.
        const fakeEnrollInfo = { id: 'credential-123' } as Credential
    ;(enroll as Mock).mockResolvedValueOnce(fakeEnrollInfo)

        // Simulate a successful POST in submitEnroll.
        const fakePostResponse = {
          ok: true,
          json: async () => ({ passkey: { id: 'new-passkey' } }),
        }
        const fetchSpyPost = vi
          .spyOn(
            global,
            'fetch',
          )
          .mockResolvedValueOnce(fakePostResponse as Response)

        act(() => {
          result.current.handleEnroll()
        })
        await act(async () => {
          await Promise.resolve()
        })

        expect(enroll).toHaveBeenCalledWith(fakeManageResponse.enrollOptions)
        expect(fetchSpyPost).toHaveBeenCalledWith(
          '/identity/v1/manage-passkey',
          expect.objectContaining({
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: expect.stringContaining('"enrollInfo"'),
          }),
        )
        expect(result.current.passkey).toEqual({ id: 'new-passkey' })
        expect(result.current.successMessage).toBe(managePasskey.enrollSuccess[locale])

        fetchSpyPost.mockRestore()
      },
    )
  },
)
