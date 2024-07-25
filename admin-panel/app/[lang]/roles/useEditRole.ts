import {
  useEffect,
  useMemo, useState,
} from 'react'
import { useTranslations } from 'next-intl'

const useEditRole = (role) => {
  const t = useTranslations()

  const [name, setName] = useState('')

  useEffect(
    () => {
      setName(role?.name ?? '')
    },
    [role],
  )

  const values = useMemo(
    () => ({ name }),
    [name],
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
    }
  }

  return {
    values,
    errors,
    onChange,
  }
}

export default useEditRole
