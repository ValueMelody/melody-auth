import {
  useEffect,
  useMemo, useState,
} from 'react'
import { useTranslations } from 'next-intl'

const useEditRole = (role) => {
  const t = useTranslations()

  const [name, setName] = useState('')
  const [note, setNote] = useState('')

  useEffect(
    () => {
      setName(role?.name ?? '')
      setNote(role?.note ?? '')
    },
    [role],
  )

  const values = useMemo(
    () => ({
      name, note,
    }),
    [name, note],
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
    case 'note':
      setNote(value as string)
      break
    }
  }

  return {
    values,
    errors,
    onChange,
  }
}

export default useEditRole
