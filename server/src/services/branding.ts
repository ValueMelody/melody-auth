import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  brandingConfig, typeConfig,
} from 'configs'
import { orgModel } from 'models'

export interface Branding {
  logoUrl: string;
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
    TERMS_LINK: termsLink,
    PRIVACY_POLICY_LINK: privacyPolicyLink,
  } = env(c)
  return {
    fontFamily: brandingConfig.DefaultBranding.FontFamily,
    fontUrl: brandingConfig.DefaultBranding.FontUrl,
    layoutColor: brandingConfig.DefaultBranding.LayoutColor,
    labelColor: brandingConfig.DefaultBranding.LabelColor,
    primaryButtonColor: brandingConfig.DefaultBranding.PrimaryButtonColor,
    primaryButtonLabelColor: brandingConfig.DefaultBranding.PrimaryButtonLabelColor,
    primaryButtonBorderColor: brandingConfig.DefaultBranding.PrimaryButtonBorderColor,
    secondaryButtonColor: brandingConfig.DefaultBranding.SecondaryButtonColor,
    secondaryButtonLabelColor: brandingConfig.DefaultBranding.SecondaryButtonLabelColor,
    secondaryButtonBorderColor: brandingConfig.DefaultBranding.SecondaryButtonBorderColor,
    criticalIndicatorColor: brandingConfig.DefaultBranding.CriticalIndicatorColor,
    termsLink,
    privacyPolicyLink,
    logoUrl,
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
