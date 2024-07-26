import {
  useEffect,
  useMemo, useState,
} from 'react'
import { useTranslations } from 'next-intl'

const useEditScope = (scope) => {
  const t = useTranslations()

  const [name, setName] = useState('')
  const [type, setType] = useState('')

  useEffect(
    () => {
      setName(scope?.name ?? '')
      setType(scope?.type ?? '')
    },
    [scope],
  )

  const values = useMemo(
    () => ({
      name, type,
    }),
    [name, type],
  )

  const errors = useMemo(
    () => ({
      name: values.name.trim().length ? undefined : t('common.fieldIsRequired'),
      type: values.type.trim().length ? undefined : t('common.fieldIsRequired'),
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
    }
  }

  return {
    values,
    errors,
    onChange,
  }
}

export default useEditScope
