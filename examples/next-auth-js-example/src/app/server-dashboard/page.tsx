import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]/route'

export default async function DashboardPage () {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div>
        <h1>You are not signed in.</h1>
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
          <strong>Name:</strong> {user?.name ?? ''}
        </p>
        <p>
          <strong>Email:</strong> {user?.email ?? ''}
        </p>
      </div>
    </div>
  )
}
