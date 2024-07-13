'use client'

import { useOauth } from '@melody-oauth/react'

export default function Home () {
  const { loginRedirect } = useOauth()

  const handleClick = () => {
    loginRedirect()
  }

  return (
    <main>
      <button onClick={handleClick}>
        Login
      </button>
    </main>
  )
}
