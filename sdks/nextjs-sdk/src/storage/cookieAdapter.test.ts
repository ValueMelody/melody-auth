import {
  describe, it, expect, vi, beforeEach,
} from 'vitest'
import * as cookiesNext from 'cookies-next'
import { CookieStorage } from './cookieAdapter'

// Mock cookies-next
vi.mock(
  'cookies-next',
  () => ({
    getCookie: vi.fn(),
    setCookie: vi.fn(),
    deleteCookie: vi.fn(),
  }),
)

describe(
  'CookieStorage',
  () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    describe(
      'getItem',
      () => {
        it(
          'should retrieve a cookie value',
          () => {
            const mockValue = 'test-value'
            vi.mocked(cookiesNext.getCookie).mockReturnValue(mockValue)

            const storage = new CookieStorage()
            const result = storage.getItem('test-key')

            expect(result).toBe(mockValue)
            expect(cookiesNext.getCookie).toHaveBeenCalledWith(
              'test-key',
              expect.objectContaining({
                req: undefined,
                res: undefined,
              }),
            )
          },
        )

        it(
          'should return null when cookie does not exist',
          () => {
            vi.mocked(cookiesNext.getCookie).mockReturnValue(null)

            const storage = new CookieStorage()
            const result = storage.getItem('non-existent')

            expect(result).toBeNull()
          },
        )

        it(
          'should pass request and response options',
          () => {
            const mockReq = {} as any
            const mockRes = {} as any
            vi.mocked(cookiesNext.getCookie).mockReturnValue('value')

            const storage = new CookieStorage({
              req: mockReq, res: mockRes,
            })
            storage.getItem('test-key')

            expect(cookiesNext.getCookie).toHaveBeenCalledWith(
              'test-key',
              expect.objectContaining({
                req: mockReq,
                res: mockRes,
              }),
            )
          },
        )
      },
    )

    describe(
      'setItem',
      () => {
        it(
          'should set a cookie value',
          () => {
            const storage = new CookieStorage()
            storage.setItem(
              'test-key',
              'test-value',
            )

            expect(cookiesNext.setCookie).toHaveBeenCalledWith(
              'test-key',
              'test-value',
              expect.objectContaining({
                httpOnly: true,
                secure: false, // NODE_ENV is 'test'
                sameSite: 'lax',
                path: '/',
              }),
            )
          },
        )

        it(
          'should use custom cookie options',
          () => {
            const storage = new CookieStorage({
              httpOnly: false,
              secure: true,
              sameSite: 'strict',
              path: '/auth',
              domain: '.example.com',
              maxAge: 3600,
            })

            storage.setItem(
              'test-key',
              'test-value',
            )

            expect(cookiesNext.setCookie).toHaveBeenCalledWith(
              'test-key',
              'test-value',
              expect.objectContaining({
                httpOnly: false,
                secure: true,
                sameSite: 'strict',
                path: '/auth',
                domain: '.example.com',
                maxAge: 3600,
              }),
            )
          },
        )
      },
    )

    describe(
      'removeItem',
      () => {
        it(
          'should delete a cookie',
          () => {
            const storage = new CookieStorage()
            storage.removeItem('test-key')

            expect(cookiesNext.deleteCookie).toHaveBeenCalledWith(
              'test-key',
              expect.objectContaining({
                req: undefined,
                res: undefined,
              }),
            )
          },
        )

        it(
          'should pass request and response when removing',
          () => {
            const mockReq = {} as any
            const mockRes = {} as any

            const storage = new CookieStorage({
              req: mockReq, res: mockRes,
            })
            storage.removeItem('test-key')

            expect(cookiesNext.deleteCookie).toHaveBeenCalledWith(
              'test-key',
              expect.objectContaining({
                req: mockReq,
                res: mockRes,
              }),
            )
          },
        )
      },
    )

    describe(
      'integration with shared CookieStorage',
      () => {
        it(
          'should properly wrap shared storage methods',
          () => {
            const storage = new CookieStorage()

            // Test that all methods are available
            expect(typeof storage.getItem).toBe('function')
            expect(typeof storage.setItem).toBe('function')
            expect(typeof storage.removeItem).toBe('function')
          },
        )
      },
    )
  },
)
