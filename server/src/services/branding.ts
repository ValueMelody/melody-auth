import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import { Branding } from 'views/components/Layout'

export const getDefaultBranding = (c: Context<typeConfig.Context>): Branding => {
  const {
    COMPANY_LOGO_URL: logoUrl,
    BG_COLOR: bgColor,
    PRIMARY_BUTTON_BG_COLOR: primaryButtonBgColor,
    PRIMARY_BUTTON_FG_COLOR: primaryButtonFgColor,
  } = env(c)

  return {
    logoUrl,
    bgColor,
    primaryButtonBgColor,
    primaryButtonFgColor,
  }
}
