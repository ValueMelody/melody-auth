import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'

import type { ProviderConfig } from 'shared'
import { SessionStorageKey } from 'shared'

import {
  genCodeVerifierAndChallenge,
  genAuthorizeState,
} from '../generators'
import { getAuthorize } from '../requests'
import { loginRedirect } from './loginRedirect'

// Mock dependencies
vi.mock(
  '../requests',
  () => ({ getAuthorize: vi.fn() }),
)

vi.mock(
  '../generators',
  () => ({
    genCodeVerifierAndChallenge: vi.fn(),
    genAuthorizeState: vi.fn(),
  }),
)

describe(
  'loginRedirect',
  () => {
    const mockProviderConfig: ProviderConfig = {
      serverUri: 'https://test.server',
      clientId: 'test-client-id',
      redirectUri: 'https://test.redirect',
      scopes: ['test-scope'],
    }

    const mockWindow = {
      sessionStorage: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      },
    }

    beforeEach(() => {
    // Setup window mock
    // @ts-expect-error - Partial window mock
      global.window = mockWindow

      // Setup default mock implementations
      vi.mocked(genAuthorizeState).mockReturnValue('test-state')
      vi.mocked(genCodeVerifierAndChallenge).mockResolvedValue({
        codeVerifier: 'test-verifier',
        codeChallenge: 'test-challenge',
      })
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it(
      'should handle undefined additionalProps',
      async () => {
        await loginRedirect(mockProviderConfig)

        // Verify authorize call
        expect(getAuthorize).toHaveBeenCalledWith(
          mockProviderConfig,
          {
            state: 'test-state',
            codeChallenge: 'test-challenge',
            locale: undefined,
            policy: undefined,
            org: undefined,
          },
        )
      },
    )

    it(
      'should initiate login redirect with generated values',
      async () => {
        await loginRedirect(
          mockProviderConfig,
          {},
        )

        // Verify state generation
        expect(genAuthorizeState).toHaveBeenCalledWith(21)

        // Verify code verifier/challenge generation
        expect(genCodeVerifierAndChallenge).toHaveBeenCalled()

        // Verify session storage
        expect(mockWindow.sessionStorage.setItem).toHaveBeenCalledWith(
          SessionStorageKey.State,
          'test-state',
        )
        expect(mockWindow.sessionStorage.setItem).toHaveBeenCalledWith(
          SessionStorageKey.CodeVerifier,
          'test-verifier',
        )

        // Verify authorize call
        expect(getAuthorize).toHaveBeenCalledWith(
          mockProviderConfig,
          {
            state: 'test-state',
            codeChallenge: 'test-challenge',
            locale: undefined,
            policy: undefined,
            org: undefined,
          },
        )
      },
    )

    it(
      'should use provided state instead of generating one',
      async () => {
        const customState = 'custom-state'

        await loginRedirect(
          mockProviderConfig,
          { state: customState },
        )

        // Verify state was not generated
        expect(genAuthorizeState).not.toHaveBeenCalled()

        // Verify custom state was used
        expect(mockWindow.sessionStorage.setItem).toHaveBeenCalledWith(
          SessionStorageKey.State,
          customState,
        )
        expect(getAuthorize).toHaveBeenCalledWith(
          mockProviderConfig,
          expect.objectContaining({ state: customState }),
        )
      },
    )

    it(
      'should pass through additional properties',
      async () => {
        const additionalProps = {
          locale: 'en-US',
          policy: 'test-policy',
          org: 'test-org',
        }

        await loginRedirect(
          mockProviderConfig,
          additionalProps,
        )

        expect(getAuthorize).toHaveBeenCalledWith(
          mockProviderConfig,
          expect.objectContaining(additionalProps),
        )
      },
    )

    it(
      'should throw error when authorize fails',
      async () => {
        const error = new Error('Authorize failed')
        vi.mocked(getAuthorize).mockRejectedValueOnce(error)

        await expect(loginRedirect(
          mockProviderConfig,
          {},
        )).rejects.toThrow('Failed to initial authorize flow: Error: Authorize failed')
      },
    )
  },
)
