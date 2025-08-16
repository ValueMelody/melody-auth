import {
  describe, it, expect, beforeEach, vi,
} from 'vitest'
import {
  screen, fireEvent,
} from '@testing-library/react'
import '@testing-library/jest-dom'

// Import the modules to mock
import { useAuth } from '@melody-auth/react'
import {
  useTranslations, useLocale,
} from 'next-intl'
import { render } from 'vitest.setup'
import Page from 'app/[lang]/account/page'
import useSignalValue from 'app/useSignalValue'

// Mock the hooks
vi.mock('@melody-auth/react')

vi.mock('app/useSignalValue')

vi.mock(
  'next-intl',
  () => ({
    useTranslations: vi.fn((key: string) => key),
    useLocale: vi.fn(() => 'en'),
  }),
)

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn(() => ({ push: vi.fn() })) }),
)

describe(
  'Account Page',
  () => {
  // Setup mock implementations
    const mockLoginRedirect = vi.fn()

    beforeEach(() => {
    // Reset all mocks before each test
      vi.clearAllMocks()

      // Setup default mock implementations
      vi.mocked(useAuth).mockReturnValue({ loginRedirect: mockLoginRedirect } as any)
      vi.mocked(useSignalValue).mockReturnValue({
        ALLOW_PASSKEY_ENROLLMENT: true,
        ENABLE_RECOVERY_CODE: true,
      })
      vi.mocked(useTranslations).mockReturnValue(vi.fn((key: string) => key) as any)
      vi.mocked(useLocale).mockReturnValue('en')
    })

    it(
      'renders all buttons',
      () => {
        render(<Page />)

        expect(screen.getByText('account.updateInfo')).toBeInTheDocument()
        expect(screen.getByText('account.changePassword')).toBeInTheDocument()
        expect(screen.getByText('account.changeEmail')).toBeInTheDocument()
        expect(screen.getByText('account.resetMfa')).toBeInTheDocument()
        expect(screen.getByText('account.managePasskey')).toBeInTheDocument()
        expect(screen.getByText('account.manageRecoveryCode')).toBeInTheDocument()
      },
    )

    it(
      'hides passkey button when enrollment is not allowed',
      () => {
        vi.mocked(useSignalValue).mockReturnValue({
          ALLOW_PASSKEY_ENROLLMENT: false,
          ENABLE_RECOVERY_CODE: false,
        })

        render(<Page />)

        expect(screen.queryByText('account.managePasskey')).not.toBeInTheDocument()
        expect(screen.queryByText('account.manageRecoveryCode')).not.toBeInTheDocument()
      },
    )

    describe(
      'when locale is undefined',
      () => {
        beforeEach(() => {
          vi.mocked(useLocale).mockReturnValue(undefined as any)
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

        it(
          'calls loginRedirect with undefined locale when manage recovery code is clicked',
          () => {
            render(<Page />)
            fireEvent.click(screen.getByText('account.manageRecoveryCode'))

            expect(mockLoginRedirect).toHaveBeenCalledWith({
              locale: undefined,
              policy: 'manage_recovery_code',
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

    it(
      'calls loginRedirect with correct parameters when manage recovery code is clicked',
      () => {
        render(<Page />)

        fireEvent.click(screen.getByText('account.manageRecoveryCode'))

        expect(mockLoginRedirect).toHaveBeenCalledWith({
          locale: 'en',
          policy: 'manage_recovery_code',
          org: 'default',
        })
      },
    )
  },
)
