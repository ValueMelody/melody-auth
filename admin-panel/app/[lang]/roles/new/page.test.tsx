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
  'next/navigation',
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
  },
)
