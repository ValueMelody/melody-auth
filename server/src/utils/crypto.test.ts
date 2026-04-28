import {
  describe, expect, test,
} from 'vitest'
import {
  bcryptCompare,
  bcryptText,
  redactMessageBody,
} from './crypto'
import {
  localeConfig, typeConfig,
} from 'configs'
import {
  ChangeEmailVerificationTemplate,
  EmailMfaTemplate,
  EmailVerificationTemplate,
  MagicLinkTemplate,
  PasswordResetTemplate,
} from 'templates'

const branding = {
  name: 'Test Brand',
  logo: 'test-logo.png',
  logoUrl: '',
  emailLogoUrl: 'https://test.com/logo.png',
  fontFamily: 'Arial',
  fontUrl: null,
  layoutColor: '#ffffff',
  buttonColor: '#000000',
  buttonTextColor: '#ffffff',
  textColor: '#000000',
  linkColor: '#0000ff',
  labelColor: '#000000',
  primaryButtonColor: '#000000',
  primaryButtonLabelColor: '#ffffff',
  primaryButtonBorderColor: '#000000',
  secondaryButtonColor: '#ffffff',
  secondaryButtonLabelColor: '#000000',
  secondaryButtonBorderColor: '#000000',
}

const locale = 'en' as typeConfig.Locale

describe(
  'bcrypt helpers',
  () => {
    test(
      'should generate password hashes with cost 12',
      () => {
        const hash = bcryptText('Password1!')

        expect(hash.split('$')[2]).toBe('12')
        expect(bcryptCompare(
          'Password1!',
          hash,
        )).toBe(true)
      },
    )

    test(
      'should compare legacy cost 10 password hashes',
      () => {
        const legacyCostTenHash = '$2a$10$/KBURsxnGm5OClLQFPNwZ.HcaM27Gogp/mA1xRxfEbY3bs0cuu8Fm'

        expect(bcryptCompare(
          'Password1!',
          legacyCostTenHash,
        )).toBe(true)
      },
    )
  },
)

describe(
  'redactMessageBody',
  () => {
    test(
      'should redact standalone six digit codes',
      () => {
        const result = redactMessageBody('<span>123456</span>')

        expect(result).toBe('<span>[REDACTED_CODE]</span>')
      },
    )

    test(
      'should redact six digit magic link otp params',
      () => {
        const body = [
          '<a href="https://auth.test/process?code=login-code',
          '&amp;otp=654321">Sign in</a>',
        ].join('')
        const expected = [
          '<a href="https://auth.test/process?code=login-code',
          '&amp;otp=[REDACTED_CODE]">Sign in</a>',
        ].join('')

        const result = redactMessageBody(body)

        expect(result).toBe(expected)
      },
    )

    test(
      'should keep longer phone numbers intact',
      () => {
        const result = redactMessageBody('Send to +16471231234: 123456')

        expect(result).toBe('Send to +16471231234: [REDACTED_CODE]')
      },
    )

    test(
      'should keep hex colors intact',
      () => {
        const result = redactMessageBody('<h1 style="color: #333333;">123456</h1>')

        expect(result).toBe('<h1 style="color: #333333;">[REDACTED_CODE]</h1>')
      },
    )

    test(
      'should redact six digit codes from generated auth message bodies',
      () => {
        const code = '123456'
        const messageBodies = [
          EmailVerificationTemplate({
            serverUrl: 'https://auth.test',
            authId: 'auth-id',
            org: 'test-org',
            verificationCode: code,
            branding,
            locale,
          }).toString(),
          PasswordResetTemplate({
            resetCode: code,
            branding,
            locale,
          }).toString(),
          ChangeEmailVerificationTemplate({
            verificationCode: code,
            branding,
            locale,
          }).toString(),
          EmailMfaTemplate({
            mfaCode: code,
            branding,
            locale,
          }).toString(),
          MagicLinkTemplate({
            magicLinkUrl: `https://auth.test/process?code=login-code&otp=${code}`,
            branding,
            locale,
          }).toString(),
          `${localeConfig.smsMfaMsg.body[locale]}: ${code}`,
        ]

        messageBodies.forEach((body) => {
          const result = redactMessageBody(body)

          expect(result).toContain('[REDACTED_CODE]')
          expect(result).not.toContain(code)
        })
      },
    )
  },
)
