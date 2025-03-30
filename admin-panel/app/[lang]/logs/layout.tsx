'use client'

import { useAuth } from '@melody-auth/react'
import { useEffect } from 'react'
import { accessTool } from 'tools'
import { useRouter } from 'i18n/navigation'

export default function Layout ({ children }: {
  children: React.ReactNode;
}) {
  const { userInfo } = useAuth()
  const router = useRouter()

  useEffect(
    () => {
      const canAccess = accessTool.isAllowedAccess(
        accessTool.Access.ReadLog,
        userInfo?.roles,
      )
      if (!canAccess) {
        router.push('/')
      }
    },
    [userInfo, router],
  )

  return children
}
