import {
  expect, test, vi,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import useVerifyEmailForm from 'pages/hooks/useVerifyEmailForm'
import { validateError } from 'pages/tools/locale'

vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
  }),
)

test(
  'returns logged in user',
  () => {
    const { result } = renderHook(() => useVerifyEmailForm({
      locale: 'en',
      onSubmitError: () => {},
    }))
    expect(result.current).toEqual({
      errors: { mfaCode: '' },
      values: { mfaCode: [] },
      handleChange: expect.any(Function),
      handleSubmit: expect.any(Function),
      success: false,
      isSubmitting: false,
    })
  },
)

test(
  'could handle change',
  () => {
    const onSubmitError = vi.fn()
    const { result } = renderHook(() => useVerifyEmailForm({
      locale: 'en',
      onSubmitError,
    }))

    act(() => {
      result.current.handleChange(
        'mfaCode',
        ['1', '2', '3', '4', '5', '6'],
      )
    })

    // Verify that onSubmitError is triggered with null
    expect(onSubmitError).toHaveBeenCalledWith(null)
    expect(result.current.values.mfaCode).toEqual(['1', '2', '3', '4', '5', '6'])
  },
)

test(
  'submits data successfully',
  async () => {
    const onSubmitError = vi.fn()
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useVerifyEmailForm({
      locale: 'en',
      onSubmitError,
    }))

    act(() => {
      result.current.handleChange(
        'mfaCode',
        ['1', '2', '3', '4', '5', '6'],
      )
    })

    // Create a fake event with a preventDefault spy.
    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      // Wait for the promise chain to resolve.
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    expect(result.current).toStrictEqual({
      success: true,
      errors: { mfaCode: undefined },
      values: { mfaCode: ['1', '2', '3', '4', '5', '6'] },
      handleChange: expect.any(Function),
      handleSubmit: expect.any(Function),
      isSubmitting: false,
    })
    expect(fetchSpy).toHaveBeenCalled()

    fetchSpy.mockRestore()
  },
)

test(
  'fails submission and calls onSubmitError',
  async () => {
    const onSubmitError = vi.fn()
    const errorMessage = 'Test error'
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useVerifyEmailForm({
      locale: 'en',
      onSubmitError,
    }))

    act(() => {
      result.current.handleChange(
        'mfaCode',
        ['1', '2', '3', '4', '5', '6'],
      )
    })

    // Create a fake event with a preventDefault spy.
    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      // Wait for the promise chain to resolve.
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    expect(result.current).toStrictEqual({
      success: false,
      errors: { mfaCode: undefined },
      values: { mfaCode: ['1', '2', '3', '4', '5', '6'] },
      handleChange: expect.any(Function),
      handleSubmit: expect.any(Function),
      isSubmitting: false,
    })

    expect(onSubmitError).toHaveBeenCalledTimes(2)
    const calledError = onSubmitError.mock.calls[1][0]
    expect(calledError).toBeInstanceOf(Error)
    expect(calledError.message).toBe(errorMessage)

    fetchSpy.mockRestore()
  },
)

test(
  'blocks submit when form validation errors exist',
  async () => {
    const onSubmitError = vi.fn()
    // Spy on fetch so we can confirm that it is not called when validation fails.
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    )

    const { result } = renderHook(() => useVerifyEmailForm({
      locale: 'en',
      onSubmitError,
    }))

    act(() => {
    // Provide an invalid MFA code: fewer than 6 digits.
      result.current.handleChange(
        'mfaCode',
        ['1', '2', '3'],
      )
    })

    // Create a fake event with a preventDefault spy.
    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      // Wait for any pending promise(s) to resolve.
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    // Since the form validation fails, fetch should not have been invoked.
    expect(fetchSpy).not.toHaveBeenCalled()

    // The hook's state should reflect the validation error:
    // - success remains false.
    // - errors.mfaCode should be a non-empty error message.
    expect(result.current).toStrictEqual({
      success: false,
      errors: { mfaCode: validateError.verificationCodeLengthIssue.en },
      values: { mfaCode: ['1', '2', '3'] },
      handleChange: expect.any(Function),
      handleSubmit: expect.any(Function),
      isSubmitting: false,
    })

    fetchSpy.mockRestore()
  },
)
