import {
  describe,
  expect,
  test,
  vi,
  beforeEach,
} from 'vitest'
import { enroll } from './passkey'
import { passkeyService } from 'services'

describe(
  'passkey tools',
  () => {
    beforeEach(() => {
      // Mock SimpleWebAuthnBrowser
      (window as any).SimpleWebAuthnBrowser = { base64URLStringToBuffer: vi.fn(() => new Uint8Array([1, 2, 3])) }

      // Mock navigator.credentials
      Object.defineProperty(
        window,
        'navigator',
        {
          value: { credentials: { create: vi.fn().mockResolvedValue({ id: 'test-credential' }) } },
          writable: true,
        },
      )
    })

    test(
      'enroll creates credentials with correct options',
      async () => {
        const enrollOptions: passkeyService.EnrollOptions = {
          challenge: 'test-challenge',
          rpId: 'example.com',
          userId: 123,
          userEmail: 'test@example.com',
          userDisplayName: 'Test User',
        }

        await enroll(enrollOptions)

        // Verify SimpleWebAuthnBrowser was called correctly
        expect((window as any).SimpleWebAuthnBrowser.base64URLStringToBuffer).toHaveBeenCalledWith('test-challenge')

        // Get the actual call arguments
        const createCall = (navigator.credentials.create as any).mock.calls[0][0]

        expect(createCall.publicKey.user.name).toBe('test@example.com')
        expect(createCall.publicKey.user.displayName).toBe('Test User')
        expect(createCall.publicKey.challenge).toBeInstanceOf(Uint8Array)

        const encodedUserId = createCall.publicKey.user.id
        expect(new TextDecoder().decode(encodedUserId)).toBe('123')
      },
    )

    test(
      'enroll returns the created credential',
      async () => {
        const enrollOptions: passkeyService.EnrollOptions = {
          challenge: 'test-challenge',
          rpId: 'example.com',
          userId: 123,
          userEmail: 'test@example.com',
          userDisplayName: 'Test User',
        }

        const result = await enroll(enrollOptions)

        expect(result).toEqual({ id: 'test-credential' })
      },
    )

    test(
      'enroll handles credential creation failure',
      async () => {
        // Mock credentials.create to reject
        Object.defineProperty(
          window,
          'navigator',
          {
            value: { credentials: { create: vi.fn().mockRejectedValue(new Error('Creation failed')) } },
            writable: true,
          },
        )

        const enrollOptions: passkeyService.EnrollOptions = {
          challenge: 'test-challenge',
          rpId: 'example.com',
          userId: 123,
          userEmail: 'test@example.com',
          userDisplayName: 'Test User',
        }

        await expect(enroll(enrollOptions)).rejects.toThrow('Creation failed')
      },
    )
  },
)
