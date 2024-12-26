import NextAuth, { AuthOptions } from 'next-auth'

// The clientId of your spa app
const CLIENT_ID = ''
const SERVER_URI = 'http://localhost:8787'
// Make sure add this to the allowed redirect uri list of the spa app
const REDIRECT_URI = 'http://localhost:3001/api/auth/callback/melody-auth'

process.env.NEXTAUTH_URL = 'http://localhost:3001'

export const authOptions: AuthOptions = {
  secret: 'A random secret for next auth',
  callbacks: {
    async redirect ({ baseUrl }) {
      return `${baseUrl}/dashboard`
    },
    async jwt ({
      token, account,
    }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.refreshTokenExpiresOn = account.refresh_token_expires_on
      }
      return token
    },
    async session ({
      session, token,
    }) {
      if (token) {
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
        session.refreshTokenExpiresOn = token.refreshTokenExpiresOn
      }
      return session
    },
  },
  providers: [
    {
      id: 'melody-auth',
      name: 'Melody Auth',
      type: 'oauth',
      wellKnown: `${SERVER_URI}/.well-known/openid-configuration`,
      authorization: {
        params: {
          scope: 'openid email profile offline_access',
          redirect_uri: REDIRECT_URI,
        },
      },
      idToken: true,
      checks: ['pkce', 'state'],
      client: { token_endpoint_auth_method: 'none' },
      clientId: CLIENT_ID,
      profile (profile) {
        return {
          id: profile.sub,
          name: `${profile.firstName || ''} ${profile.lastName || ''}`,
          email: profile.email,
        }
      },
    },
  ],
}

const handler = NextAuth(authOptions)

export {
  handler as GET, handler as POST,
}
