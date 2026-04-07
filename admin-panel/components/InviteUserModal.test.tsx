import {
  fireEvent, screen, waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import InviteUserModal from 'components/InviteUserModal'
import { render } from 'vitest.setup'
import {
  useGetApiV1RolesQuery,
  useGetApiV1OrgsQuery,
  useGetApiV1AppsQuery,
  usePostApiV1UsersInvitationsMutation,
} from 'services/auth/api'
import { roles } from 'tests/roleMock'

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1RolesQuery: vi.fn(),
    useGetApiV1OrgsQuery: vi.fn(),
    useGetApiV1AppsQuery: vi.fn(),
    usePostApiV1UsersInvitationsMutation: vi.fn(),
  }),
)

vi.mock(
  'signals',
  () => ({
    configSignal: {
      value: {
        ENABLE_NAMES: true,
        SUPPORTED_LOCALES: ['en', 'fr'],
        ENABLE_ORG: true,
      },
      subscribe: () => () => {},
    },
    errorSignal: {
      value: '',
      subscribe: () => () => {},
    },
  }),
)

const mockPostInvitation = vi.fn()
const mockOnClose = vi.fn()
const mockOnInvited = vi.fn()

const spaApp = {
  id: 1,
  clientId: 'client-1',
  name: 'Admin Panel (SPA)',
  isActive: true,
  type: 'spa',
  redirectUris: [
    'http://localhost:3000/en/dashboard',
    'http://localhost:3000/fr/dashboard',
  ],
  useSystemMfaConfig: true,
  requireEmailMfa: false,
  requireOtpMfa: false,
  requireSmsMfa: false,
  allowEmailMfaAsBackup: false,
  createdAt: '',
  updatedAt: '',
  deletedAt: null,
}

describe(
  'InviteUserModal',
  () => {
    beforeEach(() => {
      (useGetApiV1RolesQuery as Mock).mockReturnValue({ data: { roles } });
      (useGetApiV1OrgsQuery as Mock).mockReturnValue({ data: { orgs: [] } });
      (useGetApiV1AppsQuery as Mock).mockReturnValue({ data: { apps: [] } });
      (usePostApiV1UsersInvitationsMutation as Mock)
        .mockReturnValue([mockPostInvitation, { isLoading: false }])
    })

    it(
      'renders modal content when show is true',
      async () => {
        render(
          <InviteUserModal
            show={true}
            onClose={mockOnClose}
            onInvited={mockOnInvited}
          />,
        )

        await waitFor(() => {
          expect(screen.getByTestId('inviteEmail')).toBeInTheDocument()
          expect(screen.getByTestId('confirmInvite')).toBeInTheDocument()
          expect(screen.getByText('users.inviteUser')).toBeInTheDocument()
        })
      },
    )

    it(
      'does not render modal content when show is false',
      () => {
        render(
          <InviteUserModal
            show={false}
            onClose={mockOnClose}
            onInvited={mockOnInvited}
          />,
        )

        expect(screen.queryByTestId('inviteEmail')).not.toBeInTheDocument()
        expect(screen.queryByTestId('confirmInvite')).not.toBeInTheDocument()
      },
    )

    it(
      'shows email required error when submitting without email',
      async () => {
        render(
          <InviteUserModal
            show={true}
            onClose={mockOnClose}
            onInvited={mockOnInvited}
          />,
        )

        fireEvent.click(screen.getByTestId('confirmInvite'))

        await waitFor(() => {
          expect(screen.getByText('common.fieldIsRequired')).toBeInTheDocument()
        })
        expect(mockPostInvitation).not.toHaveBeenCalled()
      },
    )

    it(
      'invites user with email only',
      async () => {
        mockPostInvitation.mockResolvedValue({ data: { user: { id: 1 } } })

        render(
          <InviteUserModal
            show={true}
            onClose={mockOnClose}
            onInvited={mockOnInvited}
          />,
        )

        fireEvent.change(
          screen.getByTestId('inviteEmail'),
          { target: { value: 'test@example.com' } },
        )
        fireEvent.click(screen.getByTestId('confirmInvite'))

        await waitFor(() => {
          expect(mockPostInvitation).toHaveBeenCalledWith({
            body: {
              email: 'test@example.com',
              firstName: undefined,
              lastName: undefined,
              locale: undefined,
              orgSlug: undefined,
              roles: undefined,
              signinUrl: undefined,
            },
          })
          expect(mockOnInvited).toHaveBeenCalled()
        })
      },
    )

    it(
      'invites user with first name, last name, and locale',
      async () => {
        mockPostInvitation.mockResolvedValue({ data: { user: { id: 1 } } })

        render(
          <InviteUserModal
            show={true}
            onClose={mockOnClose}
            onInvited={mockOnInvited}
          />,
        )

        fireEvent.change(
          screen.getByTestId('inviteEmail'),
          { target: { value: 'john@example.com' } },
        )
        fireEvent.change(
          screen.getByTestId('inviteFirstName'),
          { target: { value: 'John' } },
        )
        fireEvent.change(
          screen.getByTestId('inviteLastName'),
          { target: { value: 'Doe' } },
        )
        fireEvent.click(screen.getByTestId('inviteLocale'))
        fireEvent.click(screen.getByTestId('inviteLocaleOption-fr'))
        fireEvent.click(screen.getByTestId('confirmInvite'))

        await waitFor(() => {
          expect(mockPostInvitation).toHaveBeenCalledWith({
            body: {
              email: 'john@example.com',
              firstName: 'John',
              lastName: 'Doe',
              locale: 'fr',
              orgSlug: undefined,
              roles: undefined,
              signinUrl: undefined,
            },
          })
        })
      },
    )

    it(
      'invites user with selected roles',
      async () => {
        mockPostInvitation.mockResolvedValue({ data: { user: { id: 1 } } })

        render(
          <InviteUserModal
            show={true}
            onClose={mockOnClose}
            onInvited={mockOnInvited}
          />,
        )

        fireEvent.change(
          screen.getByTestId('inviteEmail'),
          { target: { value: 'test@example.com' } },
        )
        fireEvent.click(screen.getByTestId('inviteRole-super_admin'))
        fireEvent.click(screen.getByTestId('confirmInvite'))

        await waitFor(() => {
          expect(mockPostInvitation).toHaveBeenCalledWith({
            body: {
              email: 'test@example.com',
              firstName: undefined,
              lastName: undefined,
              locale: undefined,
              orgSlug: undefined,
              roles: ['super_admin'],
              signinUrl: undefined,
            },
          })
        })
      },
    )

    it(
      'invites user with org',
      async () => {
        mockPostInvitation.mockResolvedValue({ data: { user: { id: 1 } } });

        (useGetApiV1OrgsQuery as Mock).mockReturnValue({
          data: {
            orgs: [{
              id: 1,
              name: 'Acme Corp',
              slug: 'acme',
              onlyUseForBrandingOverride: false,
            }],
          },
        })

        render(
          <InviteUserModal
            show={true}
            onClose={mockOnClose}
            onInvited={mockOnInvited}
          />,
        )

        fireEvent.change(
          screen.getByTestId('inviteEmail'),
          { target: { value: 'test@example.com' } },
        )

        await waitFor(() => {
          expect(screen.getByTestId('inviteOrg')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByTestId('inviteOrg'))
        fireEvent.click(screen.getByTestId('inviteOrgOption-acme'))
        fireEvent.click(screen.getByTestId('confirmInvite'))

        await waitFor(() => {
          expect(mockPostInvitation).toHaveBeenCalledWith({
            body: expect.objectContaining({ orgSlug: 'acme' }),
          })
        })
      },
    )

    it(
      'invites user with redirect app and URL',
      async () => {
        mockPostInvitation.mockResolvedValue({ data: { user: { id: 1 } } });

        (useGetApiV1AppsQuery as Mock).mockReturnValue({ data: { apps: [spaApp] } })

        render(
          <InviteUserModal
            show={true}
            onClose={mockOnClose}
            onInvited={mockOnInvited}
          />,
        )

        fireEvent.change(
          screen.getByTestId('inviteEmail'),
          { target: { value: 'test@example.com' } },
        )
        fireEvent.click(screen.getByTestId('inviteApp'))
        fireEvent.click(screen.getByTestId('inviteAppOption-1'))
        fireEvent.click(screen.getByTestId('inviteRedirectUrl'))
        fireEvent.click(screen.getByTestId('inviteRedirectUrlOption-http://localhost:3000/fr/dashboard'))
        fireEvent.click(screen.getByTestId('confirmInvite'))

        await waitFor(() => {
          expect(mockPostInvitation).toHaveBeenCalledWith({
            body: {
              email: 'test@example.com',
              firstName: undefined,
              lastName: undefined,
              locale: undefined,
              orgSlug: undefined,
              roles: undefined,
              signinUrl: 'http://localhost:3000/fr/dashboard',
            },
          })
        })
      },
    )

    it(
      'calls onClose and resets fields when cancel is clicked',
      async () => {
        render(
          <InviteUserModal
            show={true}
            onClose={mockOnClose}
            onInvited={mockOnInvited}
          />,
        )

        fireEvent.change(
          screen.getByTestId('inviteEmail'),
          { target: { value: 'test@example.com' } },
        )

        fireEvent.click(screen.getByText('common.cancel'))

        expect(mockOnClose).toHaveBeenCalled()

        const emailInput = screen.getByTestId('inviteEmail') as HTMLInputElement
        expect(emailInput.value).toBe('')
      },
    )
  },
)
