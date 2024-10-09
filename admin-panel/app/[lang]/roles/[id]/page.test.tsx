import {
  fireEvent, screen,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/roles/[id]/page'
import { roles } from 'tests/roleMock'
import { render } from 'vitest.setup'
import {
  useGetApiV1RolesByIdQuery,
  usePutApiV1RolesByIdMutation,
  useDeleteApiV1RolesByIdMutation,
} from 'services/auth/api'

vi.mock(
  'next/navigation',
  () => ({
    useParams: vi.fn().mockReturnValue({ id: '2' }),
    useRouter: vi.fn().mockReturnValue({ push: () => {} }),
  }),
)

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1RolesByIdQuery: vi.fn(),
    usePutApiV1RolesByIdMutation: vi.fn(),
    useDeleteApiV1RolesByIdMutation: vi.fn(),
  }),
)

const mockUpdate = vi.fn()
const mockDelete = vi.fn()
describe(
  'Page Component',
  () => {
    beforeEach(() => {
      (useGetApiV1RolesByIdQuery as Mock).mockReturnValue({ data: { role: roles[1] } });
      (usePutApiV1RolesByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteApiV1RolesByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }])
    })

    it(
      'render role',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const deleteBtn = screen.queryByTestId('deleteButton')
        expect(nameInput?.value).toBe(roles[1].name)
        expect(noteInput?.value).toBe(roles[1].note)
        expect(saveBtn?.disabled).toBeTruthy()
        expect(deleteBtn).toBeInTheDocument()
      },
    )

    it(
      'update role',
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

        expect(nameInput?.value).toBe('new name')
        expect(noteInput?.value).toBe('new note')
        expect(saveBtn?.disabled).toBeFalsy()
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenLastCalledWith({
          id: 2,
          putRoleReq: {
            name: 'new name',
            note: 'new note',
          },
        })
      },
    )

    it(
      'delete role',
      async () => {
        render(<Page />)

        const deleteBtn = screen.queryByTestId('deleteButton') as HTMLButtonElement
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        fireEvent.click(deleteBtn)
        expect(screen.queryByRole('dialog')).toBeInTheDocument()

        fireEvent.click(screen.queryByTestId('confirmButton') as HTMLButtonElement)

        expect(mockDelete).toHaveBeenLastCalledWith({ id: 2 })
      },
    )
  },
)
