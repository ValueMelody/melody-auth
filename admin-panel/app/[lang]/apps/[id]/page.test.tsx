import {
  fireEvent, screen,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/apps/[id]/page'
import { scopes } from 'tests/scopeMock'
import { render } from 'vitest.setup'
import {
  useGetApiV1AppsByIdQuery,
  usePutApiV1AppsByIdMutation,
  useDeleteApiV1AppsByIdMutation,
  useGetApiV1ScopesQuery,
} from 'services/auth/api'
import { apps } from 'tests/appMock'

let mockNav = {
  id: '1',
  push: vi.fn(),
}

vi.mock(
  'next/navigation',
  () => ({
    useParams: vi.fn(() => ({ id: mockNav.id })),
    useRouter: vi.fn(() => ({ push: mockNav.push })),
  }),
)

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1AppsByIdQuery: vi.fn(),
    usePutApiV1AppsByIdMutation: vi.fn(),
    useDeleteApiV1AppsByIdMutation: vi.fn(),
    useGetApiV1ScopesQuery: vi.fn(),
  }),
)

const mockUpdate = vi.fn()
const mockDelete = vi.fn()

describe(
  'Spa app',
  () => {
    beforeEach(() => {
      (useGetApiV1AppsByIdQuery as Mock).mockReturnValue({ data: { app: apps[0] } });
      (usePutApiV1AppsByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteApiV1AppsByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }]);
      (useGetApiV1ScopesQuery as Mock).mockReturnValue({ data: { scopes } })
    })

    it(
      'render app',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const statusInput = screen.queryByTestId('statusInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const deleteBtn = screen.queryByTestId('deleteButton')
        const scopeInputs = screen.queryAllByTestId('scopeInput')
        const redirectUriInputs = screen.queryAllByTestId('redirectUriInput') as HTMLInputElement[]
        expect(nameInput?.value).toBe(apps[0].name)
        expect(statusInput?.getAttribute('aria-checked')).toBe(apps[0].isActive ? 'true' : 'false')
        expect(redirectUriInputs.length).toBe(2)
        expect(redirectUriInputs[0]?.value).toBe(apps[0].redirectUris[0])
        expect(redirectUriInputs[1]?.value).toBe(apps[0].redirectUris[1])
        expect(scopeInputs.length).toBe(2)
        expect(saveBtn?.disabled).toBeTruthy()
        expect(deleteBtn).toBeInTheDocument()
      },
    )

    it(
      'update app',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const statusInput = screen.queryByTestId('statusInput') as HTMLInputElement
        const scopeInputs = screen.queryAllByTestId('scopeInput')
        const redirectUriInputs = screen.queryAllByTestId('redirectUriInput') as HTMLInputElement[]
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'new name' } },
        )

        fireEvent.click(statusInput)

        fireEvent.click(scopeInputs[0])

        fireEvent.change(
          redirectUriInputs[0],
          { target: { value: 'http://test.com' } },
        )

        expect(nameInput?.value).toBe('new name')
        expect(statusInput.getAttribute('aria-checked')).toBe('false')
        expect(redirectUriInputs[0]?.value).toBe('http://test.com')

        expect(saveBtn?.disabled).toBeFalsy()
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenLastCalledWith({
          id: 1,
          putAppReq: {
            name: 'new name',
            isActive: false,
            scopes: ['openid'],
            redirectUris: [
              'http://test.com',
              apps[0].redirectUris[1],
            ],
          },
        })
      },
    )

    it(
      'delete app',
      async () => {
        render(<Page />)

        const deleteBtn = screen.queryByTestId('deleteButton') as HTMLButtonElement
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        fireEvent.click(deleteBtn)
        expect(screen.queryByRole('dialog')).toBeInTheDocument()

        fireEvent.click(screen.queryByTestId('confirmButton') as HTMLButtonElement)

        expect(mockDelete).toHaveBeenLastCalledWith({ id: 1 })
      },
    )
  },
)

describe(
  'S2S app',
  () => {
    beforeEach(() => {
      (useGetApiV1AppsByIdQuery as Mock).mockReturnValue({ data: { app: apps[1] } });
      (usePutApiV1AppsByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteApiV1AppsByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }]);
      (useGetApiV1ScopesQuery as Mock).mockReturnValue({ data: { scopes } })
      mockNav = {
        id: '2',
        push: vi.fn(),
      }
    })

    it(
      'render app',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const statusInput = screen.queryByTestId('statusInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const deleteBtn = screen.queryByTestId('deleteButton')
        const scopeInputs = screen.queryAllByTestId('scopeInput')
        const redirectUriInputs = screen.queryAllByTestId('redirectUriInput') as HTMLInputElement[]
        expect(nameInput?.value).toBe(apps[1].name)
        expect(statusInput?.getAttribute('aria-checked')).toBe(apps[1].isActive ? 'true' : 'false')
        expect(redirectUriInputs.length).toBe(0)
        expect(scopeInputs.length).toBe(2)
        expect(saveBtn?.disabled).toBeTruthy()
        expect(deleteBtn).toBeInTheDocument()
      },
    )

    it(
      'update app',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const statusInput = screen.queryByTestId('statusInput') as HTMLInputElement
        const scopeInputs = screen.queryAllByTestId('scopeInput')
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'new name' } },
        )

        fireEvent.click(statusInput)

        fireEvent.click(scopeInputs[0])

        fireEvent.click(scopeInputs[1])

        expect(nameInput?.value).toBe('new name')
        expect(statusInput.getAttribute('aria-checked')).toBe('false')

        expect(saveBtn?.disabled).toBeFalsy()
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenLastCalledWith({
          id: 2,
          putAppReq: {
            name: 'new name',
            isActive: false,
            scopes: ['root', 'test s2s'],
          },
        })
      },
    )

    it(
      'delete app',
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
