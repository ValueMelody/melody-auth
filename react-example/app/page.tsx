'use client'

import {
  useAuth, UserInfo,
} from '@melody-auth/react'
import { useState } from 'react'

export default function Home () {
  const [acquiredToken, setAcquiredToken] = useState('')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  const {
    loginRedirect, accessToken, refreshToken, acquireToken,
    logoutRedirect, acquireUserInfo, isAuthenticated, isAuthenticating,
  } = useAuth()

  const handleClick = () => {
    loginRedirect()
  }

  const handleClickAcquireToken = async () => {
    const token = await acquireToken()
    setAcquiredToken(token)
  }

  const handleLogout = () => {
    logoutRedirect({ postLogoutRedirectUri: 'http://localhost:3000/' })
  }

  const handleClickAcquireUserInfo = async () => {
    const userInfo = await acquireUserInfo()
    setUserInfo(userInfo)
  }

  return (
    <main
      style={{
        display: 'flex', flexDirection: 'column', gap: 16,
      }}
    >
      <section>
        <button onClick={handleClick}>
          Login
        </button>
      </section>
      <section>
        <p>IsAuthenticated: {isAuthenticated ? 'True' : 'False'}</p>
        <p>IsAuthenticating: {isAuthenticating ? 'True' : 'False'}</p>
      </section>
      <section>
        {accessToken && <p>Access Token: {accessToken}</p>}
        {refreshToken && <p>Refresh Token: {refreshToken}</p>}
      </section>
      <section>
        <button onClick={handleClickAcquireToken}>
          Acquire Token
        </button>
        {acquiredToken && <p>{acquiredToken}</p>}
      </section>
      <section>
        <button onClick={handleClickAcquireUserInfo}>
          Acquire User Info
        </button>
        {userInfo && (
          <p>
            {JSON.stringify(userInfo)}
          </p>
        )}
      </section>
      <section>
        <button onClick={handleLogout}>
          Logout
        </button>
      </section>
    </main>
  )
}
