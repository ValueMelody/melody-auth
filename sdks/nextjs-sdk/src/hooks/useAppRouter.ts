import { useRouter as useNextAppRouter } from 'next/navigation'

/**
 * App Router hook for Next.js 13.4+
 * Use this for applications using the App Router
 */
export function useAppRouter () {
  return useNextAppRouter()
}
