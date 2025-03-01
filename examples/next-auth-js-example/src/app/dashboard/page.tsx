'use client'

import {
  useSession, signOut,
} from 'next-auth/react'

export default function Dashboard () {
  const {
    data: session, status,
  } = useSession()

  if (status === 'loading') {
    return <p>Loading...</p>
  }

  if (!session) {
    return (
      <div>
        <p>You are not signed in.</p>
        <a href='/sign-in'>Sign in</a>
      </div>
    )
  }

  const { user } = session

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to the Dashboard</h1>
      <div>
        <h2>User Info</h2>
        <p>
          <strong>Name:</strong> {user?.name}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
      </div>
      <button
        onClick={() => signOut()}
      >
        Sign Out
      </button>
    </div>
  )
}
