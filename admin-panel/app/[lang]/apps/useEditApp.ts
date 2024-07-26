import {
  useMemo, useState,
} from 'react'
import { useTranslations } from 'next-intl'

const useEditApp = () => {
  const t = useTranslations()

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [scopes, setScopes] = useState<string[]>([])
  const [redirectUris, setRedirectUris] = useState([''])

  const values = useMemo(
    () => ({
      name, type, scopes, redirectUris,
    }),
    [name, type, scopes, redirectUris],
  )

  const errors = useMemo(
    () => ({
      name: values.name.trim().length ? undefined : t('common.fieldIsRequired'),
      type: values.type ? undefined : t('common.fieldIsRequired'),
      scopes: values.scopes.length ? undefined : t('common.fieldIsRequired'),
    }),
    [values, t],
  )

  const onChange = (
    key: string, value: string | string[],
  ) => {
    switch (key) {
    case 'name':
      setName(value as string)
      break
    case 'type':
      setType(value as string)
      break
    case 'scopes':
      setScopes(value as string[])
      break
    case 'redirectUris':
      setRedirectUris(value as string[])
      break
    }
  }

  return {
    values,
    errors,
    onChange,
  }
}

export default useEditApp
