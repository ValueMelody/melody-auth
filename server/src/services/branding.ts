import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import { Branding } from 'views/components/Layout'

export const getDefaultBranding = (c: Context<typeConfig.Context>): Branding => {
  const {
    COMPANY_LOGO_URL: logoUrl,
    FONT_FAMILY: fontFamily,
    FONT_URL: fontUrl,
    LAYOUT_COLOR: layoutColor,
    LABEL_COLOR: labelColor,
    PRIMARY_BUTTON_COLOR: primaryButtonColor,
    PRIMARY_BUTTON_LABEL_COLOR: primaryButtonLabelColor,
    PRIMARY_BUTTON_BORDER_COLOR: primaryButtonBorderColor,
    SECONDARY_BUTTON_COLOR: secondaryButtonColor,
    SECONDARY_BUTTON_LABEL_COLOR: secondaryButtonLabelColor,
    SECONDARY_BUTTON_BORDER_COLOR: secondaryButtonBorderColor,
    CRITICAL_INDICATOR_COLOR: criticalIndicatorColor,
  } = env(c)
  return {
    logoUrl,
    fontFamily,
    fontUrl,
    layoutColor,
    labelColor,
    primaryButtonColor,
    primaryButtonLabelColor,
    primaryButtonBorderColor,
    secondaryButtonColor,
    secondaryButtonLabelColor,
    secondaryButtonBorderColor,
    criticalIndicatorColor,
  }
}
