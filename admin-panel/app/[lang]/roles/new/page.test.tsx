import {
  fireEvent, screen,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/roles/new/page'
import { render } from 'vitest.setup'
import { usePostApiV1RolesMutation } from 'services/auth/api'

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn().mockReturnValue({ push: () => {} }) }),
)

vi.mock(
  'services/auth/api',
  () => ({ usePostApiV1RolesMutation: vi.fn() }),
)

const mockCreate = vi.fn().mockReturnValue({ data: { role: { id: 3 } } })
describe(
  'Page Component',
  () => {
    beforeEach(() => {
      (usePostApiV1RolesMutation as Mock).mockReturnValue([mockCreate, { isLoading: false }])
    })

    it(
      'render page',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        expect(nameInput?.value).toBe('')
        expect(noteInput?.value).toBe('')
        expect(saveBtn).toBeInTheDocument()
      },
    )

    it(
      'create role',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'new name' } },
        )
        fireEvent.change(
          noteInput,
          { target: { value: 'new note' } },
        )

        fireEvent.click(saveBtn)

        expect(mockCreate).toHaveBeenLastCalledWith({
          postRoleReq: {
            name: 'new name',
            note: 'new note',
          },
        })
      },
    )

    it(
      'should show errors and not create role when validation fails',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        // Reset mock before test
        mockCreate.mockClear()

        // Leave name empty to trigger validation error
        fireEvent.change(
          nameInput,
          { target: { value: ' ' } },
        )
        fireEvent.click(saveBtn)

        // Verify error is displayed
        const errorMessage = await screen.findByTestId('fieldError')
        expect(errorMessage).toBeInTheDocument()

        // Verify create was not called
        expect(mockCreate).not.toHaveBeenCalled()
      },
    )
  },
)
