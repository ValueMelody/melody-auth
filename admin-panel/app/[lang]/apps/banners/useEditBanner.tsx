import {
  useEffect,
  useMemo, useState,
} from 'react'
import { useTranslations } from 'next-intl'
import { LocaleValues } from 'components/LocaleEditor'
import { AppBanner } from 'services/auth/api'

const useEditBanner = (banner: AppBanner | undefined) => {
  const t = useTranslations()

  const [type, setType] = useState('')
  const [text, setText] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [appIds, setAppIds] = useState<number[]>([])
  const [locales, setLocales] = useState<
  { locale: string; value: string }[] | undefined
  >(undefined)

  useEffect(
    () => {
      setType(banner?.type ?? '')
      setText(banner?.text ?? '')
      setLocales(banner?.locales ?? undefined)
      setIsActive(banner?.isActive ?? true)
      setAppIds(banner?.appIds ?? [])
    },
    [banner],
  )

  const values = useMemo(
    () => ({
      type, text, locales, isActive, appIds,
    }),
    [type, text, locales, isActive, appIds],
  )

  const errors = useMemo(
    () => ({
      type: values.type.trim().length ? undefined : t('common.fieldIsRequired'),
      text: values.text.trim().length ? undefined : t('common.fieldIsRequired'),
    }),
    [values, t],
  )

  const onChange = (
    key: string, value: string | string[] | LocaleValues | boolean | number[] | undefined,
  ) => {
    switch (key) {
    case 'type':
      setType(value as string)
      break
    case 'text':
      setText(value as string)
      break
    case 'locales':
      setLocales(value as LocaleValues | undefined)
      break
    case 'isActive':
      setIsActive(value as boolean)
      break
    case 'appIds':
      setAppIds(value as number[])
      break
    }
  }

  return {
    values,
    errors,
    onChange,
  }
}

export default useEditBanner
