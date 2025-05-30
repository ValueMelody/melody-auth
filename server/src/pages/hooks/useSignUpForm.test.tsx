import {
  expect, test, vi, describe,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'

import { InitialProps } from './useInitialProps'
import { View } from './useCurrentView'
import useSignUpForm from 'pages/hooks/useSignUpForm'
import { routeConfig } from 'configs'
import * as requestModule from 'pages/tools/request'
import { AuthorizeParams } from 'pages/tools/param'
import { validateError } from 'pages/tools/locale'

// Mock hooks from hono/jsx.
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
  }),
) // used for handleAuthorizeStep

// Dummy parameters to pass to the hook.
const dummyInitialProps = {
  namesIsRequired: true,
  enableNames: true,
} as InitialProps
const dummyParams = {} as AuthorizeParams // dummy value for params

test(
  'returns initial state correctly',
  () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()

    const { result } = renderHook(() =>
      useSignUpForm({
        locale: 'en',
        initialProps: dummyInitialProps,
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      }))

    expect(result.current.values).toEqual({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    })

    // Since no fields have been touched, errors should be undefined.
    expect(result.current.errors).toEqual({
      email: undefined,
      password: undefined,
      confirmPassword: undefined,
      firstName: undefined,
      lastName: undefined,
    })
  },
)

test(
  'handleChange updates fields and resets onSubmitError',
  () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const { result } = renderHook(() =>
      useSignUpForm({
        locale: 'en',
        initialProps: dummyInitialProps,
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      }))

    act(() => {
      result.current.handleChange(
        'email',
        'test@example.com',
      )
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
      result.current.handleChange(
        'firstName',
        'John',
      )
      result.current.handleChange(
        'lastName',
        'Doe',
      )
    })

    // onSubmitError is called with null after each change.
    expect(onSubmitError).toHaveBeenCalledTimes(5)
    expect(onSubmitError).toHaveBeenLastCalledWith(null)
    expect(result.current.values).toEqual({
      email: 'test@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      firstName: 'John',
      lastName: 'Doe',
    })
  },
)

test(
  'handleSubmit blocks submission when validation errors exist',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    )

    // For this test, leave the required names empty by not calling handleChange for them.
    // Provide valid email, password, and confirmPassword.
    const { result } = renderHook(() =>
      useSignUpForm({
        locale: 'en',
        initialProps: dummyInitialProps,
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      }))

    act(() => {
      result.current.handleChange(
        'email',
        'test@example.com',
      )
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
    // Leaving firstName and lastName as empty strings (triggering validation errors)
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
    // Check that errors for firstName and lastName are set as expected.
    expect(result.current.errors.firstName).toEqual(validateError.firstNameIsEmpty.en)
    expect(result.current.errors.lastName).toEqual(validateError.lastNameIsEmpty.en)

    fetchSpy.mockRestore()
  },
)

test(
  'handleSubmit submits form successfully when valid input is provided',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()

    // Spy on handleAuthorizeStep to simulate a successful flow.
    const handleAuthorizeSpy = vi.spyOn(
      requestModule,
      'handleAuthorizeStep',
    ).mockImplementation((
      response, locale, onSwitchView,
    ) => {
      onSwitchView(View.Consent)
    })
    const fakeResponse = {
      ok: true, json: async () => ({ status: 'ok' }),
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    const { result } = renderHook(() =>
      useSignUpForm({
        locale: 'en',
        initialProps: dummyInitialProps,
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      }))

    // Provide valid input for all fields.
    act(() => {
      result.current.handleChange(
        'email',
        'test@example.com',
      )
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
      result.current.handleChange(
        'firstName',
        'John',
      )
      result.current.handleChange(
        'lastName',
        'Doe',
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    // Check that fetch was called with the expected endpoint and options.
    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.AuthorizeAccount,
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        // Verify that the request body contains the valid fields.
        body: expect.stringContaining('"email":"test@example.com"'),
      }),
    )
    expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

    fetchSpy.mockRestore()
    handleAuthorizeSpy.mockRestore()
  },
)

test(
  'handleSubmit calls onSubmitError on fetch failure',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()
    const fakeError = new Error('Network error')
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockRejectedValue(fakeError)

    const { result } = renderHook(() =>
      useSignUpForm({
        locale: 'en',
        initialProps: dummyInitialProps,
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      }))

    // Provide valid inputs for all fields.
    act(() => {
      result.current.handleChange(
        'email',
        'test@example.com',
      )
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
      result.current.handleChange(
        'firstName',
        'John',
      )
      result.current.handleChange(
        'lastName',
        'Doe',
      )
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    expect(onSubmitError).toHaveBeenCalledWith(fakeError)

    fetchSpy.mockRestore()
  },
)

test(
  'allows submission without names when namesIsRequired is false',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()

    // Create initialProps with namesIsRequired set to false
    const initialProps = {
      ...dummyInitialProps,
      namesIsRequired: false,
      enableNames: true, // Keep names enabled but not required
    } as InitialProps

    // Mock successful response
    const fakeResponse = {
      ok: true,
      json: async () => ({ status: 'ok' }),
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    // Spy on handleAuthorizeStep
    const handleAuthorizeSpy = vi.spyOn(
      requestModule,
      'handleAuthorizeStep',
    ).mockImplementation((
      response, locale, onSwitchView,
    ) => {
      onSwitchView(View.Consent)
    })

    const { result } = renderHook(() =>
      useSignUpForm({
        locale: 'en',
        initialProps,
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      }))

    // Only provide email and password, skip names
    act(() => {
      result.current.handleChange(
        'email',
        'test@example.com',
      )
      result.current.handleChange(
        'password',
        'Password1!',
      )
      result.current.handleChange(
        'confirmPassword',
        'Password1!',
      )
      // Deliberately leave firstName and lastName empty
    })

    const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

    await act(async () => {
      result.current.handleSubmit(fakeEvent)
      await Promise.resolve()
    })

    // Verify form submission was allowed
    expect(fakeEvent.preventDefault).toHaveBeenCalled()
    expect(fetchSpy).toHaveBeenCalledWith(
      routeConfig.IdentityRoute.AuthorizeAccount,
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"email":"test@example.com"'),
      }),
    )

    // Verify no validation errors for firstName and lastName
    expect(result.current.errors.firstName).toBeUndefined()
    expect(result.current.errors.lastName).toBeUndefined()

    // Verify the view was switched
    expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

    // Cleanup
    fetchSpy.mockRestore()
    handleAuthorizeSpy.mockRestore()
  },
)

test(
  'excludes names from submission when enableNames is false',
  async () => {
    const onSubmitError = vi.fn()
    const onSwitchView = vi.fn()

    // Create initialProps with both name options false
    const initialProps = {
      ...dummyInitialProps,
      namesIsRequired: false,
      enableNames: false, // Names feature completely disabled
    } as InitialProps

    // Mock successful response
    const fakeResponse = {
      ok: true,
      json: async () => ({ status: 'ok' }),
    }
    const fetchSpy = vi.spyOn(
      global,
      'fetch',
    ).mockResolvedValue(fakeResponse as Response)

    // Spy on handleAuthorizeStep
    const handleAuthorizeSpy = vi.spyOn(
      requestModule,
      'handleAuthorizeStep',
    ).mockImplementation((
      response,
      locale,
      onSwitchViewFn,
    ) => {
      onSwitchViewFn(View.Consent)
    })

    const { result } = renderHook(() =>
      useSignUpForm({
        locale: 'en',
        initialProps,
        params: dummyParams,
        onSubmitError,
        onSwitchView,
      }))

    // Only provide required fields
    act(() => {
      result.current.handleChange(
        'email',
        'test@example.com',
      )
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

    // Verify form submission was made
    expect(fakeEvent.preventDefault).toHaveBeenCalled()

    // Get the actual request body from the fetch call
    const fetchCall = fetchSpy.mock.calls[0]
    const requestBody = JSON.parse((fetchCall[1] as RequestInit).body as string)

    // Verify that firstName and lastName are not included in the request
    expect(requestBody).not.toHaveProperty('firstName')
    expect(requestBody).not.toHaveProperty('lastName')

    // Verify the essential fields are present
    expect(requestBody).toHaveProperty(
      'email',
      'test@example.com',
    )
    expect(requestBody).toHaveProperty(
      'password',
      'Password1!',
    )

    // Verify no validation errors for firstName and lastName
    expect(result.current.errors.firstName).toBeUndefined()
    expect(result.current.errors.lastName).toBeUndefined()

    // Verify the view was switched
    expect(onSwitchView).toHaveBeenCalledWith(View.Consent)

    // Cleanup
    fetchSpy.mockRestore()
    handleAuthorizeSpy.mockRestore()
  },
)

describe(
  'custom user attributes',
  () => {
    const createMockUserAttribute = (
      id: number,
      name: string,
      requiredInSignUpForm: boolean = false,
      locale: string = 'en',
      value: string = '',
    ): any => ({
      id,
      name,
      requiredInSignUpForm,
      includeInSignUpForm: true,
      includeInIdTokenBody: false,
      includeInUserInfo: false,
      locales: [
        {
          locale,
          value: value || name.charAt(0).toUpperCase() + name.slice(1),
        },
      ],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      deletedAt: null,
    })

    test(
      'handleChange updates custom attribute values correctly',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        const mockUserAttributes = [
          createMockUserAttribute(
            1,
            'department',
            true,
            'en',
            'Department',
          ),
          createMockUserAttribute(
            2,
            'phone',
            false,
            'en',
            'Phone Number',
          ),
        ]

        const fakeResponse = {
          ok: true,
          json: async () => ({ userAttributes: mockUserAttributes }),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResponse as Response)

        const { result } = renderHook(() =>
          useSignUpForm({
            locale: 'en',
            initialProps: {
              ...dummyInitialProps,
              enableUserAttribute: true,
            },
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        // Fetch user attributes
        await act(async () => {
          result.current.getSignUpInfo()
          await Promise.resolve()
        })

        // Update custom attribute values
        act(() => {
          result.current.handleChange(
            1,
            'Engineering',
          )
          result.current.handleChange(
            2,
            '123-456-7890',
          )
        })

        // Verify onSubmitError is called to reset errors
        expect(onSubmitError).toHaveBeenCalledWith(null)

        // Verify the values object includes custom attributes
        expect(result.current.values).toEqual(expect.objectContaining({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          1: 'Engineering',
          2: '123-456-7890',
        }))

        // Cleanup
        fetchSpy.mockRestore()
      },
    )

    test(
      'validates required custom attributes',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        const mockUserAttributes = [
          createMockUserAttribute(
            3,
            'company',
            true,
            'en',
            'Company',
          ),
        ]

        const fakeResponse = {
          ok: true,
          json: async () => ({ userAttributes: mockUserAttributes }),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResponse as Response)

        const { result } = renderHook(() =>
          useSignUpForm({
            locale: 'en',
            initialProps: {
              ...dummyInitialProps,
              enableUserAttribute: true,
            },
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        // Fetch user attributes
        await act(async () => {
          result.current.getSignUpInfo()
          await Promise.resolve()
        })

        // Fill in standard required fields but leave custom attribute empty
        act(() => {
          result.current.handleChange(
            'email',
            'test@example.com',
          )
          result.current.handleChange(
            'password',
            'Password1!',
          )
          result.current.handleChange(
            'confirmPassword',
            'Password1!',
          )
          result.current.handleChange(
            'firstName',
            'John',
          )
          result.current.handleChange(
            'lastName',
            'Doe',
          )
          // Don't set the required custom attribute (id: 3)
        })

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

        act(() => {
          result.current.handleSubmit(fakeEvent)
        })

        // Should have validation error for the required custom attribute
        expect(result.current.errors['3']).toBeDefined()
        expect(result.current.errors['3']).toContain('required')

        // Cleanup
        fetchSpy.mockRestore()
      },
    )

    test(
      'submits custom attributes in form payload',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        const mockUserAttributes = [
          createMockUserAttribute(
            4,
            'department',
            true,
            'en',
            'Department',
          ),
          createMockUserAttribute(
            5,
            'phone',
            false,
            'en',
            'Phone Number',
          ),
        ]

        // Mock getSignUpInfo response
        const getSignUpInfoResponse = {
          ok: true,
          json: async () => ({ userAttributes: mockUserAttributes }),
        }

        // Mock form submission response
        const submitResponse = {
          ok: true,
          json: async () => ({ status: 'ok' }),
        }

        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        )
          .mockResolvedValueOnce(getSignUpInfoResponse as Response) // First call for getSignUpInfo
          .mockResolvedValueOnce(submitResponse as Response) // Second call for form submission

        // Spy on handleAuthorizeStep
        const handleAuthorizeSpy = vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation((
          response,
          locale,
          onSwitchViewFn,
        ) => {
          onSwitchViewFn(View.Consent)
        })

        const { result } = renderHook(() =>
          useSignUpForm({
            locale: 'en',
            initialProps: {
              ...dummyInitialProps,
              enableUserAttribute: true,
            },
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        // Fetch user attributes first
        await act(async () => {
          result.current.getSignUpInfo()
          await Promise.resolve()
        })

        // Fill in all fields including custom attributes
        act(() => {
          result.current.handleChange(
            'email',
            'test@example.com',
          )
          result.current.handleChange(
            'password',
            'Password1!',
          )
          result.current.handleChange(
            'confirmPassword',
            'Password1!',
          )
          result.current.handleChange(
            'firstName',
            'John',
          )
          result.current.handleChange(
            'lastName',
            'Doe',
          )
          result.current.handleChange(
            4,
            'Engineering',
          )
          result.current.handleChange(
            5,
            '123-456-7890',
          )
        })

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

        await act(async () => {
          result.current.handleSubmit(fakeEvent)
          await Promise.resolve()
        })

        // Verify form submission was made (should be the second fetch call)
        expect(fetchSpy).toHaveBeenCalledTimes(2)
        expect(fetchSpy).toHaveBeenNthCalledWith(
          2,
          routeConfig.IdentityRoute.AuthorizeAccount,
          expect.objectContaining({
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }),
        )

        // Get the actual request body and verify custom attributes are included
        const submitCall = fetchSpy.mock.calls[1]
        const requestBody = JSON.parse((submitCall[1] as RequestInit).body as string)

        expect(requestBody).toHaveProperty('attributes')
        expect(requestBody.attributes).toEqual({
          4: 'Engineering',
          5: '123-456-7890',
        })

        // Verify other standard fields are present
        expect(requestBody).toHaveProperty(
          'email',
          'test@example.com',
        )
        expect(requestBody).toHaveProperty(
          'firstName',
          'John',
        )
        expect(requestBody).toHaveProperty(
          'lastName',
          'Doe',
        )

        // Cleanup
        fetchSpy.mockRestore()
        handleAuthorizeSpy.mockRestore()
      },
    )

    test(
      'does not include attributes in submission when no custom attributes exist',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        // Mock successful response
        const fakeResponse = {
          ok: true,
          json: async () => ({ status: 'ok' }),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResponse as Response)

        // Spy on handleAuthorizeStep
        const handleAuthorizeSpy = vi.spyOn(
          requestModule,
          'handleAuthorizeStep',
        ).mockImplementation((
          response,
          locale,
          onSwitchViewFn,
        ) => {
          onSwitchViewFn(View.Consent)
        })

        const { result } = renderHook(() =>
          useSignUpForm({
            locale: 'en',
            initialProps: dummyInitialProps,
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        // Fill in standard fields only (no custom attributes)
        act(() => {
          result.current.handleChange(
            'email',
            'test@example.com',
          )
          result.current.handleChange(
            'password',
            'Password1!',
          )
          result.current.handleChange(
            'confirmPassword',
            'Password1!',
          )
          result.current.handleChange(
            'firstName',
            'John',
          )
          result.current.handleChange(
            'lastName',
            'Doe',
          )
        })

        const fakeEvent = { preventDefault: vi.fn() } as unknown as Event

        await act(async () => {
          result.current.handleSubmit(fakeEvent)
          await Promise.resolve()
        })

        // Get the actual request body and verify attributes are not included
        const fetchCall = fetchSpy.mock.calls[0]
        const requestBody = JSON.parse((fetchCall[1] as RequestInit).body as string)

        expect(requestBody).not.toHaveProperty('attributes')

        // Verify standard fields are present
        expect(requestBody).toHaveProperty(
          'email',
          'test@example.com',
        )
        expect(requestBody).toHaveProperty(
          'firstName',
          'John',
        )
        expect(requestBody).toHaveProperty(
          'lastName',
          'Doe',
        )

        // Cleanup
        fetchSpy.mockRestore()
        handleAuthorizeSpy.mockRestore()
      },
    )

    test(
      'getSignUpInfo fetches and sets user attributes',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()

        const mockUserAttributes = [
          createMockUserAttribute(
            6,
            'position',
            true,
            'en',
            'Position',
          ),
          createMockUserAttribute(
            7,
            'manager',
            false,
            'en',
            'Manager',
          ),
        ]

        const fakeResponse = {
          ok: true,
          json: async () => ({ userAttributes: mockUserAttributes }),
        }
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockResolvedValue(fakeResponse as Response)

        const { result } = renderHook(() =>
          useSignUpForm({
            locale: 'en',
            initialProps: {
              ...dummyInitialProps,
              enableUserAttribute: true,
            },
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        await act(async () => {
          result.current.getSignUpInfo()
          await Promise.resolve()
        })

        // Verify fetch was called
        expect(fetchSpy).toHaveBeenCalledWith(
          routeConfig.IdentityRoute.AuthorizeAccount,
          expect.objectContaining({
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }),
        )

        // Verify userAttributes were set
        expect(result.current.userAttributes).toEqual(mockUserAttributes)

        // Cleanup
        fetchSpy.mockRestore()
      },
    )

    test(
      'getSignUpInfo calls onSubmitError on fetch failure',
      async () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const fakeError = new Error('Network error')
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        ).mockRejectedValue(fakeError)

        const { result } = renderHook(() =>
          useSignUpForm({
            locale: 'en',
            initialProps: {
              ...dummyInitialProps,
              enableUserAttribute: true,
            },
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        await act(async () => {
          result.current.getSignUpInfo()
          await Promise.resolve()
        })

        expect(onSubmitError).toHaveBeenCalledWith(fakeError)

        // Cleanup
        fetchSpy.mockRestore()
      },
    )

    test(
      'getSignUpInfo does not fetch when enableUserAttribute is false',
      () => {
        const onSubmitError = vi.fn()
        const onSwitchView = vi.fn()
        const fetchSpy = vi.spyOn(
          global,
          'fetch',
        )

        const { result } = renderHook(() =>
          useSignUpForm({
            locale: 'en',
            initialProps: {
              ...dummyInitialProps,
              enableUserAttribute: false,
            },
            params: dummyParams,
            onSubmitError,
            onSwitchView,
          }))

        act(() => {
          result.current.getSignUpInfo()
        })

        // Verify fetch was not called
        expect(fetchSpy).not.toHaveBeenCalled()

        // Cleanup
        fetchSpy.mockRestore()
      },
    )
  },
)
