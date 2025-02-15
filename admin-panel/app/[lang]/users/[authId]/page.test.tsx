import {
  fireEvent, screen, waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import { GetUserInfoRes } from 'shared/dist/serverInterface'
import Page from 'app/[lang]/users/[authId]/page'
import { render } from 'vitest.setup'
import {
  useDeleteApiV1UsersByAuthIdConsentedAppsAndAppIdMutation,
  useDeleteApiV1UsersByAuthIdEmailMfaMutation,
  useDeleteApiV1UsersByAuthIdLockedIpsMutation,
  useDeleteApiV1UsersByAuthIdMutation,
  useDeleteApiV1UsersByAuthIdOtpMfaMutation,
  useDeleteApiV1UsersByAuthIdSmsMfaMutation,
  useGetApiV1RolesQuery,
  useGetApiV1UsersByAuthIdConsentedAppsQuery,
  useGetApiV1UsersByAuthIdLockedIpsQuery,
  useGetApiV1UsersByAuthIdQuery,
  usePostApiV1UsersByAuthIdEmailMfaMutation,
  usePostApiV1UsersByAuthIdOtpMfaMutation,
  usePostApiV1UsersByAuthIdSmsMfaMutation,
  usePostApiV1UsersByAuthIdVerifyEmailMutation,
  usePutApiV1UsersByAuthIdMutation,
  useDeleteApiV1UsersByAuthIdAccountLinkingMutation,
  useDeleteApiV1UsersByAuthIdPasskeysAndPasskeyIdMutation,
  useGetApiV1UsersByAuthIdPasskeysQuery,
} from 'services/auth/api'
import { users } from 'tests/userMock'
import { roles } from 'tests/roleMock'
import {
  userInfoSignal, configSignal,
} from 'signals'

const mockNav = {
  authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
  push: vi.fn(),
}

vi.mock(
  'next/navigation',
  () => ({
    useParams: vi.fn(() => ({ authId: mockNav.authId })),
    useRouter: vi.fn(() => ({ push: mockNav.push })),
  }),
)

vi.mock(
  'services/auth/api',
  () => ({
    useDeleteApiV1UsersByAuthIdConsentedAppsAndAppIdMutation: vi.fn(),
    useDeleteApiV1UsersByAuthIdEmailMfaMutation: vi.fn(),
    useDeleteApiV1UsersByAuthIdLockedIpsMutation: vi.fn(),
    useDeleteApiV1UsersByAuthIdMutation: vi.fn(),
    useDeleteApiV1UsersByAuthIdOtpMfaMutation: vi.fn(),
    useDeleteApiV1UsersByAuthIdSmsMfaMutation: vi.fn(),
    useGetApiV1RolesQuery: vi.fn(),
    useGetApiV1UsersByAuthIdConsentedAppsQuery: vi.fn(),
    useGetApiV1UsersByAuthIdLockedIpsQuery: vi.fn(),
    useGetApiV1UsersByAuthIdQuery: vi.fn(),
    usePostApiV1UsersByAuthIdEmailMfaMutation: vi.fn(),
    usePostApiV1UsersByAuthIdOtpMfaMutation: vi.fn(),
    usePostApiV1UsersByAuthIdSmsMfaMutation: vi.fn(),
    usePostApiV1UsersByAuthIdVerifyEmailMutation: vi.fn(),
    usePutApiV1UsersByAuthIdMutation: vi.fn(),
    useDeleteApiV1UsersByAuthIdAccountLinkingMutation: vi.fn(),
    useDeleteApiV1UsersByAuthIdPasskeysAndPasskeyIdMutation: vi.fn(),
    useGetApiV1UsersByAuthIdPasskeysQuery: vi.fn(),
  }),
)

vi.mock(
  'signals',
  () => ({
    configSignal: {
      value: {
        ENABLE_NAMES: true,
        SUPPORTED_LOCALES: ['en', 'fr'],
        ACCOUNT_LOCKOUT_THRESHOLD: 2,
        ALLOW_PASSKEY_ENROLLMENT: true,
        ENABLE_USER_APP_CONSENT: true,
        ENABLE_ORG: true,
        ENABLE_EMAIL_VERIFICATION: true,
      },
      subscribe: () => () => {},
    },
    userInfoSignal: {
      value: { authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' },
      subscribe: () => () => {},
    },
    errorSignal: {
      value: '',
      subscribe: () => () => {},
    },
  }),
)

const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockDeleteConsent = vi.fn()
const mockDeleteIps = vi.fn()
const mockResendVerifyEmail = vi.fn()
const mockEnrollEmailMfa = vi.fn()
const mockEnrollOtpMfa = vi.fn()
const mockEnrollSmsMfa = vi.fn()
const mockUnenrollEmailMfa = vi.fn()
const mockUnenrollSmsMfa = vi.fn()
const mockUnenrollOtpMfa = vi.fn()
const mockUnlinkAccount = vi.fn()
const mockDeletePasskey = vi.fn()

describe(
  'user',
  () => {
    beforeEach(() => {
      (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
        data: {
          user: {
            ...users[0],
            socialAccountId: null,
          },
        },
      });
      (useGetApiV1RolesQuery as Mock).mockReturnValue({ data: { roles } });
      (useGetApiV1UsersByAuthIdConsentedAppsQuery as Mock).mockReturnValue({
        data: {
          consentedApps: [{
            appId: 1, appName: 'test app',
          }],
        },
      });
      (useGetApiV1UsersByAuthIdLockedIpsQuery as Mock).mockReturnValue({ data: { lockedIPs: ['1.1.1.1'] } });
      (usePutApiV1UsersByAuthIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteApiV1UsersByAuthIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }]);
      (useDeleteApiV1UsersByAuthIdConsentedAppsAndAppIdMutation as Mock)
        .mockReturnValue([mockDeleteConsent, { isLoading: false }]);
      (useDeleteApiV1UsersByAuthIdLockedIpsMutation as Mock).mockReturnValue([mockDeleteIps, { isLoading: false }]);
      (usePostApiV1UsersByAuthIdVerifyEmailMutation as Mock)
        .mockReturnValue([mockResendVerifyEmail, { isLoading: false }]);
      (usePostApiV1UsersByAuthIdEmailMfaMutation as Mock).mockReturnValue([mockEnrollEmailMfa, { isLoading: false }]);
      (usePostApiV1UsersByAuthIdSmsMfaMutation as Mock).mockReturnValue([mockEnrollSmsMfa, { isLoading: false }]);
      (usePostApiV1UsersByAuthIdOtpMfaMutation as Mock).mockReturnValue([mockEnrollOtpMfa, { isLoading: false }]);
      (useDeleteApiV1UsersByAuthIdEmailMfaMutation as Mock)
        .mockReturnValue([mockUnenrollEmailMfa, { isLoading: false }]);
      (useDeleteApiV1UsersByAuthIdOtpMfaMutation as Mock).mockReturnValue([mockUnenrollOtpMfa, { isLoading: false }]);
      (useDeleteApiV1UsersByAuthIdSmsMfaMutation as Mock).mockReturnValue([mockUnenrollSmsMfa, { isLoading: false }]);
      (useDeleteApiV1UsersByAuthIdPasskeysAndPasskeyIdMutation as Mock)
        .mockReturnValue([mockDeletePasskey, { isLoading: false }]);
      (useGetApiV1UsersByAuthIdPasskeysQuery as Mock).mockReturnValue({ data: { passkeys: [{ id: 1 }] } });
      (useDeleteApiV1UsersByAuthIdAccountLinkingMutation as Mock)
        .mockReturnValue([mockUnlinkAccount, { isLoading: false }])
    })

    it(
      'render user',
      async () => {
        render(<Page />)

        const localeOptions = screen.queryAllByTestId('localeOption')
        expect(localeOptions.length).toBe(2)

        const lockedIpBadges = screen.queryAllByTestId('lockedIpBadge')
        expect(lockedIpBadges.length).toBe(1)
        expect(lockedIpBadges[0]?.innerHTML).toContain('1.1.1.1')

        const roleInputs = screen.queryAllByTestId('roleInput') as HTMLInputElement[]
        expect(roleInputs.length).toBe(2)
        expect(roleInputs[0]?.checked).toBeFalsy()
        expect(roleInputs[1]?.checked).toBeFalsy()

        const firstNameInput = screen.queryByTestId('firstNameInput') as HTMLInputElement
        expect(firstNameInput?.value).toBe(users[0].firstName)

        const lastNameInput = screen.queryByTestId('lastNameInput') as HTMLInputElement
        expect(lastNameInput?.value).toBe(users[0].lastName)
      },
    )

    it(
      'update user',
      async () => {
        render(<Page />)

        const localeSelect = screen.queryByTestId('localeSelect') as HTMLSelectElement
        fireEvent.change(
          localeSelect,
          { target: { value: 'fr' } },
        )

        const roleInputs = screen.queryAllByTestId('roleInput') as HTMLInputElement[]
        fireEvent.click(roleInputs[0])

        const firstNameInput = screen.queryByTestId('firstNameInput') as HTMLInputElement
        fireEvent.change(
          firstNameInput,
          { target: { value: 'new firstname' } },
        )

        const lastNameInput = screen.queryByTestId('lastNameInput') as HTMLInputElement
        fireEvent.change(
          lastNameInput,
          { target: { value: 'new lastname' } },
        )

        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        expect(saveBtn?.disabled).toBeFalsy()
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenLastCalledWith({
          authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
          putUserReq: {
            locale: 'fr',
            firstName: 'new firstname',
            lastName: 'new lastname',
            roles: ['super_admin'],
          },
        })
      },
    )

    it(
      'delete user',
      async () => {
        render(<Page />)

        const deleteBtn = screen.queryAllByTestId('deleteButton') as HTMLButtonElement[]
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        fireEvent.click(deleteBtn[0])
        expect(screen.queryByRole('dialog')).toBeInTheDocument()

        fireEvent.click(screen.queryByTestId('confirmButton') as HTMLButtonElement)

        expect(mockDelete).toHaveBeenLastCalledWith({ authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' })
      },
    )

    it(
      'remove passkey',
      async () => {
        render(<Page />)

        await waitFor(() => {
          const removePasskeyBtn = screen.getAllByText('users.removePasskey')
          expect(removePasskeyBtn.length).toBeGreaterThan(0)
          fireEvent.click(removePasskeyBtn[0])
        })

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).toBeInTheDocument()
        })

        await waitFor(() => {
          const confirmButton = screen.getByTestId('confirmButton')
          fireEvent.click(confirmButton)
        })

        await waitFor(() => {
          expect(mockDeletePasskey).toHaveBeenLastCalledWith({
            authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
            passkeyId: 1,
          })
        })
      },
    )

    it(
      'revoke consent',
      async () => {
        render(<Page />)

        await waitFor(() => {
          const revokeBtn = screen.getAllByText('users.revokeConsent')
          expect(revokeBtn.length).toBeGreaterThan(0)
          fireEvent.click(revokeBtn[0])
        })

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).toBeInTheDocument()
        })

        await waitFor(() => {
          const confirmButton = screen.getByTestId('confirmButton')
          fireEvent.click(confirmButton)
        })

        await waitFor(() => {
          expect(mockDeleteConsent).toHaveBeenLastCalledWith({
            authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
            appId: 1,
          })
        })
      },
    )

    it(
      'shows no consented apps message',
      async () => {
        (useGetApiV1UsersByAuthIdConsentedAppsQuery as Mock).mockReturnValue({ data: { consentedApps: [] } })

        render(<Page />)

        await waitFor(() => {
          expect(screen.getByText('users.noConsented')).toBeInTheDocument()
        })
      },
    )

    it(
      'shows org name',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              org: { name: 'Test Organization' },
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          expect(screen.getByText('Test Organization')).toBeInTheDocument()
        })
      },
    )

    it(
      'shows linked account and unlink button',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              linkedAuthId: 'linked-user-123',
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          expect(screen.getByText('linked-user-123')).toBeInTheDocument()
        })

        await waitFor(() => {
          const unlinkBtn = screen.getAllByText('users.unlink')
          expect(unlinkBtn.length).toBeGreaterThan(0)
          fireEvent.click(unlinkBtn[0])
        })

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).toBeInTheDocument()
        })

        await waitFor(() => {
          const confirmButton = screen.getByTestId('confirmButton')
          fireEvent.click(confirmButton)
        })

        await waitFor(() => {
          expect(mockUnlinkAccount).toHaveBeenLastCalledWith({ authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' })
        })
      },
    )

    it(
      'shows sms mfa verified badge',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              mfaTypes: ['sms'],
              smsPhoneNumberVerified: true,
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          expect(screen.getByText('users.smsMfaVerified')).toBeInTheDocument()
        })
      },
    )

    it(
      'shows sms mfa enrolled badge',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              mfaTypes: ['sms'],
              smsPhoneNumberVerified: false,
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          expect(screen.getByText('users.smsMfaEnrolled')).toBeInTheDocument()
        })
      },
    )

    it(
      'shows otp mfa verified badge',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              mfaTypes: ['otp'],
              otpVerified: true,
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          expect(screen.getByText('users.otpMfaVerified')).toBeInTheDocument()
        })
      },
    )

    it(
      'shows otp mfa enrolled badge',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              mfaTypes: ['otp'],
              otpVerified: false,
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          expect(screen.getByText('users.otpMfaEnrolled')).toBeInTheDocument()
        })
      },
    )

    it(
      'shows social account info',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: 'social-123',
              socialAccountType: 'google',
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          expect(screen.getByText('google: social-123')).toBeInTheDocument()
        })
      },
    )

    it(
      'shows email mfa enrolled badge',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              mfaTypes: ['email'],
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          expect(screen.getByText('users.emailMfaEnrolled')).toBeInTheDocument()
        })
      },
    )

    it(
      'shows email verified badge',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              emailVerified: true,
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          expect(screen.getByText('users.emailVerified')).toBeInTheDocument()
        })
      },
    )

    it(
      'shows isSelf label',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865', // Same as userInfoSignal
              socialAccountId: null,
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          expect(screen.queryByText('users.you')).toBeInTheDocument()
        })
      },
    )

    it(
      'shows email sent badge after resend',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              emailVerified: false,
            },
          },
        });

        (usePostApiV1UsersByAuthIdVerifyEmailMutation as Mock)
          .mockReturnValue([mockResendVerifyEmail, { isLoading: false }])
        mockResendVerifyEmail.mockResolvedValue({ data: { success: true } })

        render(<Page />)

        await waitFor(() => {
          const resendButton = screen.queryAllByTestId('resendEmailButton') as HTMLButtonElement[]
          fireEvent.click(resendButton[0])
        })

        await waitFor(() => {
          expect(mockResendVerifyEmail).toHaveBeenCalledWith({ authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' })
          expect(screen.queryAllByTestId('emailSentBadge').length).toBeGreaterThan(0)
        })
      },
    )

    it(
      'navigates to linked account page on click',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              linkedAuthId: 'linked-user-123',
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          const linkedAccountLink = screen.getByText('linked-user-123')
          fireEvent.click(linkedAccountLink)
        })

        await waitFor(() => {
          expect(mockNav.push).toHaveBeenCalledWith('/en/users/linked-user-123')
        })
      },
    )

    it(
      'add then remove role',
      async () => {
        render(<Page />)

        // Add role
        await waitFor(() => {
          const roleInputs = screen.queryAllByTestId('roleInput') as HTMLInputElement[]
          expect(roleInputs.length).toBe(2)
          fireEvent.click(roleInputs[0])
        })

        const saveButton = screen.getByTestId('saveButton')
        fireEvent.click(saveButton)

        await waitFor(() => {
          expect(mockUpdate).toHaveBeenLastCalledWith({
            authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
            putUserReq: { roles: ['super_admin'] },
          })
        })

        // Remove role
        await waitFor(() => {
          const roleInputs = screen.queryAllByTestId('roleInput') as HTMLInputElement[]
          fireEvent.click(roleInputs[0])
        })

        fireEvent.click(saveButton)

        await waitFor(() => {
          expect(mockUpdate).toHaveBeenLastCalledWith({
            authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
            putUserReq: { roles: [] },
          })
        })
      },
    )

    it(
      'enroll email mfa',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              mfaTypes: [],
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          const enrollButton = screen.queryAllByTestId('enrollEmailButton') as HTMLButtonElement[]
          fireEvent.click(enrollButton[0])
        })

        await waitFor(() => {
          expect(mockEnrollEmailMfa).toHaveBeenCalledWith({ authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' })
        })
      },
    )

    it(
      'enroll sms mfa',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              mfaTypes: [],
              isActive: true,
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          const enrollButton = screen.queryAllByTestId('enrollSmsButton') as HTMLButtonElement[]
          fireEvent.click(enrollButton[0])
        })

        await waitFor(() => {
          expect(mockEnrollSmsMfa).toHaveBeenCalledWith({ authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' })
        })
      },
    )

    it(
      'enroll otp mfa',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              mfaTypes: [],
              isActive: true,
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          const enrollButton = screen.queryAllByTestId('enrollOtpButton') as HTMLButtonElement[]
          fireEvent.click(enrollButton[0])
        })

        await waitFor(() => {
          expect(mockEnrollOtpMfa).toHaveBeenCalledWith({ authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' })
        })
      },
    )

    it(
      'reset email mfa',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              mfaTypes: ['email'],
              isActive: true,
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          const resetButton = screen.queryAllByTestId('resetEmailButton') as HTMLButtonElement[]
          fireEvent.click(resetButton[0])
        })

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).toBeInTheDocument()
        })

        await waitFor(() => {
          const confirmButton = screen.getByTestId('confirmButton')
          fireEvent.click(confirmButton)
        })

        await waitFor(() => {
          expect(mockUnenrollEmailMfa).toHaveBeenCalledWith({ authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' })
        })
      },
    )

    it(
      'reset sms mfa',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              mfaTypes: ['sms'],
              isActive: true,
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          const resetButton = screen.queryAllByTestId('resetSmsButton') as HTMLButtonElement[]
          fireEvent.click(resetButton[0])
        })

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).toBeInTheDocument()
        })

        await waitFor(() => {
          const confirmButton = screen.getByTestId('confirmButton')
          fireEvent.click(confirmButton)
        })

        await waitFor(() => {
          expect(mockUnenrollSmsMfa).toHaveBeenCalledWith({ authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' })
        })
      },
    )

    it(
      'reset otp mfa',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              mfaTypes: ['otp'],
              isActive: true,
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          const resetButton = screen.queryAllByTestId('resetOtpButton') as HTMLButtonElement[]
          fireEvent.click(resetButton[0])
        })

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).toBeInTheDocument()
        })

        await waitFor(() => {
          const confirmButton = screen.getByTestId('confirmButton')
          fireEvent.click(confirmButton)
        })

        await waitFor(() => {
          expect(mockUnenrollOtpMfa).toHaveBeenCalledWith({ authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' })
        })
      },
    )

    it(
      'unlock user',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
            },
          },
        });

        (useGetApiV1UsersByAuthIdLockedIpsQuery as Mock).mockReturnValue({ data: { lockedIPs: ['1.1.1.1', '2.2.2.2'] } })

        render(<Page />)

        await waitFor(() => {
          const unlockButton = screen.queryAllByTestId('unlockIpButton') as HTMLButtonElement[]
          fireEvent.click(unlockButton[0])
        })

        await waitFor(() => {
          expect(mockDeleteIps).toHaveBeenCalledWith({ authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' })
        })
      },
    )

    it(
      'toggle active status',
      async () => {
        const originalUserInfo = vi.mocked(userInfoSignal).value
        vi.mocked(userInfoSignal).value = { authId: 'different-user-id' } as GetUserInfoRes

        render(<Page />)

        await waitFor(() => {
          const toggleSwitch = screen.getByRole('switch')
          expect(toggleSwitch).toBeInTheDocument()
          fireEvent.click(toggleSwitch)
        })

        const saveButton = screen.getByTestId('saveButton')
        fireEvent.click(saveButton)

        await waitFor(() => {
          expect(mockUpdate).toHaveBeenLastCalledWith({
            authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
            putUserReq: { isActive: false },
          })
        })

        vi.mocked(userInfoSignal).value = originalUserInfo
      },
    )

    it(
      'shows no locked ips',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
            },
          },
        });

        (useGetApiV1UsersByAuthIdLockedIpsQuery as Mock).mockReturnValue({ data: { lockedIPs: [''] } })

        render(<Page />)

        await waitFor(() => {
          expect(screen.getByText('users.noIP')).toBeInTheDocument()
        })
      },
    )

    it(
      'shows single locale value',
      async () => {
        const originalConfig = vi.mocked(configSignal).value
        vi.mocked(configSignal).value = { SUPPORTED_LOCALES: ['en'] } as any

        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              locale: 'en',
            },
          },
        })

        render(<Page />)

        await waitFor(() => {
          expect(screen.queryByText('en')).toBeInTheDocument()
        })

        vi.mocked(configSignal).value = originalConfig
      },
    )

    it(
      'returns null when user is null',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({ data: { user: null } })

        const { container } = render(<Page />)

        expect(container.firstChild).toBeNull()
      },
    )

    it(
      'shows no locked ips section when empty',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
            },
          },
        });

        (useGetApiV1UsersByAuthIdLockedIpsQuery as Mock).mockReturnValue({ data: { lockedIPs: [] } })

        render(<Page />)

        await waitFor(() => {
          expect(screen.queryByTestId('lockedIpBadge')).not.toBeInTheDocument()
        })
      },
    )

    it(
      'shows no locked ips section when undefined',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
            },
          },
        });

        (useGetApiV1UsersByAuthIdLockedIpsQuery as Mock).mockReturnValue({ data: { lockedIPs: undefined } })

        render(<Page />)

        await waitFor(() => {
          expect(screen.queryByTestId('lockedIpBadge')).not.toBeInTheDocument()
        })
      },
    )

    it(
      'shows no passkeys section when undefined',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
            },
          },
        });

        (useGetApiV1UsersByAuthIdPasskeysQuery as Mock).mockReturnValue({ data: { passkeys: undefined } })

        render(<Page />)

        await waitFor(() => {
          expect(screen.queryByTestId('passkeyBadge')).not.toBeInTheDocument()
        })
      },
    )

    it(
      'shows no consented apps section when undefined',
      async () => {
        (useGetApiV1UsersByAuthIdConsentedAppsQuery as Mock).mockReturnValue({ data: { consentedApps: undefined } })

        render(<Page />)

        await waitFor(() => {
          expect(screen.getByText('users.noConsented')).toBeInTheDocument()
        })
      },
    )

    it(
      'shows no roles section when undefined',
      async () => {
        (useGetApiV1RolesQuery as Mock).mockReturnValue({ data: { roles: undefined } })

        render(<Page />)

        await waitFor(() => {
          expect(screen.queryByTestId('roleInput')).not.toBeInTheDocument()
        })
      },
    )

    it(
      'update when user roles is null',
      async () => {
        (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...users[0],
              socialAccountId: null,
              roles: null,
              isActive: true,
            },
          },
        })

        render(<Page />)

        mockUpdate.mockClear()

        const saveButton = screen.getByTestId('saveButton')
        fireEvent.click(saveButton)

        await waitFor(() => {
          expect(mockUpdate).not.toHaveBeenCalled()
        })
      },
    )
  },
)
