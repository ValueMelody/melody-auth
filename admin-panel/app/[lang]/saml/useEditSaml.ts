import {
  useEffect,
  useMemo, useState,
} from 'react'
import { useTranslations } from 'next-intl'
import { SamlIdp } from 'services/auth/api'

const useEditSaml = (idp: SamlIdp | undefined) => {
  const t = useTranslations()

  const [userIdAttribute, setUserIdAttribute] = useState('')
  const [emailAttribute, setEmailAttribute] = useState('')
  const [firstNameAttribute, setFirstNameAttribute] = useState('')
  const [lastNameAttribute, setLastNameAttribute] = useState('')
  const [metadata, setMetadata] = useState('')

  useEffect(
    () => {
      setUserIdAttribute(idp?.userIdAttribute ?? '')
      setEmailAttribute(idp?.emailAttribute ?? '')
      setFirstNameAttribute(idp?.firstNameAttribute ?? '')
      setLastNameAttribute(idp?.lastNameAttribute ?? '')
      setMetadata(idp?.metadata ?? '')
    },
    [idp],
  )

  const values = useMemo(
    () => ({
      userIdAttribute, emailAttribute, firstNameAttribute, lastNameAttribute, metadata,
    }),
    [userIdAttribute, emailAttribute, firstNameAttribute, lastNameAttribute, metadata],
  )

  const errors = useMemo(
    () => ({
      userIdAttribute: values.userIdAttribute.trim().length ? undefined : t('common.fieldIsRequired'),
      metadata: values.metadata.trim().length ? undefined : t('common.fieldIsRequired'),
    }),
    [values, t],
  )

  const onChange = (
    key: string, value: string | string[],
  ) => {
    switch (key) {
    case 'userIdAttribute':
      setUserIdAttribute(value as string)
      break
    case 'emailAttribute':
      setEmailAttribute(value as string)
      break
    case 'firstNameAttribute':
      setFirstNameAttribute(value as string)
      break
    case 'lastNameAttribute':
      setLastNameAttribute(value as string)
      break
    case 'metadata':
      setMetadata(value as string)
      break
    }
  }

  return {
    values,
    errors,
    onChange,
  }
}

export default useEditSaml
