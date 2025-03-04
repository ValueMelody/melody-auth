import { Database } from 'better-sqlite3'
import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { routeConfig } from 'configs'
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
  },
)
