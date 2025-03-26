import {
  describe, expect, test, vi, beforeEach,
} from 'vitest'
import {
  parseResponse,
  parseAuthorizeBaseValues,
  parseAuthorizeFollowUpValues,
  handleAuthorizeStep,
} from './request'
import { View } from 'pages/hooks'
import {
  routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'

describe(
  'request tools',
  () => {
    describe(
      'parseResponse',
      () => {
        test(
          'returns json for successful response',
          async () => {
            const mockResponse = {
              ok: true,
              json: vi.fn().mockResolvedValue({ data: 'test' }),
            }

            const result = await parseResponse(mockResponse as unknown as Response)
            expect(result).toEqual({ data: 'test' })
          },
        )

        test(
          'throws error for unsuccessful response',
          async () => {
            const mockResponse = {
              ok: false,
              text: vi.fn().mockResolvedValue('Error message'),
            }

            await expect(parseResponse(mockResponse as unknown as Response))
              .rejects.toThrow('Error message')
          },
        )
      },
    )

    describe(
      'parseAuthorizeBaseValues',
      () => {
        test(
          'returns correct object with all params',
          () => {
            const params = {
              clientId: 'client123',
              redirectUri: 'http://example.com',
              responseType: 'code',
              state: 'state123',
              policy: oauthDto.Policy.SignInOrSignUp,
              codeChallenge: 'challenge123',
              codeChallengeMethod: 'S256',
              org: 'org123',
              scope: 'scope123',
              locale: 'en' as typeConfig.Locale,
            }

            const result = parseAuthorizeBaseValues(
              params,
              'en',
            )

            expect(result).toEqual({
              ...params,
              locale: 'en',
            })
          },
        )
      },
    )

    describe(
      'parseAuthorizeFollowUpValues',
      () => {
        test(
          'returns correct object with follow-up params',
          () => {
            const params = {
              code: 'code123',
              org: 'org123',
              state: 'state123',
              redirectUri: 'http://example.com',
              locale: 'en' as typeConfig.Locale,
            }

            const result = parseAuthorizeFollowUpValues(
              params,
              'en',
            )

            expect(result).toEqual({
              code: 'code123',
              locale: 'en',
              org: 'org123',
            })
          },
        )
      },
    )

    describe(
      'handleAuthorizeStep',
      () => {
        const locale = 'en'
        const onSwitchView = vi.fn()

        beforeEach(() => {
          vi.resetAllMocks()
          // Mock window.location
          Object.defineProperty(
            window,
            'location',
            {
              value: {
                origin: 'http://localhost', href: '',
              },
              writable: true,
            },
          )
          // Mock window.history
          window.history.pushState = vi.fn()
        })

        test(
          'handles nextPage with code, state, and redirectUri',
          () => {
            const data = {
              nextPage: View.Consent,
              code: 'code123',
              state: 'state123',
              redirectUri: 'http://example.com',
              org: 'org123',
            }

            handleAuthorizeStep(
              data,
              locale,
              onSwitchView,
            )

            // Verify URL update
            expect(window.history.pushState).toHaveBeenCalledWith(
              {},
              '',
              expect.any(URL),
            )

            const urlArg = (window.history.pushState as any).mock.calls[0][2]
            expect(urlArg.pathname).toBe(routeConfig.IdentityRoute.ProcessView)
            expect(urlArg.searchParams.get('code')).toBe('code123')
            expect(urlArg.searchParams.get('state')).toBe('state123')
            expect(urlArg.searchParams.get('redirect_uri')).toBe('http://example.com')
            expect(urlArg.searchParams.get('org')).toBe('org123')
            expect(urlArg.searchParams.get('locale')).toBe('en')
            expect(urlArg.searchParams.get('step')).toBe(View.Consent)

            // Verify view switch
            expect(onSwitchView).toHaveBeenCalledWith(View.Consent)
          },
        )

        test(
          'handles nextPage with missing org',
          () => {
            const data = {
              nextPage: View.Consent,
              code: 'code123',
              state: 'state123',
              redirectUri: 'http://example.com',
            }

            handleAuthorizeStep(
              data,
              locale,
              onSwitchView,
            )

            const urlArg = (window.history.pushState as any).mock.calls[0][2]
            expect(urlArg.searchParams.get('org')).toBe('')
          },
        )

        test(
          'handles window.opener redirect',
          () => {
            const data = {
              state: 'state123',
              code: 'code123',
              redirectUri: 'http://example.com',
              org: 'org123',
            }

            // Mock window.opener
            Object.defineProperty(
              window,
              'opener',
              {
                value: { postMessage: vi.fn() },
                writable: true,
              },
            )

            handleAuthorizeStep(
              data,
              locale,
              onSwitchView,
            )

            expect(window.opener.postMessage).toHaveBeenCalledWith(
              {
                state: 'state123',
                code: 'code123',
                locale: 'en',
                org: 'org123',
                redirectUri: 'http://example.com',
              },
              'http://example.com',
            )
          },
        )

        test(
          'handles direct redirect when no window.opener',
          () => {
            const data = {
              state: 'state123',
              code: 'code123',
              redirectUri: 'http://example.com',
              org: 'org123',
            }

            // Ensure window.opener is undefined
            Object.defineProperty(
              window,
              'opener',
              {
                value: null,
                writable: true,
              },
            )

            handleAuthorizeStep(
              data,
              locale,
              onSwitchView,
            )

            expect(window.location.href).toBe('http://example.com?state=state123&code=code123&locale=en&org=org123')
          },
        )

        test(
          'handles missing org in redirect',
          () => {
            const data = {
              state: 'state123',
              code: 'code123',
              redirectUri: 'http://example.com',
            }

            handleAuthorizeStep(
              data,
              locale,
              onSwitchView,
            )

            expect(window.location.href).toBe('http://example.com?state=state123&code=code123&locale=en&org=')
          },
        )

        test(
          'handles null or undefined org in window.opener redirect',
          () => {
            // Test with undefined org
            const dataUndefined = {
              state: 'state123',
              code: 'code123',
              redirectUri: 'http://example.com',
              org: undefined,
            }

            // Mock window.opener
            Object.defineProperty(
              window,
              'opener',
              {
                value: { postMessage: vi.fn() },
                writable: true,
              },
            )

            handleAuthorizeStep(
              dataUndefined,
              locale,
              onSwitchView,
            )

            // Verify org is empty string when undefined
            expect(window.opener.postMessage).toHaveBeenCalledWith(
              {
                state: 'state123',
                code: 'code123',
                locale: 'en',
                org: '',
                redirectUri: 'http://example.com',
              },
              'http://example.com',
            )

            // Clear mock
            vi.clearAllMocks()

            // Test with null org
            const dataNull = {
              state: 'state123',
              code: 'code123',
              redirectUri: 'http://example.com',
              org: null,
            }

            handleAuthorizeStep(
              dataNull,
              locale,
              onSwitchView,
            )

            // Verify org is empty string when null
            expect(window.opener.postMessage).toHaveBeenCalledWith(
              {
                state: 'state123',
                code: 'code123',
                locale: 'en',
                org: '',
                redirectUri: 'http://example.com',
              },
              'http://example.com',
            )
          },
        )
      },
    )
  },
)
