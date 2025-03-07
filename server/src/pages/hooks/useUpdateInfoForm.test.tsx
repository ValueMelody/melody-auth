import { expect, test, vi } from 'vitest'
import * as React from 'react'
import { renderHook, act } from '@testing-library/react'

// Mock hooks from hono/jsx
vi.mock('hono/jsx', () => ({
  useState: React.useState,
  useMemo: React.useMemo,
}))

// Mock getFollowUpParams to return a fake redirectUri.
vi.mock('pages/tools/param', () => ({
  getFollowUpParams: vi.fn(() => ({ redirectUri: 'test-redirect' })),
}))

import useUpdateInfoForm from 'pages/hooks/useUpdateInfoForm'
import { localeConfig, routeConfig } from 'configs'

test('returns initial state with empty names and no errors', () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useUpdateInfoForm({
      locale: 'en',
      onSubmitError,
    })
  )

  // Initial values should be empty.
  expect(result.current.values).toEqual({
    firstName: '',
    lastName: '',
  })
  // No errors are shown because the fields have not been touched.
  expect(result.current.errors).toEqual({
    firstName: undefined,
    lastName: undefined,
  })
  expect(result.current.success).toBe(false)
  // The redirectUri comes from the getFollowUpParams mock.
  expect(result.current.redirectUri).toBe('test-redirect')
})

test('handleChange updates firstName and lastName', () => {
  const onSubmitError = vi.fn()
  const { result } = renderHook(() =>
    useUpdateInfoForm({
      locale: 'en',
      onSubmitError,
    })
  )

  act(() => {
    result.current.handleChange('firstName', 'John')
    result.current.handleChange('lastName', 'Doe')
  })

  // Ensure that onSubmitError is reset to null.
  expect(onSubmitError).toHaveBeenCalledWith(null)
  expect(result.current.values).toEqual({
    firstName: 'John',
    lastName: 'Doe',
  })
  // success should be reset to false when the form is updated.
  expect(result.current.success).toBe(false)
})

test('submits data successfully when form is valid', async () => {
  const onSubmitError = vi.fn()
  // Spy on fetch to simulate a successful response.
  const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({}),
  } as Response)

  const { result } = renderHook(() =>
    useUpdateInfoForm({
      locale: 'en',
      onSubmitError,
    })
  )

  // Provide valid data.
  act(() => {
    result.current.handleChange('firstName', 'John')
    result.current.handleChange('lastName', 'Doe')
  })

  // Create a fake event with a preventDefault spy.
  const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

  await act(async () => {
    result.current.handleSubmit(fakeEvent)
    // Allow the promise chain to resolve.
    await Promise.resolve()
  })

  expect(fakeEvent.preventDefault).toHaveBeenCalled()
  // On successful submission, success should be true.
  expect(result.current.success).toBe(true)
  // No validation errors should be present.
  expect(result.current.errors).toEqual({
    firstName: undefined,
    lastName: undefined,
  })
  // Verify that fetch was called and with the proper route.
  expect(fetchSpy).toHaveBeenCalled()
  expect(fetchSpy.mock.calls[0][0]).toBe(routeConfig.IdentityRoute.UpdateInfo)

  fetchSpy.mockRestore()
})

test('blocks submission when validation errors exist', async () => {
  const onSubmitError = vi.fn()
  // Spy on fetch to ensure it is not called.
  const fetchSpy = vi.spyOn(global, 'fetch')

  const { result } = renderHook(() =>
    useUpdateInfoForm({
      locale: 'en',
      onSubmitError,
    })
  )

  // Leave firstName empty to trigger a validation error.
  act(() => {
    result.current.handleChange('lastName', 'Doe')
  })

  const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

  await act(async () => {
    result.current.handleSubmit(fakeEvent)
    await Promise.resolve()
  })

  expect(fakeEvent.preventDefault).toHaveBeenCalled()
  // Since there is a validation error, fetch should not have been called.
  expect(fetchSpy).not.toHaveBeenCalled()
  expect(result.current.success).toBe(false)
  // Verify that the error for firstName is set.
  expect(result.current.errors.firstName).toBe(
    localeConfig.validateError.firstNameIsEmpty['en']
  )
  // lastName is valid so there should be no error.
  expect(result.current.errors.lastName).toBeUndefined()

  fetchSpy.mockRestore()
})

test('calls onSubmitError when submission fails', async () => {
  const onSubmitError = vi.fn()
  const errorMessage = 'Submission failed'
  // Spy on fetch to simulate a rejected promise.
  const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error(errorMessage))

  const { result } = renderHook(() =>
    useUpdateInfoForm({
      locale: 'en',
      onSubmitError,
    })
  )

  // Provide valid input.
  act(() => {
    result.current.handleChange('firstName', 'John')
    result.current.handleChange('lastName', 'Doe')
  })

  const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

  await act(async () => {
    result.current.handleSubmit(fakeEvent)
    await Promise.resolve()
  })

  expect(fakeEvent.preventDefault).toHaveBeenCalled()
  // On a submission failure, success remains false.
  expect(result.current.success).toBe(false)
  // Verify that onSubmitError has been called with an error.
  expect(onSubmitError).toHaveBeenCalledWith(expect.any(Error))
  const calledError = onSubmitError.mock.calls[2][0]
  expect(calledError).toBeInstanceOf(Error)
  expect(calledError.message).toBe(errorMessage)

  fetchSpy.mockRestore()
})
