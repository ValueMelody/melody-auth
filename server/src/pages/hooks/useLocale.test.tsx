import {
  expect, test, vi, describe,
} from 'vitest'
import * as React from 'react'
import {
  renderHook, act,
} from '@testing-library/react'
import useLocale from 'pages/hooks/useLocale'

// Mock hooks from hono/jsx
vi.mock(
  'hono/jsx',
  () => ({
    useCallback: React.useCallback,
    useState: React.useState,
  }),
)

describe(
  'useLocale hook',
  () => {
    test(
      'should initialize with the provided locale',
      () => {
        const { result } = renderHook(() => useLocale({ initialLocale: 'en' }))
        expect(result.current.locale).toBe('en')
      },
    )

    test(
      'should update the locale and modify the URL when handleSwitchLocale is called',
      () => {
        // Spy on history.pushState to verify URL changes.
        const pushStateSpy = vi.spyOn(
          window.history,
          'pushState',
        )

        const { result } = renderHook(() => useLocale({ initialLocale: 'en' }))

        act(() => {
          result.current.handleSwitchLocale('fr')
        })

        // Assert the state value is updated.
        expect(result.current.locale).toBe('fr')
        // Verify pushState was called.
        expect(pushStateSpy).toHaveBeenCalledTimes(1)

        // Check that the URL has been updated with the new locale.
        const newUrl = pushStateSpy.mock.calls[0][2]
        const newURLObj = newUrl instanceof URL ? newUrl : new URL(newUrl ?? '')
        expect(newURLObj.searchParams.get('locale')).toBe('fr')

        pushStateSpy.mockRestore()
      },
    )
  },
)
