import {
  fireEvent, screen, waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import CreateOrgGroupModal from './CreateOrgGroupModal'
import { render } from 'vitest.setup'
import { usePostApiV1OrgGroupsMutation } from 'services/auth/api'

vi.mock(
  'services/auth/api',
  () => ({ usePostApiV1OrgGroupsMutation: vi.fn() }),
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

const mockPostOrgGroup = vi.fn()
const mockOnClose = vi.fn()

describe(
  'CreateOrgGroupModal',
  () => {
    beforeEach(() => {
      vi.clearAllMocks()

      ;(usePostApiV1OrgGroupsMutation as Mock).mockReturnValue([
        mockPostOrgGroup,
        { isLoading: false },
      ])
    })

    it(
      'renders modal when show is true',
      async () => {
        render(<CreateOrgGroupModal
          orgId={1}
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          expect(screen.getByText('orgGroups.new')).toBeInTheDocument()
          expect(screen.getByText('orgGroups.name')).toBeInTheDocument()
          expect(screen.getByTestId('nameInput')).toBeInTheDocument()
          expect(screen.getByText('orgGroups.cancel')).toBeInTheDocument()
        })
      },
    )

    it(
      'does not render modal when show is false',
      () => {
        render(<CreateOrgGroupModal
          orgId={1}
          show={false}
          onClose={mockOnClose}
        />)

        expect(screen.queryByText('orgGroups.new')).not.toBeInTheDocument()
        expect(screen.queryByTestId('nameInput')).not.toBeInTheDocument()
      },
    )

    it(
      'updates input value when typing',
      async () => {
        render(<CreateOrgGroupModal
          orgId={1}
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')

        fireEvent.change(
          nameInput,
          { target: { value: 'Test Group' } },
        )

        expect(nameInput).toHaveValue('Test Group')
      },
    )

    it(
      'disables save button when name is empty',
      async () => {
        render(<CreateOrgGroupModal
          orgId={1}
          show={true}
          onClose={mockOnClose}
        />)

        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )

        expect(saveButton).toBeDisabled()
      },
    )

    it(
      'enables save button when name is provided',
      async () => {
        render(<CreateOrgGroupModal
          orgId={1}
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')
        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )

        fireEvent.change(
          nameInput,
          { target: { value: 'Test Group' } },
        )

        expect(saveButton).not.toBeDisabled()
      },
    )

    it(
      'calls onClose when cancel button is clicked',
      async () => {
        render(<CreateOrgGroupModal
          orgId={1}
          show={true}
          onClose={mockOnClose}
        />)

        const cancelButton = screen.getByText('orgGroups.cancel')
        fireEvent.click(cancelButton)

        expect(mockOnClose).toHaveBeenCalled()
      },
    )

    it(
      'calls API with correct parameters when save is clicked',
      async () => {
        mockPostOrgGroup.mockResolvedValue({
          data: {
            orgGroup: {
              id: 1, name: 'Test Group',
            },
          },
        })

        render(<CreateOrgGroupModal
          orgId={123}
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')
        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )

        fireEvent.change(
          nameInput,
          { target: { value: 'Test Group' } },
        )
        fireEvent.click(saveButton)

        await waitFor(() => {
          expect(mockPostOrgGroup).toHaveBeenCalledWith({
            postOrgGroupReq: {
              orgId: 123,
              name: 'Test Group',
            },
          })
        })
      },
    )

    it(
      'clears form and closes modal on successful save',
      async () => {
        mockPostOrgGroup.mockResolvedValue({
          data: {
            orgGroup: {
              id: 1, name: 'Test Group',
            },
          },
        })

        render(<CreateOrgGroupModal
          orgId={1}
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')
        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )

        fireEvent.change(
          nameInput,
          { target: { value: 'Test Group' } },
        )
        fireEvent.click(saveButton)

        await waitFor(() => {
          expect(mockOnClose).toHaveBeenCalled()
        })

        // After success, if modal reopens, input should be cleared
        expect(nameInput).toHaveValue('')
      },
    )

    it(
      'shows loading state when saving',
      async () => {
        ;(usePostApiV1OrgGroupsMutation as Mock).mockReturnValue([
          mockPostOrgGroup,
          { isLoading: true },
        ])

        render(<CreateOrgGroupModal
          orgId={1}
          show={true}
          onClose={mockOnClose}
        />)

        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )

        // Save button should be disabled during loading
        expect(saveButton).toBeDisabled()
      },
    )

    it(
      'maintains input value when modal is reopened after cancel',
      async () => {
        const { rerender } = render(<CreateOrgGroupModal
          orgId={1}
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')

        // Type in input
        fireEvent.change(
          nameInput,
          { target: { value: 'Test Group' } },
        )
        expect(nameInput).toHaveValue('Test Group')

        // Close modal (cancel)
        const cancelButton = screen.getByText('orgGroups.cancel')
        fireEvent.click(cancelButton)

        // Reopen modal
        rerender(<CreateOrgGroupModal
          orgId={1}
          show={false}
          onClose={mockOnClose}
        />)

        rerender(<CreateOrgGroupModal
          orgId={1}
          show={true}
          onClose={mockOnClose}
        />)

        // Input should still have the previous value (component maintains state)
        const reopenedInput = screen.getByTestId('nameInput')
        expect(reopenedInput).toHaveValue('Test Group')
      },
    )

    it(
      'displays required property indicator',
      async () => {
        render(<CreateOrgGroupModal
          orgId={1}
          show={true}
          onClose={mockOnClose}
        />)

        // RequiredProperty component should be rendered
        expect(screen.getByText('orgGroups.name')).toBeInTheDocument()
      },
    )

    it(
      'renders with correct orgId prop',
      async () => {
        render(<CreateOrgGroupModal
          orgId={456}
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')
        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )

        fireEvent.change(
          nameInput,
          { target: { value: 'Another Group' } },
        )
        fireEvent.click(saveButton)

        await waitFor(() => {
          expect(mockPostOrgGroup).toHaveBeenCalledWith({
            postOrgGroupReq: {
              orgId: 456,
              name: 'Another Group',
            },
          })
        })
      },
    )
  },
)
