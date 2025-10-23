import {
  fireEvent, screen, waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import UserOrgsModal from './UserOrgsModal'
import { render } from 'vitest.setup'
import {
  useGetApiV1OrgsQuery,
  useGetApiV1UsersByAuthIdOrgsQuery,
  usePostApiV1UsersByAuthIdOrgsMutation,
} from 'services/auth/api'

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1OrgsQuery: vi.fn(),
    useGetApiV1UsersByAuthIdOrgsQuery: vi.fn(),
    usePostApiV1UsersByAuthIdOrgsMutation: vi.fn(),
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

const mockOrgs = [
  {
    id: 1, name: 'Org 1', onlyUseForBrandingOverride: false,
  },
  {
    id: 2, name: 'Org 2', onlyUseForBrandingOverride: false,
  },
  {
    id: 3, name: 'Org 3', onlyUseForBrandingOverride: false,
  },
  {
    id: 4, name: 'Branding Org', onlyUseForBrandingOverride: true,
  },
]

const mockUserOrgs = [
  {
    id: 1, name: 'Org 1',
  },
  {
    id: 2, name: 'Org 2',
  },
]

const mockPostUserOrgs = vi.fn()
const mockOnClose = vi.fn()

describe(
  'UserOrgsModal',
  () => {
    beforeEach(() => {
      vi.clearAllMocks()

      ;(useGetApiV1OrgsQuery as Mock).mockReturnValue({ data: { orgs: mockOrgs } })

      ;(useGetApiV1UsersByAuthIdOrgsQuery as Mock).mockReturnValue({
        data: { orgs: mockUserOrgs },
        isLoading: false,
      })

      ;(usePostApiV1UsersByAuthIdOrgsMutation as Mock).mockReturnValue([
        mockPostUserOrgs,
        { isLoading: false },
      ])

      mockPostUserOrgs.mockResolvedValue({ data: { success: true } })
    })

    it(
      'renders modal when show is true',
      async () => {
        render(<UserOrgsModal
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
        render(<UserOrgsModal
          authId='test-auth-id'
          show={false}
          onClose={mockOnClose}
        />)

        expect(screen.queryByText('users.manageUserOrgGroup')).not.toBeInTheDocument()
        expect(screen.queryByText('users.selectOrgGroups')).not.toBeInTheDocument()
      },
    )

    it(
      'displays all orgs with checkboxes excluding branding override orgs',
      async () => {
        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          expect(screen.getByText('Org 1')).toBeInTheDocument()
          expect(screen.getByText('Org 2')).toBeInTheDocument()
          expect(screen.getByText('Org 3')).toBeInTheDocument()
          expect(screen.queryByText('Branding Org')).not.toBeInTheDocument()

          const checkboxes = screen.getAllByTestId('orgInput')
          expect(checkboxes).toHaveLength(3)
        })
      },
    )

    it(
      'shows correct checked states for assigned orgs',
      async () => {
        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgInput')

          // Org 1 (id: 1) - should be checked
          expect(checkboxes[0]).toHaveAttribute(
            'aria-checked',
            'true',
          )

          // Org 2 (id: 2) - should be checked
          expect(checkboxes[1]).toHaveAttribute(
            'aria-checked',
            'true',
          )

          // Org 3 (id: 3) - should not be checked
          expect(checkboxes[2]).toHaveAttribute(
            'aria-checked',
            'false',
          )
        })
      },
    )

    it(
      'adds org when unchecked checkbox is clicked',
      async () => {
        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgInput')

          // Click on Org 3 (id: 3) which is not assigned
          fireEvent.click(checkboxes[2])
        })

        await waitFor(() => {
          expect(mockPostUserOrgs).toHaveBeenCalledWith({
            authId: 'test-auth-id',
            body: { orgs: [1, 2, 3] },
          })
        })
      },
    )

    it(
      'removes org when checked checkbox is clicked',
      async () => {
        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgInput')

          // Click on Org 1 (id: 1) which is assigned
          fireEvent.click(checkboxes[0])
        })

        await waitFor(() => {
          expect(mockPostUserOrgs).toHaveBeenCalledWith({
            authId: 'test-auth-id',
            body: { orgs: [2] },
          })
        })
      },
    )

    it(
      'disables checkboxes when posting',
      async () => {
        ;(usePostApiV1UsersByAuthIdOrgsMutation as Mock).mockReturnValue([
          mockPostUserOrgs,
          { isLoading: true },
        ])

        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgInput')
          checkboxes.forEach((checkbox) => {
            expect(checkbox).toBeDisabled()
          })
        })
      },
    )

    it(
      'disables checkboxes when loading user orgs',
      async () => {
        ;(useGetApiV1UsersByAuthIdOrgsQuery as Mock).mockReturnValue({
          data: { orgs: mockUserOrgs },
          isLoading: true,
        })

        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgInput')
          checkboxes.forEach((checkbox) => {
            expect(checkbox).toBeDisabled()
          })
        })
      },
    )

    it(
      'calls onClose when close button is clicked',
      async () => {
        render(<UserOrgsModal
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
      'handles empty orgs',
      async () => {
        ;(useGetApiV1OrgsQuery as Mock).mockReturnValue({ data: { orgs: [] } })

        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          expect(screen.getByText('users.manageUserOrgGroup')).toBeInTheDocument()
          expect(screen.queryAllByTestId('orgInput')).toHaveLength(0)
        })
      },
    )

    it(
      'handles undefined orgs',
      async () => {
        ;(useGetApiV1OrgsQuery as Mock).mockReturnValue({ data: { orgs: undefined } })

        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          expect(screen.getByText('users.manageUserOrgGroup')).toBeInTheDocument()
          expect(screen.queryAllByTestId('orgInput')).toHaveLength(0)
        })
      },
    )

    it(
      'handles user with no orgs',
      async () => {
        ;(useGetApiV1UsersByAuthIdOrgsQuery as Mock).mockReturnValue({
          data: { orgs: [] },
          isLoading: false,
        })

        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgInput')
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
      'handles user with undefined orgs',
      async () => {
        ;(useGetApiV1UsersByAuthIdOrgsQuery as Mock).mockReturnValue({
          data: { orgs: undefined },
          isLoading: false,
        })

        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgInput')
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
      'passes correct authId to user orgs query',
      () => {
        render(<UserOrgsModal
          authId='custom-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        expect(useGetApiV1UsersByAuthIdOrgsQuery).toHaveBeenCalledWith({ authId: 'custom-auth-id' })
      },
    )

    it(
      'calls post API method with correct parameters when adding org',
      async () => {
        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgInput')

          // Click on Org 3 (id: 3) which is not assigned
          fireEvent.click(checkboxes[2])
        })

        await waitFor(() => {
          expect(mockPostUserOrgs).toHaveBeenCalledWith({
            authId: 'test-auth-id',
            body: { orgs: [1, 2, 3] },
          })
        })
      },
    )

    it(
      'calls post API method with correct parameters when removing org',
      async () => {
        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgInput')

          // Click on Org 2 (id: 2) which is assigned
          fireEvent.click(checkboxes[1])
        })

        await waitFor(() => {
          expect(mockPostUserOrgs).toHaveBeenCalledWith({
            authId: 'test-auth-id',
            body: { orgs: [1] },
          })
        })
      },
    )

    it(
      'filters out orgs with onlyUseForBrandingOverride set to true',
      async () => {
        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgInput')
          // Should only show 3 orgs, not the branding override one
          expect(checkboxes).toHaveLength(3)
          expect(screen.queryByText('Branding Org')).not.toBeInTheDocument()
        })
      },
    )

    it(
      'handles multiple toggle operations correctly',
      async () => {
        render(<UserOrgsModal
          authId='test-auth-id'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgInput')

          // First toggle - add Org 3
          fireEvent.click(checkboxes[2])
        })

        await waitFor(() => {
          expect(mockPostUserOrgs).toHaveBeenCalledWith({
            authId: 'test-auth-id',
            body: { orgs: [1, 2, 3] },
          })
        })

        // Simulate second toggle - remove Org 1
        await waitFor(() => {
          const checkboxes = screen.getAllByTestId('orgInput')
          fireEvent.click(checkboxes[0])
        })

        await waitFor(() => {
          expect(mockPostUserOrgs).toHaveBeenCalledWith({
            authId: 'test-auth-id',
            body: { orgs: [2] },
          })
        })
      },
    )
  },
)
