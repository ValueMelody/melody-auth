import {
  useEffect,
  useMemo, useState,
} from 'react'
import { useTranslations } from 'next-intl'
import { Org } from 'services/auth/api'

const useEditOrg = (org: Org | undefined) => {
  const t = useTranslations()

  const [name, setName] = useState('')
  const [companyLogoUrl, setCompanyLogoUrl] = useState('')
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

  useEffect(
    () => {
      setName(org?.name ?? '')
      setCompanyLogoUrl(org?.companyLogoUrl ?? '')
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
    },
    [org],
  )

  const values = useMemo(
    () => ({
      name,
      companyLogoUrl,
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
    }),
    [
      name,
      companyLogoUrl,
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
    ],
  )

  const errors = useMemo(
    () => ({ name: values.name.trim().length ? undefined : t('common.fieldIsRequired') }),
    [values, t],
  )

  const onChange = (
    key: string, value: string | string[],
  ) => {
    switch (key) {
    case 'name':
      setName(value as string)
      break
    case 'companyLogoUrl':
      setCompanyLogoUrl(value as string)
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
    }
  }

  return {
    values,
    errors,
    onChange,
  }
}

export default useEditOrg
