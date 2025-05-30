import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach,
} from 'vitest'
import ImpersonationModal from 'app/[lang]/users/[authId]/ImpersonationModal'
import { typeTool } from 'tools'

// Mock scrollIntoView for Radix UI Select compatibility
Object.defineProperty(
  Element.prototype,
  'scrollIntoView',
  {
    value: vi.fn(),
    writable: true,
  },
)

vi.mock(
  'next-intl',
  () => ({ useTranslations: () => (key: string) => key }),
)

const mockUseAuth = vi.fn().mockReturnValue({ accessToken: 'fake-token' })
vi.mock(
  '@melody-auth/react',
  () => ({ useAuth: () => mockUseAuth() }),
)

const mockGetApps = vi.fn()
const mockGetConsents = vi.fn()
const mockImpersonate = vi.fn()
vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1AppsQuery: () => mockGetApps(),
    useGetApiV1UsersByAuthIdConsentedAppsQuery: () => mockGetConsents(),
    usePostApiV1UsersByAuthIdImpersonationAndAppIdMutation: () => [mockImpersonate, { isLoading: false }],
  }),
)

vi.mock(
  'app/useSignalValue',
  () => ({ default: () => ({ ENABLE_USER_APP_CONSENT: true }) }),
)

describe(
  'ImpersonationModal',
  () => {
    const user = {
      authId: '1', email: 'user@test.com',
    } as any

    beforeEach(() => {
      mockGetApps.mockReturnValue({
        data: {
          apps: [
            {
              id: 1,
              name: 'App1',
              type: typeTool.ClientType.SPA,
              isActive: true,
              redirectUris: ['https://redirect1.com', 'https://redirect2.com'],
            },
            {
              id: 2,
              name: 'App2',
              type: typeTool.ClientType.SPA,
              isActive: false,
              redirectUris: [],
            },
          ],
        },
      })
      mockGetConsents.mockReturnValue({ data: { consentedApps: [] } })
      mockImpersonate.mockResolvedValue({ data: {} })
    })

    it(
      'does not render when show is false',
      () => {
        const { container } = render(<ImpersonationModal
          show={false}
          user={user}
          onClose={() => {}} />)
        expect(container.firstChild).toBeNull()
      },
    )

    it(
      'shows consent message when selecting app without consent',
      async () => {
        render(<ImpersonationModal
          show={true}
          user={user}
          onClose={() => {}} />)
        fireEvent.click(screen.queryByTestId('appSelect') as HTMLSelectElement)
        fireEvent.click(screen.queryByTestId('appSelectItem-1') as HTMLSelectElement)
        await waitFor(() => {
          expect(screen.getByText('impersonateConsent')).toBeInTheDocument()
        })
      },
    )

    it(
      'does not call impersonate when no app is selected',
      async () => {
        mockGetConsents.mockReturnValue({ data: { consentedApps: [] } })

        render(<ImpersonationModal
          show={true}
          user={user}
          onClose={() => {}} />)

        // Try to confirm without selecting an app
        const confirmButton = screen.queryByTestId('confirmImpersonate') as HTMLButtonElement
        expect(confirmButton).not.toBeInTheDocument()
      },
    )

    it(
      'calls impersonate when confirmed for consented app',
      async () => {
        mockGetConsents.mockReturnValue({ data: { consentedApps: [{ appId: 1 }] } })
        render(<ImpersonationModal
          show={true}
          user={user}
          onClose={() => {}} />)
        fireEvent.click(screen.queryByTestId('appSelect') as HTMLSelectElement)
        fireEvent.click(screen.queryByTestId('appSelectItem-1') as HTMLSelectElement)
        const confirmButton = screen.queryByTestId('confirmImpersonate') as HTMLButtonElement
        fireEvent.click(confirmButton)
        await waitFor(() => {
          expect(mockImpersonate).toHaveBeenCalledWith({
            authId: user.authId,
            appId: 1,
            body: { impersonatorToken: 'fake-token' },
          })
        })
      },
    )

    it(
      'handles null accessToken by passing empty string',
      async () => {
        mockUseAuth.mockReturnValue({ accessToken: null })
        mockGetConsents.mockReturnValue({ data: { consentedApps: [{ appId: 1 }] } })

        render(<ImpersonationModal
          show={true}
          user={user}
          onClose={() => {}} />)

        fireEvent.click(screen.queryByTestId('appSelect') as HTMLSelectElement)
        fireEvent.click(screen.queryByTestId('appSelectItem-1') as HTMLSelectElement)
        const confirmButton = screen.queryByTestId('confirmImpersonate') as HTMLButtonElement
        fireEvent.click(confirmButton)

        await waitFor(() => {
          expect(mockImpersonate).toHaveBeenCalledWith({
            authId: user.authId,
            appId: 1,
            body: { impersonatorToken: '' },
          })
        })

        // Reset mock for other tests
        mockUseAuth.mockReturnValue({ accessToken: 'fake-token' })
      },
    )

    it(
      'displays refresh token when impersonation is successful',
      async () => {
        mockGetConsents.mockReturnValue({ data: { consentedApps: [{ appId: 1 }] } })
        mockImpersonate.mockResolvedValue({
          data: {
            refresh_token: 'test-refresh-token',
            refresh_token_expires_on: 1234567890,
            refresh_token_expires_in: 3600,
          },
        })

        render(<ImpersonationModal
          show={true}
          user={user}
          onClose={() => {}} />)

        // Select app and confirm impersonation
        fireEvent.click(screen.queryByTestId('appSelect') as HTMLSelectElement)
        fireEvent.click(screen.queryByTestId('appSelectItem-1') as HTMLSelectElement)
        const confirmButton = screen.queryByTestId('confirmImpersonate') as HTMLButtonElement
        fireEvent.click(confirmButton)

        await waitFor(() => {
          expect(screen.getByTestId('impersonateToken')).toBeInTheDocument()
          expect(screen.getByText('test-refresh-token')).toBeInTheDocument()
          expect(screen.getByText('impersonateTokenDesc')).toBeInTheDocument()
        })
      },
    )

    it(
      'displays direct links with correct query parameters',
      async () => {
        mockGetConsents.mockReturnValue({ data: { consentedApps: [{ appId: 1 }] } })
        mockImpersonate.mockResolvedValue({
          data: {
            refresh_token: 'test-refresh-token',
            refresh_token_expires_on: 1234567890,
            refresh_token_expires_in: 3600,
          },
        })

        render(<ImpersonationModal
          show={true}
          user={user}
          onClose={() => {}} />)

        // Select app and confirm impersonation
        fireEvent.click(screen.queryByTestId('appSelect') as HTMLSelectElement)
        fireEvent.click(screen.queryByTestId('appSelectItem-1') as HTMLSelectElement)
        const confirmButton = screen.queryByTestId('confirmImpersonate') as HTMLButtonElement
        fireEvent.click(confirmButton)

        await waitFor(() => {
          const links = screen.getAllByRole('link')
          const expectedUrl1 = 'https://redirect1.com?refresh_token=test-refresh-token&refresh_token_expires_on=1234567890&refresh_token_expires_in=3600'
          const expectedUrl2 = 'https://redirect2.com?refresh_token=test-refresh-token&refresh_token_expires_on=1234567890&refresh_token_expires_in=3600'

          expect(links).toHaveLength(2)
          expect(links[0]).toHaveAttribute(
            'href',
            expectedUrl1,
          )
          expect(links[1]).toHaveAttribute(
            'href',
            expectedUrl2,
          )
          expect(links[0]).toHaveAttribute(
            'target',
            '_blank',
          )
          expect(links[0]).toHaveAttribute(
            'rel',
            'noreferrer',
          )
        })
      },
    )

    it(
      'handles single redirect URI correctly',
      async () => {
        mockGetApps.mockReturnValue({
          data: {
            apps: [
              {
                id: 1,
                name: 'App1',
                type: typeTool.ClientType.SPA,
                isActive: true,
                redirectUris: ['https://single-redirect.com'],
              },
            ],
          },
        })
        mockGetConsents.mockReturnValue({ data: { consentedApps: [{ appId: 1 }] } })
        mockImpersonate.mockResolvedValue({
          data: {
            refresh_token: 'test-refresh-token',
            refresh_token_expires_on: 1234567890,
            refresh_token_expires_in: 3600,
          },
        })

        render(<ImpersonationModal
          show={true}
          user={user}
          onClose={() => {}} />)

        // Select app and confirm impersonation
        fireEvent.click(screen.queryByTestId('appSelect') as HTMLSelectElement)
        fireEvent.click(screen.queryByTestId('appSelectItem-1') as HTMLSelectElement)
        const confirmButton = screen.queryByTestId('confirmImpersonate') as HTMLButtonElement
        fireEvent.click(confirmButton)

        await waitFor(() => {
          const links = screen.getAllByRole('link')
          expect(links).toHaveLength(1)
          expect(links[0]).toHaveAttribute(
            'href',
            'https://single-redirect.com?refresh_token=test-refresh-token&refresh_token_expires_on=1234567890&refresh_token_expires_in=3600',
          )
        })
      },
    )

    it(
      'hides confirm button after successful impersonation',
      async () => {
        mockGetConsents.mockReturnValue({ data: { consentedApps: [{ appId: 1 }] } })
        mockImpersonate.mockResolvedValue({
          data: {
            refresh_token: 'test-refresh-token',
            refresh_token_expires_on: 1234567890,
            refresh_token_expires_in: 3600,
          },
        })

        render(<ImpersonationModal
          show={true}
          user={user}
          onClose={() => {}} />)

        // Select app and confirm impersonation
        fireEvent.click(screen.queryByTestId('appSelect') as HTMLSelectElement)
        fireEvent.click(screen.queryByTestId('appSelectItem-1') as HTMLSelectElement)
        const confirmButton = screen.queryByTestId('confirmImpersonate') as HTMLButtonElement
        fireEvent.click(confirmButton)

        await waitFor(() => {
          expect(screen.getByTestId('impersonateToken')).toBeInTheDocument()
          expect(screen.queryByTestId('confirmImpersonate')).not.toBeInTheDocument()
        })
      },
    )

    it(
      'filters apps to show only active SPA apps',
      async () => {
        mockGetApps.mockReturnValue({
          data: {
            apps: [
              {
                id: 1,
                name: 'Active SPA',
                type: typeTool.ClientType.SPA,
                isActive: true,
                redirectUris: ['https://redirect.com'],
              },
              {
                id: 2,
                name: 'Inactive SPA',
                type: typeTool.ClientType.SPA,
                isActive: false,
                redirectUris: ['https://redirect.com'],
              },
            ],
          },
        })

        render(<ImpersonationModal
          show={true}
          user={user}
          onClose={() => {}} />)

        fireEvent.click(screen.queryByTestId('appSelect') as HTMLSelectElement)

        await waitFor(() => {
          expect(screen.getByTestId('appSelectItem-1')).toBeInTheDocument() // Active SPA
          expect(screen.queryByTestId('appSelectItem-2')).not.toBeInTheDocument() // Inactive SPA
        })
      },
    )
  },
)
