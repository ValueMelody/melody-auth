import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest'
import { StorageKey } from 'shared'
import type { ProviderConfig } from 'shared'
import { postLogout } from '../requests'
import { logout } from './logout'

// Mock the requests module
vi.mock(
  '../requests',
  () => ({ postLogout: vi.fn() }),
)

describe(
  'logout',
  () => {
  // Mock console.error to avoid noise in test output
    const originalConsoleError = console.error
    const mockConsoleError = vi.fn()

    const mockProviderConfig: ProviderConfig = {
      serverUri: 'https://test.server',
      clientId: 'test-client-id',
      redirectUri: 'https://test.redirect',
      scopes: [],
      storage: 'localStorage',
    }

    const mockWindow = {
      location: { href: '' },
      localStorage: {
        removeItem: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
      sessionStorage: {
        removeItem: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
    }

    beforeEach(() => {
    // Setup window mock
    // @ts-expect-error - Partial window mock
      global.window = mockWindow
      console.error = mockConsoleError
    })

    afterEach(() => {
      vi.clearAllMocks()
      console.error = originalConsoleError
    })

    it(
      'should perform remote logout when tokens are provided',
      async () => {
        const mockLogoutUri = 'https://custom.logout'
        vi.mocked(postLogout).mockResolvedValueOnce(mockLogoutUri)

        await logout(
          mockProviderConfig,
          'test-access-token',
          'test-refresh-token',
          'https://default.redirect',
          false,
        )

        // Verify remote logout was called
        expect(postLogout).toHaveBeenCalledWith(
          mockProviderConfig,
          {
            accessToken: 'test-access-token',
            refreshToken: 'test-refresh-token',
            postLogoutRedirectUri: 'https://default.redirect',
          },
        )

        // Verify storage items were removed
        expect(mockWindow.localStorage.removeItem).toHaveBeenCalledWith(StorageKey.RefreshToken)
        expect(mockWindow.localStorage.removeItem).toHaveBeenCalledWith(StorageKey.Account)

        // Verify redirect
        expect(mockWindow.location.href).toBe(mockLogoutUri)
      },
    )

    it(
      'should use session storage when configured',
      async () => {
        const sessionStorageConfig = {
          ...mockProviderConfig, storage: 'sessionStorage' as const,
        }

        await logout(
          sessionStorageConfig,
          'test-access-token',
          'test-refresh-token',
          'https://default.redirect',
          false,
        )

        // Verify session storage was used
        expect(mockWindow.sessionStorage.removeItem).toHaveBeenCalledWith(StorageKey.RefreshToken)
        expect(mockWindow.sessionStorage.removeItem).toHaveBeenCalledWith(StorageKey.Account)
        expect(mockWindow.localStorage.removeItem).not.toHaveBeenCalled()
      },
    )

    it(
      'should skip remote logout when localOnly is true',
      async () => {
        await logout(
          mockProviderConfig,
          'test-access-token',
          'test-refresh-token',
          'https://default.redirect',
          true,
        )

        // Verify remote logout was not called
        expect(postLogout).not.toHaveBeenCalled()

        // Verify storage was still cleared
        expect(mockWindow.localStorage.removeItem).toHaveBeenCalledWith(StorageKey.RefreshToken)
        expect(mockWindow.localStorage.removeItem).toHaveBeenCalledWith(StorageKey.Account)

        // Verify redirect to default URI
        expect(mockWindow.location.href).toBe('https://default.redirect')
      },
    )

    it(
      'should handle missing refresh token',
      async () => {
        await logout(
          mockProviderConfig,
          'test-access-token',
          null,
          'https://default.redirect',
          false,
        )

        // Verify remote logout was not called
        expect(postLogout).not.toHaveBeenCalled()

        // Verify storage was still cleared
        expect(mockWindow.localStorage.removeItem).toHaveBeenCalledWith(StorageKey.RefreshToken)
        expect(mockWindow.localStorage.removeItem).toHaveBeenCalledWith(StorageKey.Account)
      },
    )

    it(
      'should handle remote logout failure',
      async () => {
        vi.mocked(postLogout).mockRejectedValueOnce(new Error('Logout failed'))

        await logout(
          mockProviderConfig,
          'test-access-token',
          'test-refresh-token',
          'https://default.redirect',
          false,
        )

        // Verify error was logged
        expect(mockConsoleError).toHaveBeenCalledWith('Failed to logout remotely: Error: Logout failed')

        // Verify storage was still cleared
        expect(mockWindow.localStorage.removeItem).toHaveBeenCalledWith(StorageKey.RefreshToken)
        expect(mockWindow.localStorage.removeItem).toHaveBeenCalledWith(StorageKey.Account)

        // Verify fallback to default redirect
        expect(mockWindow.location.href).toBe('https://default.redirect')
      },
    )
  },
)
