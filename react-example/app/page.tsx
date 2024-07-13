'use client'

import { useOauth } from '@melody-oauth/react'
import { useState } from 'react'

export default function Home () {
  const [acquiredToken, setAcquiredToken] = useState('')

  const {
    loginRedirect, accessToken, refreshToken, acquireToken,
    logoutRedirect,
  } = useOauth()

  const handleClick = () => {
    loginRedirect()
  }

  const handleClickAcquireToken = async () => {
    const token = await acquireToken()
    setAcquiredToken(token)
  }

  const handleLogout = () => {
    logoutRedirect({ postLogoutRedirectUri: '/' })
  }

  return (
    <main
      style={{
        display: 'flex', flexDirection: 'column', gap: 16,
      }}
    >
      <div>
        <button onClick={handleClick}>
          Login
        </button>
      </div>
      <section>
        {accessToken && <p>Access Token: {accessToken}</p>}
        {refreshToken && <p>Refresh Token: {refreshToken}</p>}
        <div>
          <button onClick={handleClickAcquireToken}>
            Acquire Token
          </button>
          {acquiredToken && <p>{acquiredToken}</p>}
        </div>
      </section>
      <div>
        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </main>
  )
}
