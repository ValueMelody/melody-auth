import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  variableConfig, typeConfig,
} from 'configs'
import { orgModel } from 'models'

export interface Branding {
  logoUrl: string;
  emailLogoUrl: string;
  fontFamily: string;
  fontUrl: string;
  layoutColor: string;
  labelColor: string;
  primaryButtonColor: string;
  primaryButtonLabelColor: string;
  primaryButtonBorderColor: string;
  secondaryButtonColor: string;
  secondaryButtonLabelColor: string;
  secondaryButtonBorderColor: string;
  criticalIndicatorColor: string;
  termsLink: string;
  privacyPolicyLink: string;
}

const getDefaultBranding = (c: Context<typeConfig.Context>): Branding => {
  const {
    COMPANY_LOGO_URL: logoUrl,
    COMPANY_EMAIL_LOGO_URL: emailLogoUrl,
    TERMS_LINK: termsLink,
    PRIVACY_POLICY_LINK: privacyPolicyLink,
  } = env(c)
  return {
    fontFamily: variableConfig.DefaultBranding.FontFamily,
    fontUrl: variableConfig.DefaultBranding.FontUrl,
    layoutColor: variableConfig.DefaultBranding.LayoutColor,
    labelColor: variableConfig.DefaultBranding.LabelColor,
    primaryButtonColor: variableConfig.DefaultBranding.PrimaryButtonColor,
    primaryButtonLabelColor: variableConfig.DefaultBranding.PrimaryButtonLabelColor,
    primaryButtonBorderColor: variableConfig.DefaultBranding.PrimaryButtonBorderColor,
    secondaryButtonColor: variableConfig.DefaultBranding.SecondaryButtonColor,
    secondaryButtonLabelColor: variableConfig.DefaultBranding.SecondaryButtonLabelColor,
    secondaryButtonBorderColor: variableConfig.DefaultBranding.SecondaryButtonBorderColor,
    criticalIndicatorColor: variableConfig.DefaultBranding.CriticalIndicatorColor,
    termsLink,
    privacyPolicyLink,
    logoUrl,
    emailLogoUrl,
  }
}

export const getBranding = async (
  c: Context<typeConfig.Context>, orgSlug?: string | null,
): Promise<Branding> => {
  const { ENABLE_ORG: enableOrg } = env(c)

  const orgData = orgSlug && enableOrg
    ? await orgModel.getBySlug(
      c.env.DB,
      orgSlug,
    )
    : null

  const org = orgData && orgData.allowPublicRegistration ? orgData : null

  const defaultBranding = getDefaultBranding(c)
  return {
    ...defaultBranding,
    fontFamily: org?.fontFamily || defaultBranding.fontFamily,
    fontUrl: org?.fontUrl || defaultBranding.fontUrl,
    logoUrl: org?.companyLogoUrl || defaultBranding.logoUrl,
    emailLogoUrl: org?.companyEmailLogoUrl || defaultBranding.emailLogoUrl,
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
