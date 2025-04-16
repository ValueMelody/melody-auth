import {
  describe,
  it,
  expect,
  vi,
} from 'vitest'

import type {
  ProviderConfig,
  AccessTokenStorage,
} from '@melody-auth/shared'

import { postTokenByRefreshToken } from '../requests'
import { exchangeTokenByRefreshToken } from './exchangeTokenByRefreshToken'

// Mock the requests module
vi.mock(
  '../requests',
  () => ({ postTokenByRefreshToken: vi.fn() }),
)

describe(
  'exchangeTokenByRefreshToken',
  () => {
    const mockProviderConfig: ProviderConfig = {
      serverUri: 'https://test.server',
      clientId: 'test-client-id',
      redirectUri: 'https://test.redirect',
      scopes: ['test-scope'],
    }

    it(
      'should exchange refresh token for access token successfully',
      async () => {
        const mockTokenResponse = {
          access_token: 'new-access-token',
          expires_in: 3600,
          expires_on: 1234567890,
          refresh_token: 'new-refresh-token',
          token_type: 'Bearer',
        }

        vi.mocked(postTokenByRefreshToken).mockResolvedValueOnce(mockTokenResponse)

        const result = await exchangeTokenByRefreshToken(
          mockProviderConfig,
          'old-refresh-token',
        )

        const expectedStorage: AccessTokenStorage = {
          accessToken: mockTokenResponse.access_token,
          expiresIn: mockTokenResponse.expires_in,
          expiresOn: mockTokenResponse.expires_on,
        }

        expect(postTokenByRefreshToken).toHaveBeenCalledWith(
          mockProviderConfig,
          { refreshToken: 'old-refresh-token' },
        )
        expect(result).toEqual(expectedStorage)
      },
    )

    it(
      'should throw error when token exchange fails',
      async () => {
        const error = new Error('Token exchange failed')
        vi.mocked(postTokenByRefreshToken).mockRejectedValueOnce(error)

        await expect(exchangeTokenByRefreshToken(
          mockProviderConfig,
          'old-refresh-token',
        )).rejects.toThrow('Failed to exchange access_token by refresh_token: Error: Token exchange failed')
      },
    )
  },
)
