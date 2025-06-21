import {
  fireEvent, screen, waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import UpdateOrgGroupModal from './UpdateOrgGroupModal'
import { render } from 'vitest.setup'
import { usePutApiV1OrgGroupsByIdMutation } from 'services/auth/api'

vi.mock(
  'services/auth/api',
  () => ({ usePutApiV1OrgGroupsByIdMutation: vi.fn() }),
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

const mockUpdateOrgGroup = vi.fn()
const mockOnClose = vi.fn()

describe(
  'UpdateOrgGroupModal',
  () => {
    beforeEach(() => {
      vi.clearAllMocks()

      ;(usePutApiV1OrgGroupsByIdMutation as Mock).mockReturnValue([
        mockUpdateOrgGroup,
        { isLoading: false },
      ])
    })

    it(
      'renders modal when show is true',
      async () => {
        render(<UpdateOrgGroupModal
          id={1}
          initialName='Test Group'
          show={true}
          onClose={mockOnClose}
        />)

        await waitFor(() => {
          expect(screen.getByText('orgGroups.update')).toBeInTheDocument()
          expect(screen.getByText('orgGroups.name')).toBeInTheDocument()
          expect(screen.getByTestId('nameInput')).toBeInTheDocument()
          expect(screen.getByText('orgGroups.cancel')).toBeInTheDocument()
        })
      },
    )

    it(
      'does not render modal when show is false',
      () => {
        render(<UpdateOrgGroupModal
          id={1}
          initialName='Test Group'
          show={false}
          onClose={mockOnClose}
        />)

        expect(screen.queryByText('orgGroups.update')).not.toBeInTheDocument()
        expect(screen.queryByTestId('nameInput')).not.toBeInTheDocument()
      },
    )

    it(
      'populates input with initial name',
      async () => {
        render(<UpdateOrgGroupModal
          id={1}
          initialName='Initial Group Name'
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')
        expect(nameInput).toHaveValue('Initial Group Name')
      },
    )

    it(
      'updates input value when typing',
      async () => {
        render(<UpdateOrgGroupModal
          id={1}
          initialName='Test Group'
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')

        fireEvent.change(
          nameInput,
          { target: { value: 'Updated Group Name' } },
        )

        expect(nameInput).toHaveValue('Updated Group Name')
      },
    )

    it(
      'disables save button when name is empty',
      async () => {
        render(<UpdateOrgGroupModal
          id={1}
          initialName='Test Group'
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')
        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )

        // Clear the input
        fireEvent.change(
          nameInput,
          { target: { value: '' } },
        )

        expect(saveButton).toBeDisabled()
      },
    )

    it(
      'enables save button when name is provided',
      async () => {
        render(<UpdateOrgGroupModal
          id={1}
          initialName=''
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
        render(<UpdateOrgGroupModal
          id={1}
          initialName='Test Group'
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
        mockUpdateOrgGroup.mockResolvedValue({
          data: {
            orgGroup: {
              id: 1, name: 'Updated Group',
            },
          },
        })

        render(<UpdateOrgGroupModal
          id={123}
          initialName='Original Name'
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
          { target: { value: 'Updated Group' } },
        )
        fireEvent.click(saveButton)

        await waitFor(() => {
          expect(mockUpdateOrgGroup).toHaveBeenCalledWith({
            id: 123,
            putOrgGroupReq: { name: 'Updated Group' },
          })
        })
      },
    )

    it(
      'clears form and closes modal on successful save',
      async () => {
        mockUpdateOrgGroup.mockResolvedValue({
          data: {
            orgGroup: {
              id: 1, name: 'Updated Group',
            },
          },
        })

        render(<UpdateOrgGroupModal
          id={1}
          initialName='Original Name'
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
          { target: { value: 'Updated Group' } },
        )
        fireEvent.click(saveButton)

        await waitFor(() => {
          expect(mockOnClose).toHaveBeenCalled()
        })

        // After success, input should be cleared
        expect(nameInput).toHaveValue('')
      },
    )

    it(
      'shows loading state when saving',
      async () => {
        ;(usePutApiV1OrgGroupsByIdMutation as Mock).mockReturnValue([
          mockUpdateOrgGroup,
          { isLoading: true },
        ])

        render(<UpdateOrgGroupModal
          id={1}
          initialName='Test Group'
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
      'updates input value when initialName prop changes',
      async () => {
        const { rerender } = render(<UpdateOrgGroupModal
          id={1}
          initialName='First Name'
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')
        expect(nameInput).toHaveValue('First Name')

        // Change the initialName prop
        rerender(<UpdateOrgGroupModal
          id={1}
          initialName='Second Name'
          show={true}
          onClose={mockOnClose}
        />)

        // Input should update to reflect new initialName
        expect(nameInput).toHaveValue('Second Name')
      },
    )

    it(
      'useEffect updates name when initialName changes',
      async () => {
        const { rerender } = render(<UpdateOrgGroupModal
          id={1}
          initialName='Original'
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')

        // Manually change the input value
        fireEvent.change(
          nameInput,
          { target: { value: 'User Changed' } },
        )
        expect(nameInput).toHaveValue('User Changed')

        // Change initialName prop - should override user changes
        rerender(<UpdateOrgGroupModal
          id={1}
          initialName='New Initial'
          show={true}
          onClose={mockOnClose}
        />)

        expect(nameInput).toHaveValue('New Initial')
      },
    )

    it(
      'displays required property indicator',
      async () => {
        render(<UpdateOrgGroupModal
          id={1}
          initialName='Test Group'
          show={true}
          onClose={mockOnClose}
        />)

        // RequiredProperty component should be rendered
        expect(screen.getByText('orgGroups.name')).toBeInTheDocument()
      },
    )

    it(
      'handles empty initialName prop',
      async () => {
        render(<UpdateOrgGroupModal
          id={1}
          initialName=''
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')
        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )

        expect(nameInput).toHaveValue('')
        expect(saveButton).toBeDisabled()
      },
    )

    it(
      'maintains user changes when initialName does not change',
      async () => {
        const { rerender } = render(<UpdateOrgGroupModal
          id={1}
          initialName='Test Group'
          show={true}
          onClose={mockOnClose}
        />)

        const nameInput = screen.getByTestId('nameInput')

        // User changes the input
        fireEvent.change(
          nameInput,
          { target: { value: 'User Modified' } },
        )
        expect(nameInput).toHaveValue('User Modified')

        // Rerender with same initialName
        rerender(<UpdateOrgGroupModal
          id={1}
          initialName='Test Group'
          show={true}
          onClose={mockOnClose}
        />)

        // User changes should be preserved since initialName didn't change
        expect(nameInput).toHaveValue('User Modified')
      },
    )

    it(
      'uses correct id for different org groups',
      async () => {
        mockUpdateOrgGroup.mockResolvedValue({
          data: {
            orgGroup: {
              id: 456, name: 'Another Group',
            },
          },
        })

        render(<UpdateOrgGroupModal
          id={456}
          initialName='Another Group'
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
          { target: { value: 'Another Updated Group' } },
        )
        fireEvent.click(saveButton)

        await waitFor(() => {
          expect(mockUpdateOrgGroup).toHaveBeenCalledWith({
            id: 456,
            putOrgGroupReq: { name: 'Another Updated Group' },
          })
        })
      },
    )
  },
)
