import {
  fireEvent, screen,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/scopes/[id]/page'
import { scopes } from 'tests/scopeMock'
import { render } from 'vitest.setup'
import {
  useGetApiV1ScopesByIdQuery,
  usePutApiV1ScopesByIdMutation,
  useDeleteApiV1ScopesByIdMutation,
} from 'services/auth/api'
import { configSignal } from 'signals'

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
    useGetApiV1ScopesByIdQuery: vi.fn(),
    usePutApiV1ScopesByIdMutation: vi.fn(),
    useDeleteApiV1ScopesByIdMutation: vi.fn(),
  }),
)

vi.mock(
  'signals',
  () => ({
    configSignal: {
      value: {
        ENABLE_USER_APP_CONSENT: true,
        SUPPORTED_LOCALES: ['en', 'fr'],
      },
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

describe(
  'Spa System Scope',
  () => {
    beforeEach(() => {
      (useGetApiV1ScopesByIdQuery as Mock).mockReturnValue({ data: { scope: scopes[0] } });
      (usePutApiV1ScopesByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteApiV1ScopesByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }])
    })

    it(
      'render scope',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const deleteBtn = screen.queryByTestId('deleteButton')
        const localeInputs = screen.queryAllByTestId('localeInput')
        expect(nameInput).not.toBeInTheDocument()
        expect(noteInput?.value).toBe(scopes[0].note)
        expect(localeInputs.length).toBe(2)
        expect(saveBtn?.disabled).toBeTruthy()
        expect(deleteBtn).not.toBeInTheDocument()
      },
    )

    it(
      'update scope',
      async () => {
        render(<Page />)

        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const localeInputs = screen.queryAllByTestId('localeInput') as HTMLInputElement[]
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          noteInput,
          { target: { value: 'new note' } },
        )

        fireEvent.change(
          localeInputs[0],
          { target: { value: 'test en' } },
        )

        fireEvent.change(
          localeInputs[1],
          { target: { value: 'test fr' } },
        )

        expect(noteInput?.value).toBe('new note')
        expect(localeInputs[0]?.value).toBe('test en')
        expect(localeInputs[1]?.value).toBe('test fr')
        expect(saveBtn?.disabled).toBeFalsy()
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenLastCalledWith({
          id: 1,
          putScopeReq: {
            note: 'new note',
            locales: [
              {
                locale: 'en', value: 'test en',
              },
              {
                locale: 'fr', value: 'test fr',
              },
            ],
          },
        })
      },
    )
  },
)

describe(
  'Spa non-system Scope',
  () => {
    beforeEach(() => {
      (useGetApiV1ScopesByIdQuery as Mock).mockReturnValue({ data: { scope: scopes[2] } });
      (usePutApiV1ScopesByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteApiV1ScopesByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }])
      mockNav = {
        id: '3',
        push: vi.fn(),
      }
    })

    it(
      'render scope',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const deleteBtn = screen.queryByTestId('deleteButton')
        const localeInputs = screen.queryAllByTestId('localeInput')
        expect(nameInput?.value).toBe(scopes[2].name)
        expect(noteInput?.value).toBe(scopes[2].note)
        expect(localeInputs.length).toBe(2)
        expect(saveBtn?.disabled).toBeTruthy()
        expect(deleteBtn).toBeInTheDocument()
      },
    )

    it(
      'update scope',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const localeInputs = screen.queryAllByTestId('localeInput') as HTMLInputElement[]
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'new name' } },
        )

        fireEvent.change(
          noteInput,
          { target: { value: 'new note' } },
        )

        fireEvent.change(
          localeInputs[0],
          { target: { value: 'test en' } },
        )

        fireEvent.change(
          localeInputs[1],
          { target: { value: 'test fr' } },
        )

        expect(nameInput?.value).toBe('new name')
        expect(noteInput?.value).toBe('new note')
        expect(localeInputs[0]?.value).toBe('test en')
        expect(localeInputs[1]?.value).toBe('test fr')
        expect(saveBtn?.disabled).toBeFalsy()
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenLastCalledWith({
          id: 3,
          putScopeReq: {
            name: 'new name',
            note: 'new note',
            locales: [
              {
                locale: 'en', value: 'test en',
              },
              {
                locale: 'fr', value: 'test fr',
              },
            ],
          },
        })
      },
    )

    it(
      'update when app consent not enabled',
      async () => {
        vi.mocked(configSignal as unknown as { value: object }).value = {
          ENABLE_USER_APP_CONSENT: false,
          SUPPORTED_LOCALES: ['en', 'fr'],
        }

        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const localeInputs = screen.queryAllByTestId('localeInput') as HTMLInputElement[]
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        expect(localeInputs.length).toBe(0)

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
          id: 3,
          putScopeReq: {
            name: 'new name',
            note: 'new note',
          },
        })

        vi.mocked(configSignal as unknown as { value: object }).value = {
          ENABLE_USER_APP_CONSENT: false,
          SUPPORTED_LOCALES: ['en', 'fr'],
        }
      },
    )

    it(
      'delete scope',
      async () => {
        render(<Page />)

        const deleteBtn = screen.queryByTestId('deleteButton') as HTMLButtonElement
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        fireEvent.click(deleteBtn)
        expect(screen.queryByRole('dialog')).toBeInTheDocument()

        fireEvent.click(screen.queryByTestId('confirmButton') as HTMLButtonElement)

        expect(mockDelete).toHaveBeenLastCalledWith({ id: 3 })
      },
    )
  },
)

describe(
  'S2S System Scope',
  () => {
    beforeEach(() => {
      (useGetApiV1ScopesByIdQuery as Mock).mockReturnValue({ data: { scope: scopes[1] } });
      (usePutApiV1ScopesByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteApiV1ScopesByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }])
      mockNav = {
        id: '2',
        push: vi.fn(),
      }
    })

    it(
      'render scope',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const deleteBtn = screen.queryByTestId('deleteButton')
        const localeInputs = screen.queryAllByTestId('localeInput')
        expect(nameInput).not.toBeInTheDocument()
        expect(noteInput?.value).toBe(scopes[1].note)
        expect(localeInputs.length).toBe(0)
        expect(saveBtn?.disabled).toBeTruthy()
        expect(deleteBtn).not.toBeInTheDocument()
      },
    )

    it(
      'update scope',
      async () => {
        render(<Page />)

        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          noteInput,
          { target: { value: 'new note' } },
        )

        expect(noteInput?.value).toBe('new note')
        expect(saveBtn?.disabled).toBeFalsy()
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenLastCalledWith({
          id: 2,
          putScopeReq: { note: 'new note' },
        })
      },
    )
  },
)

describe(
  'S2S non-system Scope',
  () => {
    beforeEach(() => {
      (useGetApiV1ScopesByIdQuery as Mock).mockReturnValue({ data: { scope: scopes[3] } });
      (usePutApiV1ScopesByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteApiV1ScopesByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }])
      mockNav = {
        id: '4',
        push: vi.fn(),
      }
    })

    it(
      'render scope',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const deleteBtn = screen.queryByTestId('deleteButton')
        const localeInputs = screen.queryAllByTestId('localeInput')
        expect(nameInput?.value).toBe(scopes[3].name)
        expect(noteInput?.value).toBe(scopes[3].note)
        expect(localeInputs.length).toBe(0)
        expect(saveBtn?.disabled).toBeTruthy()
        expect(deleteBtn).toBeInTheDocument()
      },
    )

    it(
      'update scope',
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
          id: 4,
          putScopeReq: {
            name: 'new name',
            note: 'new note',
          },
        })
      },
    )

    it(
      'delete scope',
      async () => {
        render(<Page />)

        const deleteBtn = screen.queryByTestId('deleteButton') as HTMLButtonElement
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        fireEvent.click(deleteBtn)
        expect(screen.queryByRole('dialog')).toBeInTheDocument()

        fireEvent.click(screen.queryByTestId('confirmButton') as HTMLButtonElement)

        expect(mockDelete).toHaveBeenLastCalledWith({ id: 4 })
      },
    )
  },
)
