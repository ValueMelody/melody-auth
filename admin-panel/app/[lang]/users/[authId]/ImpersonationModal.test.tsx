import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach,
} from 'vitest'
import ImpersonationModal from 'app/[lang]/users/[authId]/ImpersonationModal'
import { typeTool } from 'tools'

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
              id: 1, name: 'App1', type: typeTool.ClientType.SPA, isActive: true, redirectUris: ['https://redirect'],
            },
            {
              id: 2, name: 'App2', type: typeTool.ClientType.SPA, isActive: false, redirectUris: [],
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
  },
)
