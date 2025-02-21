import {
  AuthProvider, useAuth,
} from '@melody-auth/react'
import { useState, useEffect } from 'react'

const AuthSetup = ({ children }) => {
  const {
    isAuthenticating, isAuthenticated, acquireUserInfo, acquireToken,
    loginRedirect, isLoadingUserInfo,
  } = useAuth()

  useEffect(
    () => {
      const getUserInfo = async () => {
        const info = await acquireUserInfo()
        if (info) setUserInfo(info)
      }

      if (isAuthenticated) {
        getUserInfo()
      }
    },
    [acquireUserInfo, isAuthenticated, acquireToken],
  )

  useEffect(
    () => {
      if (!isAuthenticated && !isAuthenticating) {
        loginRedirect()
      }
    },
    [isAuthenticated, isAuthenticating, loginRedirect],
  )

  if (isAuthenticating || isLoadingUserInfo) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return
  }

  return children
}

function Main() {
  const [userInfo, setUserInfo] = useState(null)
  const { acquireUserInfo, loginRedirect, logoutRedirect } = useAuth()

  useEffect(() => {
    const getUserInfo = async () => {
      const info = await acquireUserInfo()
      if (info) setUserInfo(info)
    }
    getUserInfo()
  }, [acquireUserInfo])

  const handleUpdateInfo = () => {
    loginRedirect({
      policy: 'update_info'
    })
  }

  const handleChangePassword = () => {
    loginRedirect({
      policy: 'change_password',
    })
  }

  const handleResetMFA = () => {
    loginRedirect({
      policy: 'reset_mfa',
    })
  }

  const handleManagePasskey = () => {
    loginRedirect({
      policy: 'manage_passkey',
    })
  }

  const handleLogout = () => {
    logoutRedirect({ postLogoutRedirectUri: import.meta.env.VITE_CLIENT_URI })
  }

  return (
    <section>
      {userInfo && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h1>Welcome {userInfo.firstName || ''} {userInfo.lastName || ''}</h1>
          </div>
          <button type="button" onClick={handleUpdateInfo} style={ButtonStyle}>
            Update Info
          </button>
          <button type="button" onClick={handleChangePassword} style={ButtonStyle}>
            Change Password
          </button>
          <button type="button" onClick={handleResetMFA} style={ButtonStyle}>
            Reset MFA
          </button>
          <button type="button" onClick={handleManagePasskey} style={ButtonStyle}>
            Manage Passkey
          </button>
          <button type="button" onClick={handleLogout} style={ButtonStyle}>
            Logout
          </button>
        </section>
      )}

    </section>
  )
}

function App() {
  return (
    <AuthProvider
      clientId={import.meta.env.VITE_AUTH_SPA_CLIENT_ID ?? ''}
      redirectUri={import.meta.env.VITE_CLIENT_URI}
      serverUri={import.meta.env.VITE_AUTH_SERVER_URI ?? ''}
    >
      <AuthSetup>
        <Main />
      </AuthSetup>
    </AuthProvider>
  )
}

export default App

const ButtonStyle = {
  padding: '10px 20px',
  width: '200px',
  borderRadius: '5px',
  border: 'none',
  backgroundColor: '#000',
  color: '#fff',
  cursor: 'pointer',
}
