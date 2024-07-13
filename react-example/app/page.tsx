'use client'

import { useOauth } from '@melody-oauth/react'
import { useState } from 'react'

export default function Home () {
  const [acquiredToken, setAcquiredToken] = useState('')

  const {
    loginRedirect, accessToken, refreshToken, acquireToken,
  } = useOauth()

  const handleClick = () => {
    loginRedirect()
  }

  const handleClickAcquireToken = async () => {
    const token = await acquireToken()
    setAcquiredToken(token)
  }

  return (
    <main>
      <button onClick={handleClick}>
        Login
      </button>
      <section>
        {accessToken && <p>Access Token: {accessToken}</p>}
        {refreshToken && <p>Refresh Token: {refreshToken}</p>}
        {accessToken && (
          <div>
            <button onClick={handleClickAcquireToken}>
              Acquire Token
            </button>
            {acquiredToken && <p>{acquiredToken}</p>}
          </div>
        )}
      </section>
    </main>
  )
}
