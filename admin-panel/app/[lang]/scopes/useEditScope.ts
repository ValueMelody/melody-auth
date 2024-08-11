import {
  useEffect,
  useMemo, useState,
} from 'react'
import { useTranslations } from 'next-intl'

const useEditScope = (scope) => {
  const t = useTranslations()

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [note, setNote] = useState('')
  const [locales, setLocales] = useState(undefined)

  useEffect(
    () => {
      setName(scope?.name ?? '')
      setType(scope?.type ?? '')
      setNote(scope?.note ?? '')
      setLocales(scope?.locales ?? undefined)
    },
    [scope],
  )

  const values = useMemo(
    () => ({
      name, type, note, locales,
    }),
    [name, type, note, locales],
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
    case 'note':
      setNote(value as string)
      break
    case 'locales':
      setLocales(value)
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
