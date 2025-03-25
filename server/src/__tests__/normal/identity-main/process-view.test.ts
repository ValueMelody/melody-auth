import { Database } from 'better-sqlite3'
import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import {
  variableConfig, routeConfig,
} from 'configs'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  insertUsers, prepareFollowUpParams,
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
  'get /process-view',
  () => {
    test(
      'should show process view page',
      async () => {
        await insertUsers(db)

        const params = await prepareFollowUpParams(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.ProcessView}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()

        expect(html).toContain(`locales: "${(process.env.SUPPORTED_LOCALES as unknown as string[]).join(',')}"`)
        expect(html).toContain(`logoUrl: "${process.env.COMPANY_LOGO_URL}"`)
        expect(html).toContain(`enableLocaleSelector: ${process.env.ENABLE_LOCALE_SELECTOR}`)
        expect(html).toContain(`<link rel="icon" type="image/x-icon" href="${process.env.COMPANY_LOGO_URL}"/>`)
        expect(html).toContain(`<link href="${variableConfig.DefaultBranding.FontUrl?.replace(
          '&',
          '&amp;',
        )}" rel="stylesheet"/>`)
        expect(html).toContain(`--layout-color:${variableConfig.DefaultBranding.LayoutColor}`)
        expect(html).toContain(`--label-color:${variableConfig.DefaultBranding.LabelColor}`)
        expect(html).toContain(`--font-default:${variableConfig.DefaultBranding.FontFamily}`)
        expect(html).toContain(`--primary-button-color:${variableConfig.DefaultBranding.PrimaryButtonColor}`)
        expect(html).toContain(`--primary-button-label-color:${variableConfig.DefaultBranding.PrimaryButtonLabelColor}`)
        expect(html).toContain(`--primary-button-border-color:${variableConfig.DefaultBranding.PrimaryButtonBorderColor}`)
        expect(html).toContain(`--secondary-button-color:${variableConfig.DefaultBranding.SecondaryButtonColor}`)
        expect(html).toContain(`--secondary-button-label-color:${variableConfig.DefaultBranding.SecondaryButtonLabelColor}`)
        expect(html).toContain(`--secondary-button-border-color:${variableConfig.DefaultBranding.SecondaryButtonBorderColor}`)
        expect(html).toContain(`--critical-indicator-color:${variableConfig.DefaultBranding.CriticalIndicatorColor}`)
      },
    )

    test(
      'should redirect when auth code is expired',
      async () => {
        await insertUsers(db)

        await prepareFollowUpParams(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.ProcessView}?code=abc`,
          {},
          mock(db),
        )

        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpiredView}?locale=en`)
      },
    )

    test(
      'should redirect when code not provided',
      async () => {
        await insertUsers(db)

        await prepareFollowUpParams(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.ProcessView}`,
          {},
          mock(db),
        )

        expect(res.status).toBe(400)
        const json = await res.json() as {
          constraints: {
            isNotEmpty: string;
          };
        }[]
        expect(json[0].constraints).toStrictEqual({ isNotEmpty: 'code should not be empty' })
      },
    )
  },
)
