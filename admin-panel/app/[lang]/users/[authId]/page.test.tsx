import {
  fireEvent, screen,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
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
} from 'services/auth/api'
import { users } from 'tests/userMock'
import { roles } from 'tests/roleMock'

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

describe(
  'user',
  () => {
    beforeEach(() => {
      (useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({ data: { user: users[0] } });
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
      (useDeleteApiV1UsersByAuthIdSmsMfaMutation as Mock).mockReturnValue([mockUnenrollSmsMfa, { isLoading: false }])
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

        const deleteBtn = screen.queryByTestId('deleteButton') as HTMLButtonElement
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        fireEvent.click(deleteBtn)
        expect(screen.queryByRole('dialog')).toBeInTheDocument()

        fireEvent.click(screen.queryByTestId('confirmButton') as HTMLButtonElement)

        expect(mockDelete).toHaveBeenLastCalledWith({ authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' })
      },
    )
  },
)
