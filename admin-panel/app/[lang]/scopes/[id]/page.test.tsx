import {
  fireEvent, screen,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
  afterEach,
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
  () => ({ useParams: vi.fn(() => ({ id: mockNav.id })) }),
)

const mockUseAuth = vi.fn().mockReturnValue({
  userInfo: {
    authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
    roles: ['super_admin'],
  },
})

// Mock useAuth hook
vi.mock(
  '@melody-auth/react',
  () => ({ useAuth: () => mockUseAuth() }),
)

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn(() => ({ push: () => {} })) }),
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

    it(
      'returns null when scope is not found',
      async () => {
      // Mock API to return no scope data
        ;(useGetApiV1ScopesByIdQuery as Mock).mockReturnValue({ data: { scope: undefined } })

        const { container } = render(<Page />)

        // Verify component renders nothing
        expect(container.firstChild).toBeNull()
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
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

        fireEvent.click(deleteBtn)
        expect(screen.queryByRole('alertdialog')).toBeInTheDocument()

        fireEvent.click(screen.queryByTestId('confirmButton') as HTMLButtonElement)

        expect(mockDelete).toHaveBeenLastCalledWith({ id: 3 })
      },
    )

    it(
      'shows validation errors on save attempt',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        // Change name to invalid value to trigger validation error
        fireEvent.change(
          nameInput,
          { target: { value: ' ' } }, // Empty name should trigger validation error
        )

        mockUpdate.mockClear()

        expect(saveBtn?.disabled).toBeFalsy() // Button should be enabled since value changed
        fireEvent.click(saveBtn)

        // Verify error is displayed
        const errorMessage = screen.getByTestId('fieldError')
        expect(errorMessage).toBeInTheDocument()

        // Verify update was not called
        expect(mockUpdate).not.toHaveBeenCalled()
      },
    )

    describe(
      'locale comparison logic',
      () => {
        beforeEach(() => {
        // Set config for all locale tests
          vi.mocked(configSignal as unknown as { value: object }).value = {
            ENABLE_USER_APP_CONSENT: true,
            SUPPORTED_LOCALES: ['en', 'fr'],
          }
        })

        afterEach(() => {
        // Reset config after each test
          vi.mocked(configSignal as unknown as { value: object }).value = {
            ENABLE_USER_APP_CONSENT: false,
            SUPPORTED_LOCALES: ['en', 'fr'],
          }
        })

        it(
          'detects when locales are added',
          async () => {
            const scopeWithoutLocales = {
              ...scopes[2],
              locales: undefined,
            }

        ;(useGetApiV1ScopesByIdQuery as Mock).mockReturnValue({ data: { scope: scopeWithoutLocales } })

            render(<Page />)

            const localeInputs = screen.queryAllByTestId('localeInput') as HTMLInputElement[]
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

            // Add values to locale inputs
            fireEvent.change(
              localeInputs[0],
              { target: { value: 'test en' } },
            )

            expect(saveBtn?.disabled).toBeFalsy()
          },
        )

        it(
          'detects when number of locales changes',
          async () => {
            const scopeWithDifferentLocales = {
              ...scopes[2],
              locales: [{
                locale: 'en', value: 'test',
              }], // Only one locale
            }

        ;(useGetApiV1ScopesByIdQuery as Mock).mockReturnValue({ data: { scope: scopeWithDifferentLocales } })

            render(<Page />)

            const localeInputs = screen.queryAllByTestId('localeInput') as HTMLInputElement[]
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

            // Add values to both locale inputs
            fireEvent.change(
              localeInputs[0],
              { target: { value: 'new en' } },
            )
            fireEvent.change(
              localeInputs[1],
              { target: { value: 'new fr' } },
            )

            expect(saveBtn?.disabled).toBeFalsy()
          },
        )

        it(
          'detects when locale values change',
          async () => {
            const scopeWithLocales = {
              ...scopes[2],
              locales: [
                {
                  locale: 'en', value: 'original en',
                },
                {
                  locale: 'fr', value: 'original fr',
                },
              ],
            }

        ;(useGetApiV1ScopesByIdQuery as Mock).mockReturnValue({ data: { scope: scopeWithLocales } })

            render(<Page />)

            const localeInputs = screen.queryAllByTestId('localeInput') as HTMLInputElement[]
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

            // Change just one locale value
            fireEvent.change(
              localeInputs[0],
              { target: { value: 'new en' } },
            )

            expect(saveBtn?.disabled).toBeFalsy()
          },
        )
      },
    )

    it(
      'disables save button when no changes made',
      async () => {
        const unchangedScope = {
          ...scopes[2],
          name: 'test scope',
          note: 'test note',
          locales: [
            {
              locale: 'en', value: 'english text',
            },
            {
              locale: 'fr', value: 'french text',
            },
          ],
        }

      ;(useGetApiV1ScopesByIdQuery as Mock).mockReturnValue({ data: { scope: unchangedScope } })

        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        // Verify initial values
        expect(nameInput?.value).toBe('test scope')
        expect(noteInput?.value).toBe('test note')

        // Change values and then change back to original
        fireEvent.change(
          nameInput,
          { target: { value: 'changed name' } },
        )
        fireEvent.change(
          nameInput,
          { target: { value: 'test scope' } }, // Change back to original
        )

        fireEvent.change(
          noteInput,
          { target: { value: 'changed note' } },
        )
        fireEvent.change(
          noteInput,
          { target: { value: 'test note' } }, // Change back to original
        )

        // Verify save button is disabled when no actual changes exist
        expect(saveBtn?.disabled).toBeTruthy()
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
      'update scope name only',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'new name' } },
        )

        expect(nameInput?.value).toBe('new name')
        expect(saveBtn?.disabled).toBeFalsy()
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenLastCalledWith({
          id: 4,
          putScopeReq: { name: 'new name' },
        })
      },
    )

    it(
      'delete scope',
      async () => {
        render(<Page />)

        const deleteBtn = screen.queryByTestId('deleteButton') as HTMLButtonElement
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

        fireEvent.click(deleteBtn)
        expect(screen.queryByRole('alertdialog')).toBeInTheDocument()

        fireEvent.click(screen.queryByTestId('confirmButton') as HTMLButtonElement)

        expect(mockDelete).toHaveBeenLastCalledWith({ id: 4 })
      },
    )
  },
)
