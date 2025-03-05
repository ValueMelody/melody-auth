import { Database } from 'better-sqlite3'
import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import {
  brandingConfig, routeConfig,
} from 'configs'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  'get /auth-code-expired',
  () => {
    test(
      'should show auth code expired page',
      async () => {
        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthCodeExpiredView}?locale=en`,
          {},
          mock(db),
        )

        const html = await res.text()

        expect(html).toContain(`locales: "${(process.env.SUPPORTED_LOCALES as unknown as string[]).join(',')}"`)
        expect(html).toContain(`logoUrl: "${process.env.COMPANY_LOGO_URL}"`)
        expect(html).toContain(`enableLocaleSelector: ${process.env.ENABLE_LOCALE_SELECTOR}`)
        expect(html).toContain(`<link rel="icon" type="image/x-icon" href="${process.env.COMPANY_LOGO_URL}"/>`)
        expect(html).toContain(`<link href="${brandingConfig.DefaultBranding.FontUrl?.replace(
          '&',
          '&amp;',
        )}" rel="stylesheet"/>`)
        expect(html).toContain(`--layout-color:${brandingConfig.DefaultBranding.LayoutColor}`)
        expect(html).toContain(`--label-color:${brandingConfig.DefaultBranding.LabelColor}`)
        expect(html).toContain(`--font-default:${brandingConfig.DefaultBranding.FontFamily}`)
        expect(html).toContain(`--primary-button-color:${brandingConfig.DefaultBranding.PrimaryButtonColor}`)
        expect(html).toContain(`--primary-button-label-color:${brandingConfig.DefaultBranding.PrimaryButtonLabelColor}`)
        expect(html).toContain(`--primary-button-border-color:${brandingConfig.DefaultBranding.PrimaryButtonBorderColor}`)
        expect(html).toContain(`--secondary-button-color:${brandingConfig.DefaultBranding.SecondaryButtonColor}`)
        expect(html).toContain(`--secondary-button-label-color:${brandingConfig.DefaultBranding.SecondaryButtonLabelColor}`)
        expect(html).toContain(`--secondary-button-border-color:${brandingConfig.DefaultBranding.SecondaryButtonBorderColor}`)
        expect(html).toContain(`--critical-indicator-color:${brandingConfig.DefaultBranding.CriticalIndicatorColor}`)
      },
    )
  },
)
