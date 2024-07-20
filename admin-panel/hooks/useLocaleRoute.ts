import { useMemo } from 'react'

import { useRouter } from 'next/navigation'
import useCurrentLocale from 'hooks/useCurrentLocale'

const useLocaleRouter = () => {
  const nextRouter = useRouter()
  const currentLocale = useCurrentLocale()

  const router = useMemo(
    () => ({
      ...nextRouter,
      push: (url: string) => {
        nextRouter.push(`/${currentLocale}${url.startsWith('/') ? url : `/${url}`}`)
      },
      replace: (url: string) => {
        nextRouter.replace(`/${currentLocale}${url.startsWith('/') ? url : `/${url}`}`)
      },
    }),
    [currentLocale, nextRouter],
  )

  return router
}

export default useLocaleRouter
