import { useMemo } from 'hono/jsx'
import { parse } from 'qs'
import { typeConfig } from 'configs'
const useInitialProps = () => {
  const initialProps = useMemo(
    () => {
      const params = parse(
        window.location.search,
        { ignoreQueryPrefix: true },
      )

      const intialProps = (
        '__initialProps' in window &&
        typeof window.__initialProps === 'object' &&
        !!window.__initialProps
      )
        ? window.__initialProps
        : {
          locales: [],
          logoUrl: '',
        }

      return {
        locales: 'locales' in intialProps ? String(intialProps.locales).split(',') : [],
        logoUrl: 'logoUrl' in intialProps ? String(intialProps.logoUrl) : '',
        locale: 'locale' in params ? String(params.locale) : '',
        enableLocaleSelector: 'enableLocaleSelector' in intialProps ? Boolean(intialProps.enableLocaleSelector) : false,
      } as {
        locales: typeConfig.Locale[];
        logoUrl: string;
        locale: typeConfig.Locale;
        enableLocaleSelector: boolean;
      }
    },
    [],
  )

  return { initialProps }
}

export default useInitialProps
