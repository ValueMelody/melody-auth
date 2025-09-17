import { useRouter as useNextPagesRouter } from 'next/router'

/**
 * Pages Router hook for Next.js 12-13.3
 * Use this for applications using the Pages Router
 */
export function usePagesRouter () {
  return useNextPagesRouter()
}
