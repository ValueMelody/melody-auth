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
    TERMS_LINK: termsLink,
    PRIVACY_POLICY_LINK: privacyPolicyLink,
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
    termsLink,
    privacyPolicyLink,
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
    fontFamily: org?.fontFamily || defaultBranding.fontFamily,
    fontUrl: org?.fontUrl || defaultBranding.fontUrl,
    logoUrl: org?.companyLogoUrl || defaultBranding.logoUrl,
    layoutColor: org?.layoutColor || defaultBranding.layoutColor,
    labelColor: org?.labelColor || defaultBranding.labelColor,
    primaryButtonColor: org?.primaryButtonColor || defaultBranding.primaryButtonColor,
    primaryButtonLabelColor: org?.primaryButtonLabelColor || defaultBranding.primaryButtonLabelColor,
    primaryButtonBorderColor: org?.primaryButtonBorderColor || defaultBranding.primaryButtonBorderColor,
    secondaryButtonColor: org?.secondaryButtonColor || defaultBranding.secondaryButtonColor,
    secondaryButtonLabelColor: org?.secondaryButtonLabelColor || defaultBranding.secondaryButtonLabelColor,
    secondaryButtonBorderColor: org?.secondaryButtonBorderColor || defaultBranding.secondaryButtonBorderColor,
    criticalIndicatorColor: org?.criticalIndicatorColor || defaultBranding.criticalIndicatorColor,
    termsLink: org?.termsLink || defaultBranding.termsLink,
    privacyPolicyLink: org?.privacyPolicyLink || defaultBranding.privacyPolicyLink,
  }
}
