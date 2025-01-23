import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import { Branding } from 'views/components/Layout'
import { orgModel } from 'models'

const getDefaultBranding = (c: Context<typeConfig.Context>): Branding => {
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

export const getBranding = async (
  c: Context<typeConfig.Context>, orgSlug?: string | null,
): Promise<Branding> => {
  const { ENABLE_ORG: enableOrg } = env(c)

  const org = orgSlug && enableOrg
    ? await orgModel.getBySlug(
      c.env.DB,
      orgSlug,
    )
    : null

  const defaultBranding = getDefaultBranding(c)
  return {
    ...defaultBranding,
    logoUrl: org?.companyLogoUrl || defaultBranding.logoUrl,
  }
}
