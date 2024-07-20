import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

const useCurrentLocale = () => {
  const pathname = usePathname()
  const currentLocale = useMemo(
    () => pathname.split('/')[1],
    [pathname],
  )
  return currentLocale
}

export default useCurrentLocale
