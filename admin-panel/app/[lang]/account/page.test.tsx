import {
  describe, it, expect, beforeEach, vi,
} from 'vitest'
import {
  render, screen, fireEvent,
} from '@testing-library/react'
import '@testing-library/jest-dom'

// Import the modules to mock
import { useAuth } from '@melody-auth/react'
import { useTranslations } from 'next-intl'
import Page from 'app/[lang]/account/page'
import useCurrentLocale from 'hooks/useCurrentLocale'
import useSignalValue from 'app/useSignalValue'

// Mock the hooks
vi.mock('@melody-auth/react')
vi.mock('next-intl')
vi.mock('hooks/useCurrentLocale')
vi.mock('app/useSignalValue')

vi.mock(
  'next/navigation',
  () => ({ useRouter: vi.fn(() => ({ push: vi.fn() })) }),
)

describe(
  'Account Page',
  () => {
  // Setup mock implementations
    const mockLoginRedirect = vi.fn()
    const mockTranslate = vi.fn((key: string) => key) as any
    const mockLocale = 'en'

    beforeEach(() => {
    // Reset all mocks before each test
      vi.clearAllMocks()

      // Setup default mock implementations
      vi.mocked(useAuth).mockReturnValue({ loginRedirect: mockLoginRedirect } as any)
      vi.mocked(useTranslations).mockReturnValue(mockTranslate)
      vi.mocked(useCurrentLocale).mockReturnValue(mockLocale)
      vi.mocked(useSignalValue).mockReturnValue({ ALLOW_PASSKEY_ENROLLMENT: true })
    })

    it(
      'renders all buttons when passkey enrollment is allowed',
      () => {
        render(<Page />)

        expect(screen.getByText('account.updateInfo')).toBeInTheDocument()
        expect(screen.getByText('account.changePassword')).toBeInTheDocument()
        expect(screen.getByText('account.changeEmail')).toBeInTheDocument()
        expect(screen.getByText('account.resetMfa')).toBeInTheDocument()
        expect(screen.getByText('account.managePasskey')).toBeInTheDocument()
      },
    )

    it(
      'hides passkey button when enrollment is not allowed',
      () => {
        vi.mocked(useSignalValue).mockReturnValue({ ALLOW_PASSKEY_ENROLLMENT: false })

        render(<Page />)

        expect(screen.queryByText('account.managePasskey')).not.toBeInTheDocument()
      },
    )

    describe(
      'when locale is undefined',
      () => {
        beforeEach(() => {
          vi.mocked(useCurrentLocale).mockReturnValue(undefined as any)
        })

        it(
          'calls loginRedirect with undefined locale when update info is clicked',
          () => {
            render(<Page />)
            fireEvent.click(screen.getByText('account.updateInfo'))

            expect(mockLoginRedirect).toHaveBeenCalledWith({
              locale: undefined,
              policy: 'update_info',
              org: 'default',
            })
          },
        )

        it(
          'calls loginRedirect with undefined locale when change password is clicked',
          () => {
            render(<Page />)
            fireEvent.click(screen.getByText('account.changePassword'))

            expect(mockLoginRedirect).toHaveBeenCalledWith({
              locale: undefined,
              policy: 'change_password',
              org: 'default',
            })
          },
        )

        it(
          'calls loginRedirect with undefined locale when change email is clicked',
          () => {
            render(<Page />)
            fireEvent.click(screen.getByText('account.changeEmail'))

            expect(mockLoginRedirect).toHaveBeenCalledWith({
              locale: undefined,
              policy: 'change_email',
              org: 'default',
            })
          },
        )

        it(
          'calls loginRedirect with undefined locale when reset MFA is clicked',
          () => {
            render(<Page />)
            fireEvent.click(screen.getByText('account.resetMfa'))

            expect(mockLoginRedirect).toHaveBeenCalledWith({
              locale: undefined,
              policy: 'reset_mfa',
              org: 'default',
            })
          },
        )

        it(
          'calls loginRedirect with undefined locale when manage passkey is clicked',
          () => {
            render(<Page />)
            fireEvent.click(screen.getByText('account.managePasskey'))

            expect(mockLoginRedirect).toHaveBeenCalledWith({
              locale: undefined,
              policy: 'manage_passkey',
              org: 'default',
            })
          },
        )
      },
    )

    it(
      'calls loginRedirect with correct parameters when update info is clicked',
      () => {
        render(<Page />)

        fireEvent.click(screen.getByText('account.updateInfo'))

        expect(mockLoginRedirect).toHaveBeenCalledWith({
          locale: 'en',
          policy: 'update_info',
          org: 'default',
        })
      },
    )

    it(
      'calls loginRedirect with correct parameters when change password is clicked',
      () => {
        render(<Page />)

        fireEvent.click(screen.getByText('account.changePassword'))

        expect(mockLoginRedirect).toHaveBeenCalledWith({
          locale: 'en',
          policy: 'change_password',
          org: 'default',
        })
      },
    )

    it(
      'calls loginRedirect with correct parameters when change email is clicked',
      () => {
        render(<Page />)

        fireEvent.click(screen.getByText('account.changeEmail'))

        expect(mockLoginRedirect).toHaveBeenCalledWith({
          locale: 'en',
          policy: 'change_email',
          org: 'default',
        })
      },
    )

    it(
      'calls loginRedirect with correct parameters when reset MFA is clicked',
      () => {
        render(<Page />)

        fireEvent.click(screen.getByText('account.resetMfa'))

        expect(mockLoginRedirect).toHaveBeenCalledWith({
          locale: 'en',
          policy: 'reset_mfa',
          org: 'default',
        })
      },
    )

    it(
      'calls loginRedirect with correct parameters when manage passkey is clicked',
      () => {
        render(<Page />)

        fireEvent.click(screen.getByText('account.managePasskey'))

        expect(mockLoginRedirect).toHaveBeenCalledWith({
          locale: 'en',
          policy: 'manage_passkey',
          org: 'default',
        })
      },
    )
  },
)
