import {
  describe, it, expect, vi,
} from 'vitest'
import type { ProviderConfig } from 'shared'
import { getUserInfo } from '../requests'
import { fetchUserInfo } from './fetchUserInfo'

// Mock the requests module
vi.mock(
  '../requests',
  () => ({ getUserInfo: vi.fn() }),
)

describe(
  'fetchUserInfo',
  () => {
    const mockProviderConfig: ProviderConfig = {
      serverUri: 'https://test.server',
      clientId: 'test-client-id',
      redirectUri: 'https://test.redirect',
      scopes: ['test-scope'],
    }

    it(
      'should fetch user info successfully',
      async () => {
        const mockUserInfo = {
          sub: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
        }

        vi.mocked(getUserInfo).mockResolvedValueOnce(mockUserInfo)

        const result = await fetchUserInfo(
          mockProviderConfig,
          'test-access-token',
        )

        expect(getUserInfo).toHaveBeenCalledWith(
          mockProviderConfig,
          { accessToken: 'test-access-token' },
        )
        expect(result).toEqual(mockUserInfo)
      },
    )

    it(
      'should throw error when fetch fails',
      async () => {
        const error = new Error('Fetch failed')
        vi.mocked(getUserInfo).mockRejectedValueOnce(error)

        await expect(fetchUserInfo(
          mockProviderConfig,
          'test-access-token',
        )).rejects.toThrow('Failed to fetch user info: Error: Fetch failed')
      },
    )
  },
)
