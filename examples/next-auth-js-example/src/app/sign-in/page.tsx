'use client'

import { BuiltInProviderType } from 'next-auth/providers/index'
import {
  ClientSafeProvider,
  getProviders, LiteralUnion, signIn,
} from 'next-auth/react'
import {
  useEffect, useState,
} from 'react'

export default function SignInButtons () {
  const [providers, setProviders] = useState<
    Record<LiteralUnion<BuiltInProviderType, string
  >, ClientSafeProvider> | null>(null)

  useEffect(
    () => {
      const fetchProviders = async () => {
        const res = await getProviders()
        setProviders(res)
      }
      fetchProviders()
    },
    [],
  )

  if (!providers) return null

  return (
    <section>
      {Object.values(providers).map((provider) => (
        <button
          key={provider.id}
          onClick={() => signIn(provider.id)}>
          Sign in with {provider.name}
        </button>
      ))}
    </section>
  )
}
