'use client'

import { useEffect } from 'react'
import { useAuth } from '@melody-auth/react'
import { useRouter } from 'i18n/navigation'
import { routeTool } from 'tools'

export default function Home () {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(
    () => {
      if (isAuthenticated) router.push(routeTool.Internal.Dashboard)
    },
    [isAuthenticated, router],
  )

  return (
    <section></section>
  )
}
