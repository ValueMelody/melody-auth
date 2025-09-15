import { useAuth } from '@melody-auth/react'
import { useCallback } from 'react'
import { LoginProps as LoginRedirectRequest } from '@melody-auth/shared'
import { useRouter } from './useRouter'

export interface NextAuthHook {
  // All methods from useAuth
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authenticationError: string;
  userInfo: any;
  account: any;
  idToken: string | null;
  accessToken: string | null;
  isLoadingUserInfo: boolean;
  acquireUserInfoError: string;
  isLoadingToken: boolean;
  acquireTokenError: string;
  loginError: string;
  logoutError: string;

  // Next.js specific methods
  loginRedirect: (request?: Partial<LoginRedirectRequest>) => Promise<void>;
  logoutRedirect: (request?: { returnTo?: string }) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useNextAuth (): NextAuthHook {
  const auth = useAuth()
  const router = useRouter()

  const loginRedirect = useCallback(
    async (request?: Partial<LoginRedirectRequest>) => {
      try {
        auth.loginRedirect(request)
      } catch (error) {
        console.error(
          'Login redirect error:',
          error,
        )
      }
    },
    [auth],
  )

  const logoutRedirect = useCallback(
    async (request?: { returnTo?: string }) => {
      try {
      // Build the logout URL with returnTo parameter
        const returnTo = request?.returnTo || (typeof window !== 'undefined' ? window.location.origin : '/')

        await auth.logoutRedirect({ postLogoutRedirectUri: returnTo })
      } catch (error) {
        console.error(
          'Logout redirect error:',
          error,
        )
        // Fallback: if logout fails, at least navigate to the desired location
        if (request?.returnTo) {
          router.push(request.returnTo)
        } else {
          router.push('/')
        }
      }
    },
    [auth, router],
  )

  const refreshSession = useCallback(
    async () => {
      try {
      // Force token refresh
        await auth.acquireToken()
        router.refresh() // Refresh server components
      } catch (error) {
        console.error(
          'Session refresh error:',
          error,
        )
      }
    },
    [auth, router],
  )

  return {
    ...auth,
    loginRedirect,
    logoutRedirect,
    refreshSession,
  }
}
