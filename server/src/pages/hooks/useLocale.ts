import {
  useCallback, useState,
} from 'hono/jsx'
import { typeConfig } from 'configs'

const useLocale = ({ initialLocale }: {
  initialLocale: typeConfig.Locale;
}) => {
  const [locale, setLocale] = useState(initialLocale)

  const handleSwitchLocale = useCallback(
    (locale: typeConfig.Locale) => {
      setLocale(locale)
      const url = new URL(window.location.href)
      url.searchParams.set(
        'locale',
        locale,
      )
      window.history.pushState(
        {},
        '',
        url,
      )
    },
    [],
  )

  return {
    locale,
    handleSwitchLocale,
  }
}

export default useLocale
