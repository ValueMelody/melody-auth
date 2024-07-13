'use client'

import { useOauth } from '@melody-oauth/react'

export default function Home () {
  const {
    loginRedirect, accessToken, refreshToken,
  } = useOauth()

  const handleClick = () => {
    loginRedirect()
  }

  return (
    <main>
      <button onClick={handleClick}>
        Login
      </button>
      <section>
        {accessToken && <p>Access Token: {accessToken}</p>}
        {refreshToken && <p>Refresh Token: {refreshToken}</p>}
      </section>
    </main>
  )
}
