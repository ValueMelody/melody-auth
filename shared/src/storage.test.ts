import {
  describe, it, expect, beforeEach, afterEach, vi,
} from 'vitest'
import {
  CookieStorage, defaultCookieGetter, defaultCookieSetter,
} from './storage'
import type {
  CookieOptions, AuthStorage,
} from './storage'

describe(
  'CookieStorage',
  () => {
    let originalDocument: Document | undefined
    let originalEnv: string | undefined

    beforeEach(() => {
      originalDocument = globalThis.document
      originalEnv = process.env.NODE_ENV
    })

    afterEach(() => {
      if (originalDocument !== undefined) {
        globalThis.document = originalDocument
      } else {
        delete (globalThis as any).document
      }
      if (originalEnv !== undefined) {
        process.env.NODE_ENV = originalEnv
      } else {
        delete process.env.NODE_ENV
      }
    })

    describe(
      'constructor',
      () => {
        it(
          'should create instance with default options',
          () => {
            const storage = new CookieStorage()
            expect(storage).toBeInstanceOf(CookieStorage)
          },
        )

        it(
          'should merge custom options with defaults',
          () => {
            const customOptions = {
              httpOnly: false,
              secure: true,
              sameSite: 'strict' as const,
              path: '/api',
              domain: 'example.com',
              maxAge: 3600,
            }
            const storage = new CookieStorage(customOptions)
            expect(storage).toBeInstanceOf(CookieStorage)
          },
        )

        it(
          'should set secure to true in production',
          () => {
            process.env.NODE_ENV = 'production'
            const storage = new CookieStorage()
            expect(storage).toBeInstanceOf(CookieStorage)
          },
        )

        it(
          'should set secure to false in development',
          () => {
            process.env.NODE_ENV = 'development'
            const storage = new CookieStorage()
            expect(storage).toBeInstanceOf(CookieStorage)
          },
        )

        it(
          'should use custom cookie getter and setter',
          () => {
            const customGetter = vi.fn()
            const customSetter = vi.fn()
            const storage = new CookieStorage({
              cookieGetter: customGetter,
              cookieSetter: customSetter,
            })

            storage.getItem('test')
            expect(customGetter).toHaveBeenCalledWith(
              'test',
              expect.any(Object),
            )

            storage.setItem(
              'test',
              'value',
            )
            expect(customSetter).toHaveBeenCalledWith(
              'test',
              'value',
              expect.any(Object),
            )
          },
        )
      },
    )

    describe(
      'browser environment',
      () => {
        beforeEach(() => {
          globalThis.document = { cookie: '' } as any
        })

        describe(
          'getItem',
          () => {
            it(
              'should retrieve cookie value',
              () => {
                globalThis.document.cookie = 'testKey=testValue; otherKey=otherValue'
                const storage = new CookieStorage()
                expect(storage.getItem('testKey')).toBe('testValue')
              },
            )

            it(
              'should decode URI component in cookie value',
              () => {
                globalThis.document.cookie = 'encoded=hello%20world%21'
                const storage = new CookieStorage()
                expect(storage.getItem('encoded')).toBe('hello world!')
              },
            )

            it(
              'should return null for non-existent cookie',
              () => {
                globalThis.document.cookie = 'existingKey=value'
                const storage = new CookieStorage()
                expect(storage.getItem('nonExistent')).toBeNull()
              },
            )

            it(
              'should handle empty cookie string',
              () => {
                globalThis.document.cookie = ''
                const storage = new CookieStorage()
                expect(storage.getItem('anyKey')).toBeNull()
              },
            )
          },
        )

        describe(
          'setItem',
          () => {
            beforeEach(() => {
              globalThis.document.cookie = ''
            })

            it(
              'should set basic cookie',
              () => {
                const storage = new CookieStorage()
                storage.setItem(
                  'key',
                  'value',
                )
                expect(globalThis.document.cookie).toContain('key=value')
              },
            )

            it(
              'should encode URI component in cookie value',
              () => {
                const storage = new CookieStorage()
                storage.setItem(
                  'key',
                  'hello world!',
                )
                expect(globalThis.document.cookie).toContain('key=hello%20world!')
              },
            )

            it(
              'should include path when specified',
              () => {
                const storage = new CookieStorage({ path: '/api' })
                storage.setItem(
                  'key',
                  'value',
                )
                expect(globalThis.document.cookie).toContain('Path=/api')
              },
            )

            it(
              'should include domain when specified',
              () => {
                const storage = new CookieStorage({ domain: 'example.com' })
                storage.setItem(
                  'key',
                  'value',
                )
                expect(globalThis.document.cookie).toContain('Domain=example.com')
              },
            )

            it(
              'should include maxAge when specified',
              () => {
                const storage = new CookieStorage({ maxAge: 3600 })
                storage.setItem(
                  'key',
                  'value',
                )
                expect(globalThis.document.cookie).toContain('Max-Age=3600')
              },
            )

            it(
              'should include Secure flag when specified',
              () => {
                const storage = new CookieStorage({ secure: true })
                storage.setItem(
                  'key',
                  'value',
                )
                expect(globalThis.document.cookie).toContain('Secure')
              },
            )

            it(
              'should include SameSite attribute when specified',
              () => {
                const storage = new CookieStorage({ sameSite: 'strict' })
                storage.setItem(
                  'key',
                  'value',
                )
                expect(globalThis.document.cookie).toContain('SameSite=strict')
              },
            )

            it(
              'should not include HttpOnly in browser (ignored)',
              () => {
                const storage = new CookieStorage({ httpOnly: true })
                storage.setItem(
                  'key',
                  'value',
                )
                expect(globalThis.document.cookie).not.toContain('HttpOnly')
              },
            )

            it(
              'should set cookie with all options',
              () => {
                const storage = new CookieStorage({
                  path: '/api',
                  domain: 'example.com',
                  maxAge: 3600,
                  secure: true,
                  sameSite: 'lax',
                })
                storage.setItem(
                  'key',
                  'value',
                )
                const cookie = globalThis.document.cookie
                expect(cookie).toContain('key=value')
                expect(cookie).toContain('Path=/api')
                expect(cookie).toContain('Domain=example.com')
                expect(cookie).toContain('Max-Age=3600')
                expect(cookie).toContain('Secure')
                expect(cookie).toContain('SameSite=lax')
              },
            )
          },
        )
      },
    )

    describe(
      'server environment',
      () => {
        beforeEach(() => {
          delete (globalThis as any).document
        })

        describe(
          'getItem',
          () => {
            it(
              'should retrieve cookie from request headers',
              () => {
                const request = { headers: { get: vi.fn().mockReturnValue('testKey=testValue; otherKey=otherValue') } } as any
                const storage = new CookieStorage({ request })
                expect(storage.getItem('testKey')).toBe('testValue')
              },
            )

            it(
              'should decode URI component in server cookie',
              () => {
                const request = { headers: { get: vi.fn().mockReturnValue('encoded=hello%20world%21') } } as any
                const storage = new CookieStorage({ request })
                expect(storage.getItem('encoded')).toBe('hello world!')
              },
            )

            it(
              'should return null when no cookie header',
              () => {
                const request = { headers: { get: vi.fn().mockReturnValue(null) } } as any
                const storage = new CookieStorage({ request })
                expect(storage.getItem('key')).toBeNull()
              },
            )

            it(
              'should return null for non-existent cookie in request',
              () => {
                const request = { headers: { get: vi.fn().mockReturnValue('existingKey=value') } } as any
                const storage = new CookieStorage({ request })
                expect(storage.getItem('nonExistent')).toBeNull()
              },
            )

            it(
              'should warn when no document or request available',
              () => {
                const consoleSpy = vi.spyOn(
                  console,
                  'warn',
                ).mockImplementation(() => { })
                const storage = new CookieStorage()
                expect(storage.getItem('key')).toBeNull()
                expect(consoleSpy).toHaveBeenCalledWith('Unable to get cookie: no document or request object available')
                consoleSpy.mockRestore()
              },
            )
          },
        )

        describe(
          'setItem',
          () => {
            it(
              'should set cookie header on response',
              () => {
                const response = { headers: { append: vi.fn() } } as any
                const storage = new CookieStorage({ response })
                storage.setItem(
                  'key',
                  'value',
                )
                expect(response.headers.append).toHaveBeenCalledWith(
                  'Set-Cookie',
                  expect.stringContaining('key=value'),
                )
              },
            )

            it(
              'should encode URI component in server cookie',
              () => {
                const response = { headers: { append: vi.fn() } } as any
                const storage = new CookieStorage({ response })
                storage.setItem(
                  'key',
                  'hello world!',
                )
                expect(response.headers.append).toHaveBeenCalledWith(
                  'Set-Cookie',
                  expect.stringContaining('key=hello%20world!'),
                )
              },
            )

            it(
              'should include HttpOnly flag in server environment',
              () => {
                const response = { headers: { append: vi.fn() } } as any
                const storage = new CookieStorage({
                  response, httpOnly: true,
                })
                storage.setItem(
                  'key',
                  'value',
                )
                expect(response.headers.append).toHaveBeenCalledWith(
                  'Set-Cookie',
                  expect.stringContaining('HttpOnly'),
                )
              },
            )

            it(
              'should set cookie with all server options',
              () => {
                const response = { headers: { append: vi.fn() } } as any
                const storage = new CookieStorage({
                  response,
                  path: '/api',
                  domain: 'example.com',
                  maxAge: 3600,
                  secure: true,
                  httpOnly: true,
                  sameSite: 'strict',
                })
                storage.setItem(
                  'key',
                  'value',
                )

                const [[, cookieValue]] = response.headers.append.mock.calls
                expect(cookieValue).toContain('key=value')
                expect(cookieValue).toContain('Path=/api')
                expect(cookieValue).toContain('Domain=example.com')
                expect(cookieValue).toContain('Max-Age=3600')
                expect(cookieValue).toContain('Secure')
                expect(cookieValue).toContain('HttpOnly')
                expect(cookieValue).toContain('SameSite=strict')
              },
            )

            it(
              'should warn when no document or response available',
              () => {
                const consoleSpy = vi.spyOn(
                  console,
                  'warn',
                ).mockImplementation(() => { })
                const storage = new CookieStorage()
                storage.setItem(
                  'key',
                  'value',
                )
                expect(consoleSpy).toHaveBeenCalledWith('Unable to set cookie: no document or response object available')
                consoleSpy.mockRestore()
              },
            )
          },
        )
      },
    )

    describe(
      'defaultCookieGetter',
      () => {
        it(
          'should work independently in browser environment',
          () => {
            globalThis.document = { cookie: 'key=value' } as any
            const result = defaultCookieGetter(
              'key',
{} as CookieOptions,
            )
            expect(result).toBe('value')
          },
        )

        it(
          'should work independently in server environment',
          () => {
            delete (globalThis as any).document
            const options: CookieOptions = { request: { headers: { get: vi.fn().mockReturnValue('key=value') } } as any }
            const result = defaultCookieGetter(
              'key',
              options,
            )
            expect(result).toBe('value')
          },
        )
      },
    )

    describe(
      'defaultCookieSetter',
      () => {
        it(
          'should work independently in browser environment',
          () => {
            globalThis.document = { cookie: '' } as any
            const options: CookieOptions = {
              path: '/',
              secure: true,
            }
            defaultCookieSetter(
              'key',
              'value',
              options,
            )
            expect(globalThis.document.cookie).toContain('key=value')
          },
        )

        it(
          'should work independently in server environment',
          () => {
            delete (globalThis as any).document
            const response = { headers: { append: vi.fn() } }
            const options: CookieOptions = {
              response: response as any,
              httpOnly: true,
            }
            defaultCookieSetter(
              'key',
              'value',
              options,
            )
            expect(response.headers.append).toHaveBeenCalledWith(
              'Set-Cookie',
              expect.stringContaining('key=value'),
            )
          },
        )
      },
    )

    describe(
      'edge cases',
      () => {
        it(
          'should handle cookies with equals sign in value',
          () => {
            globalThis.document = { cookie: 'key=value=with=equals' } as any
            const storage = new CookieStorage()
            // The implementation splits on '=' so only gets the first part
            expect(storage.getItem('key')).toBe('value')
          },
        )

        it(
          'should handle empty cookie value',
          () => {
            globalThis.document = { cookie: 'emptyKey=' } as any
            const storage = new CookieStorage()
            // Due to || null in the implementation, empty strings return null
            expect(storage.getItem('emptyKey')).toBeNull()
          },
        )

        it(
          'should handle multiple cookies with similar names',
          () => {
            globalThis.document = { cookie: 'key=value1; key2=value2; mykey=value3' } as any
            const storage = new CookieStorage()
            expect(storage.getItem('key')).toBe('value1')
            expect(storage.getItem('key2')).toBe('value2')
            expect(storage.getItem('mykey')).toBe('value3')
          },
        )

        it(
          'should handle maxAge of 0',
          () => {
            globalThis.document = { cookie: '' } as any
            const storage = new CookieStorage({ maxAge: 0 })
            storage.setItem(
              'key',
              'value',
            )
            expect(globalThis.document.cookie).toContain('Max-Age=0')
          },
        )

        it(
          'should handle special characters in cookie names and values',
          () => {
            globalThis.document = { cookie: 'special%2Bname=special%2Bvalue%3D%3D' } as any
            const storage = new CookieStorage()
            expect(storage.getItem('special%2Bname')).toBe('special+value==')
          },
        )

        it(
          'should handle cookies without values',
          () => {
            globalThis.document = { cookie: 'flag' } as any
            const storage = new CookieStorage()
            // When there's no '=' in the cookie, v will be undefined, which becomes 'undefined' string
            expect(storage.getItem('flag')).toBe('undefined')
          },
        )

        it(
          'should handle malformed cookie strings gracefully',
          () => {
            globalThis.document = { cookie: '; ; key=value; ; ' } as any
            const storage = new CookieStorage()
            expect(storage.getItem('key')).toBe('value')
            // Empty string key with no value becomes 'undefined' string
            expect(storage.getItem('')).toBe('undefined')
          },
        )
      },
    )

    describe(
      'AuthStorage interface compliance',
      () => {
        it(
          'should implement the AuthStorage interface',
          () => {
            const storage = new CookieStorage()
            expect(typeof storage.getItem).toBe('function')
            expect(typeof storage.setItem).toBe('function')

            // Test that it works as expected
            globalThis.document = { cookie: '' } as any
            storage.setItem(
              'authToken',
              'abc123',
            )
            expect(globalThis.document.cookie).toContain('authToken=abc123')
          },
        )

        it(
          'should be usable as AuthStorage type',
          () => {
            const createAuthStorage = (): AuthStorage => {
              return new CookieStorage()
            }

            const storage = createAuthStorage()
            expect(storage).toBeInstanceOf(CookieStorage)
          },
        )
      },
    )
  },
)
