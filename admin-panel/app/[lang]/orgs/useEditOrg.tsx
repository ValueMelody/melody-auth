import {
  useEffect,
  useMemo, useState,
} from 'react'
import { useTranslations } from 'next-intl'
import { Org } from 'services/auth/api'

const useEditOrg = (org: Org | undefined) => {
  const t = useTranslations()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true)
  const [onlyUseForBrandingOverride, setOnlyUseForBrandingOverride] = useState(false)
  const [companyLogoUrl, setCompanyLogoUrl] = useState('')
  const [companyEmailLogoUrl, setCompanyEmailLogoUrl] = useState('')
  const [fontFamily, setFontFamily] = useState('')
  const [fontUrl, setFontUrl] = useState('')
  const [layoutColor, setLayoutColor] = useState('')
  const [labelColor, setLabelColor] = useState('')
  const [primaryButtonColor, setPrimaryButtonColor] = useState('')
  const [primaryButtonLabelColor, setPrimaryButtonLabelColor] = useState('')
  const [primaryButtonBorderColor, setPrimaryButtonBorderColor] = useState('')
  const [secondaryButtonColor, setSecondaryButtonColor] = useState('')
  const [secondaryButtonLabelColor, setSecondaryButtonLabelColor] = useState('')
  const [secondaryButtonBorderColor, setSecondaryButtonBorderColor] = useState('')
  const [criticalIndicatorColor, setCriticalIndicatorColor] = useState('')
  const [termsLink, setTermsLink] = useState('')
  const [privacyPolicyLink, setPrivacyPolicyLink] = useState('')
  const [customDomain, setCustomDomain] = useState('')

  useEffect(
    () => {
      setName(org?.name ?? '')
      setSlug(org?.slug ?? '')
      setAllowPublicRegistration(org?.allowPublicRegistration ?? true)
      setOnlyUseForBrandingOverride(org?.onlyUseForBrandingOverride ?? false)
      setCompanyLogoUrl(org?.companyLogoUrl ?? '')
      setCompanyEmailLogoUrl(org?.companyEmailLogoUrl ?? '')
      setFontFamily(org?.fontFamily ?? '')
      setFontUrl(org?.fontUrl ?? '')
      setLayoutColor(org?.layoutColor ?? '')
      setLabelColor(org?.labelColor ?? '')
      setPrimaryButtonColor(org?.primaryButtonColor ?? '')
      setPrimaryButtonLabelColor(org?.primaryButtonLabelColor ?? '')
      setPrimaryButtonBorderColor(org?.primaryButtonBorderColor ?? '')
      setSecondaryButtonColor(org?.secondaryButtonColor ?? '')
      setSecondaryButtonLabelColor(org?.secondaryButtonLabelColor ?? '')
      setSecondaryButtonBorderColor(org?.secondaryButtonBorderColor ?? '')
      setCriticalIndicatorColor(org?.criticalIndicatorColor ?? '')
      setTermsLink(org?.termsLink ?? '')
      setPrivacyPolicyLink(org?.privacyPolicyLink ?? '')
      setCustomDomain(org?.customDomain ?? '')
    },
    [org],
  )

  const values = useMemo(
    () => ({
      name,
      slug,
      allowPublicRegistration,
      onlyUseForBrandingOverride,
      companyLogoUrl,
      companyEmailLogoUrl,
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
      customDomain,
    }),
    [
      name,
      slug,
      allowPublicRegistration,
      onlyUseForBrandingOverride,
      companyLogoUrl,
      companyEmailLogoUrl,
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
      customDomain,
    ],
  )

  const errors = useMemo(
    () => ({
      name: values.name.trim().length ? undefined : t('common.fieldIsRequired'),
      slug: values.slug.trim().length ? undefined : t('common.fieldIsRequired'),
    }),
    [values, t],
  )

  const onChange = (
    key: string, value: string | boolean | string[],
  ) => {
    switch (key) {
    case 'name':
      setName(value as string)
      break
    case 'slug':
      setSlug(value as string)
      break
    case 'allowPublicRegistration':
      setAllowPublicRegistration(value as boolean)
      break
    case 'onlyUseForBrandingOverride':
      setOnlyUseForBrandingOverride(value as boolean)
      break
    case 'companyLogoUrl':
      setCompanyLogoUrl(value as string)
      break
    case 'companyEmailLogoUrl':
      setCompanyEmailLogoUrl(value as string)
      break
    case 'fontFamily':
      setFontFamily(value as string)
      break
    case 'fontUrl':
      setFontUrl(value as string)
      break
    case 'layoutColor':
      setLayoutColor(value as string)
      break
    case 'labelColor':
      setLabelColor(value as string)
      break
    case 'primaryButtonColor':
      setPrimaryButtonColor(value as string)
      break
    case 'primaryButtonLabelColor':
      setPrimaryButtonLabelColor(value as string)
      break
    case 'primaryButtonBorderColor':
      setPrimaryButtonBorderColor(value as string)
      break
    case 'secondaryButtonColor':
      setSecondaryButtonColor(value as string)
      break
    case 'secondaryButtonLabelColor':
      setSecondaryButtonLabelColor(value as string)
      break
    case 'secondaryButtonBorderColor':
      setSecondaryButtonBorderColor(value as string)
      break
    case 'criticalIndicatorColor':
      setCriticalIndicatorColor(value as string)
      break
    case 'termsLink':
      setTermsLink(value as string)
      break
    case 'privacyPolicyLink':
      setPrivacyPolicyLink(value as string)
      break
    case 'customDomain':
      setCustomDomain(value as string)
      break
    }
  }

  return {
    values,
    errors,
    onChange,
  }
}

export default useEditOrg
