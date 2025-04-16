import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  Mock,
} from 'vitest'
import {
  genRandomString,
  genCodeChallenge,
} from '@melody-auth/shared'
import {
  genCodeVerifierAndChallenge,
  genAuthorizeState,
} from './generators'

// Mock the shared functions
vi.mock(
  '@melody-auth/shared',
  () => ({
    genRandomString: vi.fn(),
    genCodeChallenge: vi.fn(),
  }),
)

describe(
  'generators',
  () => {
    describe(
      'genCodeVerifierAndChallenge',
      () => {
        it(
          'should generate code verifier and challenge',
          async () => {
            // Setup mocks
            const mockVerifier = 'test_verifier'
            const mockChallenge = 'test_challenge'
            vi.mocked(genRandomString).mockReturnValue(mockVerifier)
            vi.mocked(genCodeChallenge).mockResolvedValue(mockChallenge)

            // Execute
            const result = await genCodeVerifierAndChallenge()

            // Verify
            expect(genRandomString).toHaveBeenCalledWith(128)
            expect(genCodeChallenge).toHaveBeenCalledWith(mockVerifier)
            expect(result).toEqual({
              codeVerifier: mockVerifier,
              codeChallenge: mockChallenge,
            })
          },
        )
      },
    )

    describe(
      'genAuthorizeState',
      () => {
        let mockCrypto: { getRandomValues: Mock }
        let originalDescriptor: PropertyDescriptor | undefined

        beforeEach(() => {
          mockCrypto = {
            getRandomValues: vi.fn((array: Uint8Array) => {
              // Fill with predictable values for testing
              for (let i = 0; i < array.length; i++) {
                array[i] = i
              }
              return array
            }),
          }

          // Store original descriptor
          originalDescriptor = Object.getOwnPropertyDescriptor(
            global,
            'crypto',
          )

          // Define new crypto property
          Object.defineProperty(
            global,
            'crypto',
            {
              value: mockCrypto,
              writable: true,
              configurable: true,
            },
          )
        })

        afterEach(() => {
          // Restore original descriptor
          if (originalDescriptor) {
            Object.defineProperty(
              global,
              'crypto',
              originalDescriptor,
            )
          } else {
            // If there was no original descriptor, delete the property
            delete (global as any).crypto
          }
        })

        it(
          'should generate a hex string of specified length',
          () => {
            const result = genAuthorizeState(4)

            // With our mock implementation, first 4 bytes will be 0,1,2,3
            expect(result).toBe('00010203')
            expect(mockCrypto.getRandomValues).toHaveBeenCalled()
          },
        )

        it(
          'should generate strings of different lengths',
          () => {
            const length = 8
            const result = genAuthorizeState(length)

            // Verify the result is a hex string of correct length (2 chars per byte)
            expect(result).toMatch(/^[0-9a-f]{16}$/)
            expect(result.length).toBe(length * 2)
          },
        )
      },
    )
  },
)
