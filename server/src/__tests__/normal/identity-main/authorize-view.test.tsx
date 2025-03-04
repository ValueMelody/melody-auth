import { Database } from 'better-sqlite3'
import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { routeConfig } from 'configs'
import {
  migrate,
  mockedKV,
} from 'tests/mock'
import {
  getApp, getSignInRequest,
} from 'tests/identity'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  'get /authorize-view',
  () => {
    test(
      'should show authorize view page',
      async () => {
        const appRecord = await getApp(db)
        const res = await getSignInRequest(
          db,
          routeConfig.IdentityRoute.AuthorizeView,
          appRecord,
        )

        const html = await res.text()

        expect(html).toContain(`locales: "${(process.env.SUPPORTED_LOCALES as unknown as string[]).join(',')}"`)
        expect(html).toContain(`logoUrl: "${process.env.COMPANY_LOGO_URL}"`)
        expect(html).toContain(`enableLocaleSelector: ${process.env.ENABLE_LOCALE_SELECTOR}`)
        expect(html).toContain(`enablePasswordReset: ${process.env.ENABLE_PASSWORD_RESET}`)
        expect(html).toContain(`enableSignUp: ${process.env.ENABLE_SIGN_UP}`)
        expect(html).toContain(`enablePasswordSignIn: ${process.env.ENABLE_PASSWORD_SIGN_IN}`)
        expect(html).toContain(`googleClientId: "${process.env.GOOGLE_AUTH_CLIENT_ID}"`)
        expect(html).toContain(`facebookClientId: "${process.env.FACEBOOK_AUTH_CLIENT_ID}"`)
        expect(html).toContain(`githubClientId: "${process.env.GITHUB_AUTH_CLIENT_ID}"`)
        expect(html).toContain(`enableNames: ${process.env.ENABLE_NAMES}`)
        expect(html).toContain(`namesIsRequired: ${process.env.NAMES_IS_REQUIRED}`)
        expect(html).toContain(`termsLink: "${process.env.TERMS_LINK}"`)
        expect(html).toContain(`privacyPolicyLink: "${process.env.PRIVACY_POLICY_LINK}"`)
        expect(html).toContain(`allowPasskey: ${process.env.ALLOW_PASSKEY_ENROLLMENT}`)
        expect(html).toContain(`<link rel="icon" type="image/x-icon" href="${process.env.COMPANY_LOGO_URL}"/>`)
        expect(html).toContain(`<link href="${process.env.FONT_URL?.replace(
          '&',
          '&amp;',
        )}" rel="stylesheet"/>`)
        expect(html).toContain(`--layout-color:${process.env.LAYOUT_COLOR}`)
        expect(html).toContain(`--label-color:${process.env.LABEL_COLOR}`)
        expect(html).toContain(`--font-default:${process.env.FONT_FAMILY}`)
        expect(html).toContain(`--primary-button-color:${process.env.PRIMARY_BUTTON_COLOR}`)
        expect(html).toContain(`--primary-button-label-color:${process.env.PRIMARY_BUTTON_LABEL_COLOR}`)
        expect(html).toContain(`--primary-button-border-color:${process.env.PRIMARY_BUTTON_BORDER_COLOR}`)
        expect(html).toContain(`--secondary-button-color:${process.env.SECONDARY_BUTTON_COLOR}`)
        expect(html).toContain(`--secondary-button-label-color:${process.env.SECONDARY_BUTTON_LABEL_COLOR}`)
        expect(html).toContain(`--secondary-button-border-color:${process.env.SECONDARY_BUTTON_BORDER_COLOR}`)
        expect(html).toContain(`--critical-indicator-color:${process.env.CRITICAL_INDICATOR_COLOR}`)
      },
    )

    test(
      'should override variables using config',
      async () => {
        global.process.env.PRIVACY_POLICY_LINK = 'https://google_privacy.com'
        global.process.env.TERMS_LINK = 'https://google_terms.com'
        global.process.env.SUPPORTED_LOCALES = ['en'] as unknown as string
        global.process.env.COMPANY_LOGO_URL = 'https://google_logo.com'
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        global.process.env.ENABLE_PASSWORD_RESET = false as unknown as string
        global.process.env.ENABLE_SIGN_UP = false as unknown as string
        global.process.env.ENABLE_PASSWORD_SIGN_IN = false as unknown as string
        global.process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        global.process.env.GOOGLE_AUTH_CLIENT_ID = 'google-client-id'
        global.process.env.FACEBOOK_AUTH_CLIENT_ID = 'facebook-client-id'
        global.process.env.FACEBOOK_AUTH_CLIENT_SECRET = 'facebook-client-secret'
        global.process.env.GITHUB_AUTH_CLIENT_ID = 'github-client-id'
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = 'github-client-secret'
        global.process.env.GITHUB_AUTH_APP_NAME = 'github-app-name'
        global.process.env.ENABLE_NAMES = false as unknown as string
        global.process.env.NAMES_IS_REQUIRED = false as unknown as string
        global.process.env.FONT_FAMILY = 'Roboto'
        global.process.env.FONT_URL = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400..600&display=swap'
        global.process.env.LAYOUT_COLOR = 'red'
        global.process.env.LABEL_COLOR = 'green'
        global.process.env.PRIMARY_BUTTON_COLOR = 'black'
        global.process.env.PRIMARY_BUTTON_LABEL_COLOR = 'gray'
        global.process.env.PRIMARY_BUTTON_BORDER_COLOR = 'orange'
        global.process.env.SECONDARY_BUTTON_COLOR = 'darkred'
        global.process.env.SECONDARY_BUTTON_LABEL_COLOR = 'darkgray'
        global.process.env.SECONDARY_BUTTON_BORDER_COLOR = 'blue'
        global.process.env.CRITICAL_INDICATOR_COLOR = 'yellow'

        const appRecord = await getApp(db)
        const res = await getSignInRequest(
          db,
          routeConfig.IdentityRoute.AuthorizeView,
          appRecord,
        )

        const html = await res.text()

        expect(html).toContain(`locales: "${(process.env.SUPPORTED_LOCALES as unknown as string[]).join(',')}"`)
        expect(html).toContain(`logoUrl: "${process.env.COMPANY_LOGO_URL}"`)
        expect(html).toContain(`enableLocaleSelector: ${process.env.ENABLE_LOCALE_SELECTOR}`)
        expect(html).toContain(`enablePasswordReset: ${process.env.ENABLE_PASSWORD_RESET}`)
        expect(html).toContain(`enableSignUp: ${process.env.ENABLE_SIGN_UP}`)
        expect(html).toContain(`enablePasswordSignIn: ${process.env.ENABLE_PASSWORD_SIGN_IN}`)
        expect(html).toContain(`googleClientId: "${process.env.GOOGLE_AUTH_CLIENT_ID}"`)
        expect(html).toContain(`facebookClientId: "${process.env.FACEBOOK_AUTH_CLIENT_ID}"`)
        expect(html).toContain(`githubClientId: "${process.env.GITHUB_AUTH_CLIENT_ID}"`)
        expect(html).toContain(`enableNames: ${process.env.ENABLE_NAMES}`)
        expect(html).toContain(`namesIsRequired: ${process.env.NAMES_IS_REQUIRED}`)
        expect(html).toContain(`termsLink: "${process.env.TERMS_LINK}"`)
        expect(html).toContain(`privacyPolicyLink: "${process.env.PRIVACY_POLICY_LINK}"`)
        expect(html).toContain(`allowPasskey: ${process.env.ALLOW_PASSKEY_ENROLLMENT}`)
        expect(html).toContain(`<link rel="icon" type="image/x-icon" href="${process.env.COMPANY_LOGO_URL}"/>`)
        expect(html).toContain(`<link href="${process.env.FONT_URL?.replace(
          '&',
          '&amp;',
        )}" rel="stylesheet"/>`)
        expect(html).toContain(`--layout-color:${process.env.LAYOUT_COLOR}`)
        expect(html).toContain(`--label-color:${process.env.LABEL_COLOR}`)
        expect(html).toContain(`--font-default:${process.env.FONT_FAMILY}`)
        expect(html).toContain(`--primary-button-color:${process.env.PRIMARY_BUTTON_COLOR}`)
        expect(html).toContain(`--primary-button-label-color:${process.env.PRIMARY_BUTTON_LABEL_COLOR}`)
        expect(html).toContain(`--primary-button-border-color:${process.env.PRIMARY_BUTTON_BORDER_COLOR}`)
        expect(html).toContain(`--secondary-button-color:${process.env.SECONDARY_BUTTON_COLOR}`)
        expect(html).toContain(`--secondary-button-label-color:${process.env.SECONDARY_BUTTON_LABEL_COLOR}`)
        expect(html).toContain(`--secondary-button-border-color:${process.env.SECONDARY_BUTTON_BORDER_COLOR}`)
        expect(html).toContain(`--critical-indicator-color:${process.env.CRITICAL_INDICATOR_COLOR}`)
      },
    )

    test(
      'should override variables using org config',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        db.exec(`
        insert into "org" (
          name, slug, "companyLogoUrl", "layoutColor", "labelColor",
          "primaryButtonColor", "primaryButtonLabelColor", "primaryButtonBorderColor",
          "secondaryButtonColor", "secondaryButtonLabelColor", "secondaryButtonBorderColor",
          "criticalIndicatorColor", "fontUrl", "fontFamily", "termsLink", "privacyPolicyLink"
        ) values (
          'test', 'default', 'https://test.com', 'red', 'green', 'black', 'gray', 'orange', 'darkred', 'darkgray', 'blue', 'yellow',
          'http://font.com', 'Arial', 'https://terms.com', 'https://privacy.com'
        )
      `)

        const appRecord = await getApp(db)
        const res = await getSignInRequest(
          db,
          routeConfig.IdentityRoute.AuthorizeView,
          appRecord,
          '&org=default',
        )

        const html = await res.text()
        expect(html).toContain('logoUrl: "https://test.com"')
        expect(html).toContain('termsLink: "https://terms.com"')
        expect(html).toContain('privacyPolicyLink: "https://privacy.com"')
        expect(html).toContain('<link rel="icon" type="image/x-icon" href="https://test.com"/>')
        expect(html).toContain('<link href="http://font.com" rel="stylesheet"/>')
        expect(html).toContain('--layout-color:red')
        expect(html).toContain('--label-color:green')
        expect(html).toContain('--font-default:Arial')
        expect(html).toContain('--primary-button-color:black')
        expect(html).toContain('--primary-button-label-color:gray')
        expect(html).toContain('--primary-button-border-color:orange')
        expect(html).toContain('--secondary-button-color:darkred')
        expect(html).toContain('--secondary-button-label-color:darkgray')
        expect(html).toContain('--secondary-button-border-color:blue')
        expect(html).toContain('--critical-indicator-color:yellow')
      },
    )
  },
)
