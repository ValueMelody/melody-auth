import {
  useEffect,
  useMemo, useState,
} from 'react'
import { useTranslations } from 'next-intl'
import { UserAttribute } from 'services/auth/api'
import { LocaleValues } from 'components/LocaleEditor'

const useEditUserAttribute = (userAttribute: UserAttribute | undefined) => {
  const t = useTranslations()

  const [name, setName] = useState('')
  const [includeInSignUpForm, setIncludeInSignUpForm] = useState(false)
  const [requiredInSignUpForm, setRequiredInSignUpForm] = useState(false)
  const [includeInIdTokenBody, setIncludeInIdTokenBody] = useState(false)
  const [includeInUserInfo, setIncludeInUserInfo] = useState(false)
  const [unique, setUnique] = useState(false)
  const [locales, setLocales] = useState<LocaleValues>([])
  const [validationRegex, setValidationRegex] = useState('')
  const [validationLocales, setValidationLocales] = useState<LocaleValues>([])

  useEffect(
    () => {
      setName(userAttribute?.name ?? '')
      setIncludeInSignUpForm(userAttribute?.includeInSignUpForm ?? false)
      setRequiredInSignUpForm(userAttribute?.requiredInSignUpForm ?? false)
      setIncludeInIdTokenBody(userAttribute?.includeInIdTokenBody ?? false)
      setIncludeInUserInfo(userAttribute?.includeInUserInfo ?? false)
      setUnique(userAttribute?.unique ?? false)
      setLocales(userAttribute?.locales ?? [])
      setValidationRegex(userAttribute?.validationRegex ?? '')
      setValidationLocales(userAttribute?.validationLocales ?? [])
    },
    [userAttribute],
  )

  const values = useMemo(
    () => ({
      name,
      includeInSignUpForm,
      requiredInSignUpForm,
      includeInIdTokenBody,
      includeInUserInfo,
      unique,
      locales,
      validationRegex,
      validationLocales,
    }),
    [
      name,
      includeInSignUpForm,
      requiredInSignUpForm,
      includeInIdTokenBody,
      includeInUserInfo,
      unique,
      locales,
      validationRegex,
      validationLocales,
    ],
  )

  const errors = useMemo(
    () => {
      let validationRegexError: string | undefined
      if (values.validationRegex.trim().length) {
        try {
          RegExp(values.validationRegex)
        } catch (error) {
          validationRegexError = t('userAttributes.invalidRegex')
        }
      }
      return {
        name: values.name.trim().length ? undefined : t('common.fieldIsRequired'),
        validationRegex: validationRegexError,
      }
    },
    [values, t],
  )

  const onChange = (
    key: string, value: string | boolean | string[] | LocaleValues,
  ) => {
    switch (key) {
    case 'name':
      setName(value as string)
      break
    case 'includeInSignUpForm':
      setIncludeInSignUpForm(value as boolean)
      break
    case 'requiredInSignUpForm':
      setRequiredInSignUpForm(value as boolean)
      break
    case 'includeInIdTokenBody':
      setIncludeInIdTokenBody(value as boolean)
      break
    case 'includeInUserInfo':
      setIncludeInUserInfo(value as boolean)
      break
    case 'unique':
      setUnique(value as boolean)
      break
    case 'locales':
      setLocales(value as LocaleValues)
      break
    case 'validationRegex':
      setValidationRegex(value as string)
      break
    case 'validationLocales':
      setValidationLocales(value as LocaleValues)
      break
    }
  }

  return {
    values,
    errors,
    onChange,
  }
}

export default useEditUserAttribute
