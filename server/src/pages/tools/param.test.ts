import {
  describe,
  expect,
  test,
  beforeEach,
} from 'vitest'
import {
  getLocaleFromParams,
  getStepFromParams,
  getAuthorizeParams,
  getFollowUpParams,
  getAuthCodeExpiredParams,
  getVerifyEmailParams,
  getInvitationParams,
  parseRedirectUri,
} from './param'
import { Policy } from 'dtos/oauth'

describe(
  'param tools',
  () => {
    beforeEach(() => {
      // Reset window.location.search before each test
      Object.defineProperty(
        window,
        'location',
        {
          value: { search: '' },
          writable: true,
        },
      )
    })

    describe(
      'getLocaleFromParams',
      () => {
        test(
          'returns locale from URL params when present',
          () => {
            window.location.search = '?locale=ja'
            expect(getLocaleFromParams()).toBe('ja')
          },
        )

        test(
          'returns default locale (en) when not present',
          () => {
            window.location.search = ''
            expect(getLocaleFromParams()).toBe('en')
          },
        )
      },
    )

    describe(
      'getStepFromParams',
      () => {
        test(
          'returns step from URL params when present',
          () => {
            window.location.search = '?step=test-step'
            expect(getStepFromParams()).toBe('test-step')
          },
        )

        test(
          'returns empty string when step not present',
          () => {
            window.location.search = ''
            expect(getStepFromParams()).toBe('')
          },
        )
      },
    )

    describe(
      'parseRedirectUri',
      () => {
        test(
          'keeps absolute http and https uris',
          () => {
            expect(parseRedirectUri('http://example.com')).toBe('http://example.com')
            expect(parseRedirectUri('https://example.com/callback?a=1')).toBe('https://example.com/callback?a=1')
            expect(parseRedirectUri('http://localhost:3000/callback')).toBe('http://localhost:3000/callback')
          },
        )

        test(
          'drops script bearing schemes',
          () => {
            expect(parseRedirectUri('javascript:alert(1)')).toBe('')
            expect(parseRedirectUri('JaVaScRiPt:alert(1)')).toBe('')
            expect(parseRedirectUri('\tjavascript:alert(1)')).toBe('')
            expect(parseRedirectUri('java\tscript:alert(1)')).toBe('')
            expect(parseRedirectUri('  javascript:alert(1)')).toBe('')
            expect(parseRedirectUri('data:text/html,<script>alert(1)</script>')).toBe('')
            expect(parseRedirectUri('vbscript:msgbox(1)')).toBe('')
          },
        )

        test(
          'drops non absolute and empty values',
          () => {
            expect(parseRedirectUri('')).toBe('')
            expect(parseRedirectUri('/callback')).toBe('')
            expect(parseRedirectUri('not a uri')).toBe('')
          },
        )
      },
    )

    describe(
      'getAuthorizeParams',
      () => {
        test(
          'returns all authorize params when present',
          () => {
            window.location.search = '?' +
              'locale=ja' +
              '&client_id=test-client' +
              '&redirect_uri=http://example.com' +
              '&response_type=code' +
              '&state=test-state' +
              '&policy=sign_in_or_sign_up' +
              '&code_challenge=test-challenge' +
              '&code_challenge_method=S256' +
              '&org=test-org' +
              '&scope=test-scope'

            expect(getAuthorizeParams()).toEqual({
              locale: 'ja',
              clientId: 'test-client',
              redirectUri: 'http://example.com',
              responseType: 'code',
              state: 'test-state',
              policy: Policy.SignInOrSignUp,
              codeChallenge: 'test-challenge',
              codeChallengeMethod: 'S256',
              org: 'test-org',
              scope: 'test-scope',
            })
          },
        )

        test(
          'returns default values when params not present',
          () => {
            window.location.search = ''

            expect(getAuthorizeParams()).toEqual({
              locale: 'en',
              clientId: '',
              redirectUri: '',
              responseType: '',
              state: '',
              policy: Policy.SignInOrSignUp,
              codeChallenge: '',
              codeChallengeMethod: '',
              org: '',
              scope: '',
            })
          },
        )

        test(
          'drops a redirect uri that is not http(s)',
          () => {
            window.location.search = '?redirect_uri=javascript%3Aalert(1)'

            expect(getAuthorizeParams().redirectUri).toBe('')
          },
        )
      },
    )

    describe(
      'getFollowUpParams',
      () => {
        test(
          'returns all follow-up params when present',
          () => {
            window.location.search = '?' +
              'code=test-code' +
              '&state=test-state' +
              '&redirect_uri=http://example.com' +
              '&org=test-org'

            expect(getFollowUpParams()).toEqual({
              code: 'test-code',
              state: 'test-state',
              redirectUri: 'http://example.com',
              org: 'test-org',
            })
          },
        )

        test(
          'returns empty strings when params not present',
          () => {
            window.location.search = ''

            expect(getFollowUpParams()).toEqual({
              code: '',
              state: '',
              redirectUri: '',
              org: '',
            })
          },
        )

        test(
          'drops a redirect uri that is not http(s)',
          () => {
            window.location.search = '?code=test-code&redirect_uri=javascript%3Aalert(1)'

            expect(getFollowUpParams().redirectUri).toBe('')
          },
        )
      },
    )

    describe(
      'getAuthCodeExpiredParams',
      () => {
        test(
          'returns all auth code expired params when present',
          () => {
            window.location.search = '?' +
              'locale=ja' +
              '&redirect_uri=http://example.com'

            expect(getAuthCodeExpiredParams()).toEqual({
              locale: 'ja',
              redirectUri: 'http://example.com',
            })
          },
        )

        test(
          'returns default values when params not present',
          () => {
            window.location.search = ''

            expect(getAuthCodeExpiredParams()).toEqual({
              locale: 'en',
              redirectUri: '',
            })
          },
        )

        test(
          'drops a redirect uri that is not http(s)',
          () => {
            window.location.search = '?locale=en&redirect_uri=javascript%3Aalert(1)'

            expect(getAuthCodeExpiredParams().redirectUri).toBe('')
          },
        )
      },
    )

    describe(
      'getVerifyEmailParams',
      () => {
        test(
          'returns all verify email params when present',
          () => {
            window.location.search = '?' +
              'locale=ja' +
              '&id=test-id' +
              '&org=test-org'

            expect(getVerifyEmailParams()).toEqual({
              locale: 'ja',
              id: 'test-id',
              org: 'test-org',
            })
          },
        )

        test(
          'returns default values when params not present',
          () => {
            window.location.search = ''

            expect(getVerifyEmailParams()).toEqual({
              locale: 'en',
              id: '',
              org: '',
            })
          },
        )
      },
    )

    describe(
      'getInvitationParams',
      () => {
        test(
          'returns all invitation params when present',
          () => {
            window.location.search = '?' +
              'locale=fr' +
              '&invitationToken=abc123' +
              '&signinUrl=https%3A%2F%2Fexample.com%2Fsignin'

            expect(getInvitationParams()).toEqual({
              locale: 'fr',
              invitationToken: 'abc123',
              signinUrl: 'https://example.com/signin',
            })
          },
        )

        test(
          'returns default values when params not present',
          () => {
            window.location.search = ''

            expect(getInvitationParams()).toEqual({
              locale: 'en',
              invitationToken: '',
              signinUrl: '',
            })
          },
        )

        test(
          'drops a signin url that is not http(s)',
          () => {
            window.location.search = '?invitationToken=abc123&signinUrl=javascript%3Aalert(1)'

            expect(getInvitationParams().signinUrl).toBe('')
          },
        )
      },
    )
  },
)
