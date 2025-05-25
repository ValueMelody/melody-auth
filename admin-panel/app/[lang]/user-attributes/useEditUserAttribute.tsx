import {
  useEffect,
  useMemo, useState,
} from 'react'
import { useTranslations } from 'next-intl'
import { UserAttribute } from 'services/auth/api'

const useEditUserAttribute = (userAttribute: UserAttribute | undefined) => {
  const t = useTranslations()

  const [name, setName] = useState('')
  const [includeInSignUpForm, setIncludeInSignUpForm] = useState(false)
  const [requiredInSignUpForm, setRequiredInSignUpForm] = useState(false)
  const [includeInIdTokenBody, setIncludeInIdTokenBody] = useState(false)
  const [includeInUserInfo, setIncludeInUserInfo] = useState(false)

  useEffect(
    () => {
      setName(userAttribute?.name ?? '')
      setIncludeInSignUpForm(userAttribute?.includeInSignUpForm ?? false)
      setRequiredInSignUpForm(userAttribute?.requiredInSignUpForm ?? false)
      setIncludeInIdTokenBody(userAttribute?.includeInIdTokenBody ?? false)
      setIncludeInUserInfo(userAttribute?.includeInUserInfo ?? false)
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
    }),
    [
      name,
      includeInSignUpForm,
      requiredInSignUpForm,
      includeInIdTokenBody,
      includeInUserInfo,
    ],
  )

  const errors = useMemo(
    () => ({ name: values.name.trim().length ? undefined : t('common.fieldIsRequired') }),
    [values, t],
  )

  const onChange = (
    key: string, value: string | boolean | string[],
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
    }
  }

  return {
    values,
    errors,
    onChange,
  }
}

export default useEditUserAttribute
