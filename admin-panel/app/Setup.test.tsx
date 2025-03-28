import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest'
import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react'
import { useAuth } from '@melody-auth/react'
import {
  usePathname,
  useRouter,
} from 'next/navigation'
import Setup from './Setup'
import {
  configSignal,
  errorSignal,
} from 'signals'
import { typeTool } from 'tools'

// Mock all required hooks and modules
vi.mock(
  '@melody-auth/react',
  () => ({
    useAuth: vi.fn(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='auth-provider'>{children}</div>
    ),
  }),
)

vi.mock(
  'next/navigation',
  () => ({
    useRouter: vi.fn(() => ({ push: vi.fn() })),
    usePathname: vi.fn(),
  }),
)

vi.mock(
  'next-intl',
  () => ({ useTranslations: vi.fn(() => (key: string) => key) }),
)

vi.mock(
  'hooks/useCurrentLocale',
  () => ({ default: vi.fn(() => 'en') }),
)

vi.mock(
  'next/link',
  () => ({
    default: ({
      children, href,
    }: { children: React.ReactNode; href: string }) => (
      <a
        href={href}
        data-testid='mock-link'>{children}
      </a>
    ),
  }),
)

describe(
  'Setup Component',
  () => {
    const mockAcquireToken = vi.fn()
    const mockAcquireUserInfo = vi.fn()
    const mockLoginRedirect = vi.fn()
    const mockLogoutRedirect = vi.fn()
    const mockPush = vi.fn()

    beforeEach(() => {
      vi.clearAllMocks()
      errorSignal.value = ''
      configSignal.value = null

      vi.mocked(useAuth).mockReturnValue({
        isAuthenticating: false,
        isAuthenticated: true,
        isLoadingUserInfo: false,
        acquireUserInfo: mockAcquireUserInfo,
        acquireToken: mockAcquireToken,
        loginRedirect: mockLoginRedirect,
        logoutRedirect: mockLogoutRedirect,
        userInfo: {
          authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
          roles: [typeTool.Role.SuperAdmin],
        },
        accessTokenStorage: { accessToken: 'test-token' },
        refreshTokenStorage: { refreshToken: 'test-refresh-token' },
      } as any)

      vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    })

    it(
      'renders loading spinner when authenticating',
      () => {
        vi.mocked(useAuth).mockReturnValue({
          isAuthenticating: true,
          isAuthenticated: false,
          isLoadingUserInfo: false,
          acquireUserInfo: mockAcquireUserInfo,
          acquireToken: mockAcquireToken,
          loginRedirect: mockLoginRedirect,
          logoutRedirect: mockLogoutRedirect,
          userInfo: null,
          accessTokenStorage: { accessToken: 'test-token' },
          refreshTokenStorage: { refreshToken: 'test-refresh-token' },
        } as any)

        render(<Setup>Test</Setup>)
        expect(screen.getByTestId('spinner')).toBeInTheDocument()
      },
    )

    it(
      'shows error for non-admin users',
      async () => {
        vi.mocked(useAuth).mockReturnValue({
          isAuthenticating: false,
          isAuthenticated: true,
          isLoadingUserInfo: false,
          acquireUserInfo: mockAcquireUserInfo,
          acquireToken: mockAcquireToken,
          loginRedirect: mockLoginRedirect,
          logoutRedirect: mockLogoutRedirect,
          userInfo: {
            authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
            roles: ['user'], // Not an admin role
          },
          accessTokenStorage: { accessToken: 'test-token' },
          refreshTokenStorage: { refreshToken: 'test-refresh-token' },
        } as any)

        render(<Setup>Test</Setup>)
        expect(screen.getByText('layout.blocked')).toBeInTheDocument()
      },
    )

    it(
      'renders navbar for authenticated admin users',
      () => {
        configSignal.value = { ENABLE_SIGN_IN_LOG: true } as any
        vi.mocked(useAuth).mockReturnValue({
          isAuthenticating: false,
          isAuthenticated: true,
          isLoadingUserInfo: false,
          acquireUserInfo: mockAcquireUserInfo,
          acquireToken: mockAcquireToken,
          loginRedirect: mockLoginRedirect,
          logoutRedirect: mockLogoutRedirect,
          userInfo: {
            authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
            roles: [typeTool.Role.SuperAdmin],
          },
          accessTokenStorage: { accessToken: 'test-token' },
          refreshTokenStorage: { refreshToken: 'test-refresh-token' },
        } as any)

        render(<Setup>Test</Setup>)
        expect(screen.getByText('layout.brand')).toBeInTheDocument()
        expect(screen.getByText('layout.dashboard')).toBeInTheDocument()
      },
    )

    it(
      'handles logout click',
      () => {
        configSignal.value = {} as any
        vi.mocked(useAuth).mockReturnValue({
          isAuthenticating: false,
          isAuthenticated: true,
          isLoadingUserInfo: false,
          acquireUserInfo: mockAcquireUserInfo,
          acquireToken: mockAcquireToken,
          loginRedirect: mockLoginRedirect,
          logoutRedirect: mockLogoutRedirect,
          userInfo: {
            authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
            roles: [typeTool.Role.SuperAdmin],
          },
          accessTokenStorage: { accessToken: 'test-token' },
          refreshTokenStorage: { refreshToken: 'test-refresh-token' },
        } as any)

        render(<Setup>Test</Setup>)

        const logoutButton = screen.getByText('layout.logout')
        fireEvent.click(logoutButton)

        expect(mockLogoutRedirect).toHaveBeenCalledWith({ postLogoutRedirectUri: process.env.NEXT_PUBLIC_CLIENT_URI })
      },
    )

    it(
      'shows optional nav items based on config',
      () => {
        configSignal.value = {
          ENABLE_ORG: true,
          ENABLE_SIGN_IN_LOG: true,
        } as any
        vi.mocked(useAuth).mockReturnValue({
          isAuthenticating: false,
          isAuthenticated: true,
          isLoadingUserInfo: false,
          acquireUserInfo: mockAcquireUserInfo,
          acquireToken: mockAcquireToken,
          loginRedirect: mockLoginRedirect,
          logoutRedirect: mockLogoutRedirect,
          userInfo: {
            authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
            roles: [typeTool.Role.SuperAdmin],
          },
          accessTokenStorage: { accessToken: 'test-token' },
          refreshTokenStorage: { refreshToken: 'test-refresh-token' },
        } as any)

        render(<Setup>Test</Setup>)

        expect(screen.getByText('layout.orgs')).toBeInTheDocument()
        expect(screen.getByText('layout.logs')).toBeInTheDocument()
      },
    )

    it(
      'clears error signal on pathname change',
      () => {
        errorSignal.value = 'Some error'
        const pathname = '/test'
        vi.mocked(usePathname).mockReturnValue(pathname)
        vi.mocked(useAuth).mockReturnValue({
          isAuthenticating: false,
          isAuthenticated: true,
          isLoadingUserInfo: false,
          acquireUserInfo: mockAcquireUserInfo,
          acquireToken: mockAcquireToken,
          loginRedirect: mockLoginRedirect,
          logoutRedirect: mockLogoutRedirect,
          userInfo: {
            authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
            roles: [typeTool.Role.SuperAdmin],
          },
          accessTokenStorage: { accessToken: 'test-token' },
          refreshTokenStorage: { refreshToken: 'test-refresh-token' },
        } as any)

        render(<Setup>Test</Setup>)

        expect(errorSignal.value).toBe('')
      },
    )
  },
)
