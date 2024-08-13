'use client'

import { useEffect } from "react"
import { useAuth } from "@melody-auth/react"
import useLocaleRouter from "hooks/useLocaleRoute"
import { routeTool } from "tools"

export default function Home () {
  const { isAuthenticated } = useAuth()
  const router = useLocaleRouter()

  useEffect(() => {
    if (isAuthenticated) router.push(routeTool.Internal.Dashboard)
  }, [isAuthenticated, router])

  return (
    <section></section>
  )
}
