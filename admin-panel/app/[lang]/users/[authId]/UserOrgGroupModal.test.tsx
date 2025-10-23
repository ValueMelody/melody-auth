import {
  fireEvent, screen, waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import UserOrgGroupModal from './UserOrgGroupModal'
import { render } from 'vitest.setup'
import {
  useGetApiV1OrgGroupsQuery,
  usePostApiV1UsersByAuthIdOrgGroupsAndOrgGroupIdMutation,
  useDeleteApiV1UsersByAuthIdOrgGroupsAndOrgGroupIdMutation,
  useGetApiV1UsersByAuthIdQuery,
} from 'services/auth/api'

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1OrgGroupsQuery: vi.fn(),
    usePostApiV1UsersByAuthIdOrgGroupsAndOrgGroupIdMutation: vi.fn(),
    useDeleteApiV1UsersByAuthIdOrgGroupsAndOrgGroupIdMutation: vi.fn(),
    useGetApiV1UsersByAuthIdQuery: vi.fn(),
  }),
)

vi.mock(
  'signals',
  () => ({
    errorSignal: {
      value: '',
      subscribe: () => () => {},
    },
  }),
)

const mockOrgGroups = [
  {
    id: 1, name: 'Admin Group',
  },
  {
    id: 2, name: 'Manager Group',
  },
  {
    id: 3, name: 'User Group',
  },
]

const mockUser = {
  authId: 'test-auth-id',
  orgGroups: [
    {
      id: 1, name: 'Admin Group',
    },
    {
      id: 2, name: 'Manager Group',
    },
  ],
}

const mockPostUserOrgGroup = vi.fn()
const mockDeleteUserOrgGroup = vi.fn()
const mockRefetchUser = vi.fn()
const mockOnClose = vi.fn()

describe(
  'UserOrgGroupModal',
  () => {
    beforeEach(() => {
      vi.clearAllMocks()

      ;(useGetApiV1OrgGroupsQuery as Mock).mockReturnValue({ data: { orgGroups: mockOrgGroups } })

      ;(useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
        data: { user: mockUser },
        refetch: mockRefetchUser,
      })

      ;(usePostApiV1UsersByAuthIdOrgGroupsAndOrgGroupIdMutation as Mock).mockReturnValue([
        mockPostUserOrgGroup,
        { isLoading: false },
      ])

      ;(useDeleteApiV1UsersByAuthIdOrgGroupsAndOrgGroupIdMutation as Mock).mockReturnValue([
        mockDeleteUserOrgGroup,
        { isLoading: false },
      ])

      mockPostUserOrgGroup.mockResolvedValue({ data: { success: true } })
      mockDeleteUserOrgGroup.mockResolvedValue({ data: { success: true } })
    })

    it(
      'renders modal when show is true',
      async () => {
        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          expect(screen.getByText('users.manageUserOrgGroup')).toBeInTheDocument()
          expect(screen.getByText('users.selectOrgGroups')).toBeInTheDocument()
        })
      },
    )

    it(
      'does not render modal when show is false',
      () => {
        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={false}
          onClose={mockOnClose}
        />)

        expect(screen.queryByText('users.manageUserOrgGroup')).not.toBeInTheDocument()
        expect(screen.queryByText('users.selectOrgGroups')).not.toBeInTheDocument()
      },
    )

    it(
      'displays all org groups with checkboxes',
      async () => {
        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          expect(screen.getByText('Admin Group')).toBeInTheDocument()
          expect(screen.getByText('Manager Group')).toBeInTheDocument()
          expect(screen.getByText('User Group')).toBeInTheDocument()

          const checkboxes = screen.getAllByTestId('orgGroupInput')
          expect(checkboxes).toHaveLength(3)
        })
      },
    )

    it(
      'shows correct checked states for assigned org groups',
      async () => {
        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgGroupInput')

          // Admin Group (id: 1) - should be checked
          expect(checkboxes[0]).toHaveAttribute(
            'aria-checked',
            'true',
          )

          // Manager Group (id: 2) - should be checked
          expect(checkboxes[1]).toHaveAttribute(
            'aria-checked',
            'true',
          )

          // User Group (id: 3) - should not be checked
          expect(checkboxes[2]).toHaveAttribute(
            'aria-checked',
            'false',
          )
        })
      },
    )

    it(
      'adds org group when unchecked checkbox is clicked',
      async () => {
        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgGroupInput')

          // Click on User Group (id: 3) which is not assigned
          fireEvent.click(checkboxes[2])
        })

        await waitFor(() => {
          expect(mockPostUserOrgGroup).toHaveBeenCalledWith({
            authId: 'test-auth-id',
            orgGroupId: 3,
          })
          expect(mockRefetchUser).toHaveBeenCalled()
        })
      },
    )

    it(
      'removes org group when checked checkbox is clicked',
      async () => {
        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgGroupInput')

          // Click on Admin Group (id: 1) which is assigned
          fireEvent.click(checkboxes[0])
        })

        await waitFor(() => {
          expect(mockDeleteUserOrgGroup).toHaveBeenCalledWith({
            authId: 'test-auth-id',
            orgGroupId: 1,
          })
          expect(mockRefetchUser).toHaveBeenCalled()
        })
      },
    )

    it(
      'disables checkboxes when loading',
      async () => {
        ;(usePostApiV1UsersByAuthIdOrgGroupsAndOrgGroupIdMutation as Mock).mockReturnValue([
          mockPostUserOrgGroup,
          { isLoading: true },
        ])

        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgGroupInput')
          checkboxes.forEach((checkbox) => {
            expect(checkbox).toBeDisabled()
          })
        })
      },
    )

    it(
      'disables checkboxes when deleting',
      async () => {
        ;(useDeleteApiV1UsersByAuthIdOrgGroupsAndOrgGroupIdMutation as Mock).mockReturnValue([
          mockDeleteUserOrgGroup,
          { isLoading: true },
        ])

        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgGroupInput')
          checkboxes.forEach((checkbox) => {
            expect(checkbox).toBeDisabled()
          })
        })
      },
    )

    it(
      'calls onClose when close button is clicked',
      async () => {
        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const closeButton = screen.getByText('common.close')
          fireEvent.click(closeButton)
        })

        expect(mockOnClose).toHaveBeenCalled()
      },
    )

    it(
      'handles empty org groups',
      async () => {
        ;(useGetApiV1OrgGroupsQuery as Mock).mockReturnValue({ data: { orgGroups: [] } })

        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          expect(screen.getByText('users.manageUserOrgGroup')).toBeInTheDocument()
          expect(screen.queryAllByTestId('orgGroupInput')).toHaveLength(0)
        })
      },
    )

    it(
      'handles undefined org groups',
      async () => {
        ;(useGetApiV1OrgGroupsQuery as Mock).mockReturnValue({ data: { orgGroups: undefined } })

        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          expect(screen.getByText('users.manageUserOrgGroup')).toBeInTheDocument()
          expect(screen.queryAllByTestId('orgGroupInput')).toHaveLength(0)
        })
      },
    )

    it(
      'handles user with no org groups',
      async () => {
        ;(useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...mockUser, orgGroups: [],
            },
          },
          refetch: mockRefetchUser,
        })

        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgGroupInput')
          checkboxes.forEach((checkbox) => {
            expect(checkbox).toHaveAttribute(
              'aria-checked',
              'false',
            )
          })
        })
      },
    )

    it(
      'handles user with undefined org groups',
      async () => {
        ;(useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: {
            user: {
              ...mockUser, orgGroups: undefined,
            },
          },
          refetch: mockRefetchUser,
        })

        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgGroupInput')
          checkboxes.forEach((checkbox) => {
            expect(checkbox).toHaveAttribute(
              'aria-checked',
              'false',
            )
          })
        })
      },
    )

    it(
      'handles undefined user',
      async () => {
        ;(useGetApiV1UsersByAuthIdQuery as Mock).mockReturnValue({
          data: { user: undefined },
          refetch: mockRefetchUser,
        })

        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgGroupInput')
          checkboxes.forEach((checkbox) => {
            expect(checkbox).toHaveAttribute(
              'aria-checked',
              'false',
            )
          })
        })
      },
    )

    it(
      'passes correct orgId to org groups query',
      () => {
        render(<UserOrgGroupModal
          orgId={123}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        expect(useGetApiV1OrgGroupsQuery).toHaveBeenCalledWith({ orgId: 123 })
      },
    )

    it(
      'passes correct authId to user query',
      () => {
        render(<UserOrgGroupModal
          orgId={1}
          authId='custom-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        expect(useGetApiV1UsersByAuthIdQuery).toHaveBeenCalledWith({ authId: 'custom-auth-id' })
      },
    )

    it(
      'calls post API method with correct parameters',
      async () => {
        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgGroupInput')

          // Click on User Group (id: 3) which is not assigned
          fireEvent.click(checkboxes[2])
        })

        await waitFor(() => {
          expect(mockPostUserOrgGroup).toHaveBeenCalledWith({
            authId: 'test-auth-id',
            orgGroupId: 3,
          })
          expect(mockRefetchUser).toHaveBeenCalled()
        })
      },
    )

    it(
      'calls delete API method with correct parameters',
      async () => {
        render(<UserOrgGroupModal
          orgId={1}
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgGroupInput')

          // Click on Admin Group (id: 1) which is assigned
          fireEvent.click(checkboxes[0])
        })

        await waitFor(() => {
          expect(mockDeleteUserOrgGroup).toHaveBeenCalledWith({
            authId: 'test-auth-id',
            orgGroupId: 1,
          })
          expect(mockRefetchUser).toHaveBeenCalled()
        })
      },
    )
  },
)
