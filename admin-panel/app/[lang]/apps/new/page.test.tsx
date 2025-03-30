import {
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/apps/new/page'
import { render } from 'vitest.setup'
import {
  usePostApiV1AppsMutation, useGetApiV1ScopesQuery,
} from 'services/auth/api'
import { scopes } from 'tests/scopeMock'

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn().mockReturnValue({ push: () => {} }) }),
)

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1ScopesQuery: vi.fn(),
    usePostApiV1AppsMutation: vi.fn(),
  }),
)

const mockCreate = vi.fn().mockReturnValue({ data: { app: { id: 6 } } })

describe(
  'Page Component',
  () => {
    beforeEach(() => {
      (usePostApiV1AppsMutation as Mock).mockReturnValue([mockCreate, { isLoading: false }]);
      (useGetApiV1ScopesQuery as Mock).mockReturnValue({ data: { scopes } })
    })

    it(
      'renders page',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const typeSelect = screen.queryByTestId('typeSelectValue') as HTMLSelectElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        expect(nameInput?.value).toBe('')
        expect(typeSelect?.innerHTML).toBe('')
        expect(saveBtn).toBeInTheDocument()
      },
    )

    it(
      'create s2s app',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const typeSelect = screen.queryByTestId('typeSelect') as HTMLSelectElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'new name' } },
        )
        fireEvent.click(typeSelect)

        const s2sOption = screen.queryByTestId('typeSelect-s2sOption') as HTMLSelectElement
        fireEvent.click(s2sOption)

        const scopeInputs = screen.queryAllByTestId('scopeInput')
        expect(scopeInputs.length).toBe(2)

        const redirectUriInputs = screen.queryAllByTestId('redirectUriInput')
        expect(redirectUriInputs.length).toBe(0)

        fireEvent.click(scopeInputs[0])

        fireEvent.click(saveBtn)

        expect(mockCreate).toHaveBeenLastCalledWith({
          postAppReq: {
            isActive: true,
            redirectUris: [],
            name: 'new name',
            type: 's2s',
            scopes: ['root'],
          },
        })
      },
    )

    it(
      'create spa role',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const typeSelect = screen.queryByTestId('typeSelect') as HTMLSelectElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'new name' } },
        )
        fireEvent.click(typeSelect)

        const spaOption = screen.queryByTestId('typeSelect-spaOption') as HTMLSelectElement
        fireEvent.click(spaOption)

        const scopeInputs = screen.queryAllByTestId('scopeInput')
        expect(scopeInputs.length).toBe(2)

        const redirectUriInputs = screen.queryAllByTestId('redirectUriInput')
        expect(redirectUriInputs.length).toBe(1)

        fireEvent.change(
          redirectUriInputs[0],
          { target: { value: 'http://localhost' } },
        )

        fireEvent.click(scopeInputs[0])

        fireEvent.click(scopeInputs[1])

        fireEvent.click(saveBtn)

        expect(mockCreate).toHaveBeenLastCalledWith({
          postAppReq: {
            isActive: true,
            name: 'new name',
            type: 'spa',
            scopes: ['openid', 'test spa'],
            redirectUris: ['http://localhost'],
          },
        })
      },
    )

    it(
      'toggles scopes correctly when clicking scope inputs',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        fireEvent.change(
          nameInput,
          { target: { value: 'new name' } },
        )

        const typeSelect = screen.queryByTestId('typeSelect') as HTMLSelectElement
        fireEvent.click(typeSelect)

        const s2sOption = screen.queryByTestId('typeSelect-s2sOption') as HTMLSelectElement
        fireEvent.click(s2sOption)

        await waitFor(() => {
          const scopeInputs = screen.queryAllByTestId('scopeInput')
          expect(scopeInputs.length).toBeGreaterThan(0)
        })

        const scopeInputs = screen.queryAllByTestId('scopeInput')
        fireEvent.click(scopeInputs[0]) // Click first scope
        fireEvent.click(scopeInputs[1]) // Click second scope

        await waitFor(() => {
          expect(screen.queryByTestId('saveButton')).toBeInTheDocument()
        })

        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        fireEvent.click(saveBtn)

        await waitFor(() => {
          expect(mockCreate).toHaveBeenLastCalledWith({ postAppReq: expect.objectContaining({ scopes: ['root', 'test s2s'] }) })
        })

        fireEvent.click(scopeInputs[0]) // Click first scope again to remove it

        await waitFor(() => {
          expect(screen.queryByTestId('saveButton')).toBeInTheDocument()
        })

        fireEvent.click(saveBtn)

        await waitFor(() => {
          expect(mockCreate).toHaveBeenLastCalledWith({ postAppReq: expect.objectContaining({ scopes: ['test s2s'] }) })
        })
      },
    )

    it(
      'clears scopes when changing app type',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        fireEvent.change(
          nameInput,
          { target: { value: 'new name' } },
        )

        const typeSelect = screen.queryByTestId('typeSelect') as HTMLSelectElement
        fireEvent.click(typeSelect)

        const s2sOption = screen.queryByTestId('typeSelect-s2sOption') as HTMLSelectElement
        fireEvent.click(s2sOption)

        await waitFor(() => {
          const scopeInputs = screen.queryAllByTestId('scopeInput')
          expect(scopeInputs.length).toBeGreaterThan(0)
        })

        const s2sScopeInputs = screen.queryAllByTestId('scopeInput')
        fireEvent.click(s2sScopeInputs[0])

        fireEvent.click(typeSelect)

        const spaOption = screen.queryByTestId('typeSelect-spaOption') as HTMLSelectElement
        fireEvent.click(spaOption)

        await waitFor(() => {
          const scopeInputs = screen.queryAllByTestId('scopeInput')
          expect(scopeInputs[0].id).toBe('scope-1')
          expect(scopeInputs[1].id).toBe('scope-3')
        })

        const spaScopeInputs = screen.queryAllByTestId('scopeInput')
        fireEvent.click(spaScopeInputs[0])

        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        fireEvent.click(saveBtn)

        await waitFor(() => {
          expect(mockCreate).toHaveBeenLastCalledWith({
            postAppReq: expect.objectContaining({
              type: 'spa',
              scopes: ['openid'],
            }),
          })
        })
      },
    )

    it(
      'shows validation errors and prevents submission when form has errors',
      async () => {
        render(<Page />)

        // Get initial number of API calls
        const initialCallCount = mockCreate.mock.calls.length

        // Get the save button without filling any required fields
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        // Try to submit the form
        fireEvent.click(saveBtn)

        // Verify error messages are shown
        await waitFor(() => {
          const errorMessages = screen.queryAllByTestId('fieldError')
          expect(errorMessages.length).toBeGreaterThan(0)
        })

        // Verify no new API calls were made
        expect(mockCreate.mock.calls.length).toBe(initialCallCount)
      },
    )

    it(
      'handles undefined scopes data from API',
      async () => {
      // Mock API to return undefined data
        (useGetApiV1ScopesQuery as Mock).mockReturnValue({ data: undefined })

        render(<Page />)

        const scopeInputs = screen.queryAllByTestId('scopeInput')
        expect(scopeInputs.length).toBe(0)
      },
    )

    it(
      'shows error when submitting without required scopes',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const typeSelect = screen.queryByTestId('typeSelect') as HTMLSelectElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        // Fill in required fields
        fireEvent.change(
          nameInput,
          { target: { value: 'test app' } },
        )
        fireEvent.click(typeSelect)

        const s2sOption = screen.queryByTestId('typeSelect-s2sOption') as HTMLSelectElement
        fireEvent.click(s2sOption)

        // Initial state should have no error messages
        expect(screen.queryAllByTestId('fieldError')).toHaveLength(0)

        mockCreate.mockClear()

        // Submit without selecting any scopes
        fireEvent.click(saveBtn)

        // Verify error messages are shown
        await waitFor(() => {
          const errorMessages = screen.queryAllByTestId('fieldError')
          expect(errorMessages.length).toBeGreaterThan(0)
        })

        // Verify no API call was made
        expect(mockCreate).not.toHaveBeenCalled()
      },
    )

    it(
      'handles adding and removing redirect URIs correctly',
      async () => {
        render(<Page />)

        // Set up SPA app type to show redirect URI editor
        const typeSelect = screen.queryByTestId('typeSelect') as HTMLSelectElement
        fireEvent.click(typeSelect)

        const spaOption = screen.queryByTestId('typeSelect-spaOption') as HTMLSelectElement
        fireEvent.click(spaOption)

        // Initially should have one empty redirect URI input
        let redirectUriInputs = screen.queryAllByTestId('redirectUriInput')
        expect(redirectUriInputs.length).toBe(1)

        // Add another redirect URI
        const addButton = screen.queryByTestId('redirectUriAddButton') as HTMLButtonElement
        fireEvent.click(addButton)

        // Should now have two redirect URI inputs
        redirectUriInputs = screen.queryAllByTestId('redirectUriInput')
        expect(redirectUriInputs.length).toBe(2)

        // Fill in both URIs
        fireEvent.change(
          redirectUriInputs[0],
          { target: { value: 'http://localhost:3000' } },
        )
        fireEvent.change(
          redirectUriInputs[1],
          { target: { value: 'http://example.com' } },
        )

        // Fill required fields
        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        fireEvent.change(
          nameInput,
          { target: { value: 'test app' } },
        )

        const scopeInputs = screen.queryAllByTestId('scopeInput')
        fireEvent.click(scopeInputs[0])

        // Submit the form
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        fireEvent.click(saveBtn)

        // Verify API call includes both URIs
        await waitFor(() => {
          expect(mockCreate).toHaveBeenLastCalledWith({ postAppReq: expect.objectContaining({ redirectUris: ['http://localhost:3000', 'http://example.com'] }) })
        })
      },
    )

    it(
      'handles removing redirect URIs correctly',
      async () => {
        render(<Page />)

        // Set up SPA app type to show redirect URI editor
        const typeSelect = screen.queryByTestId('typeSelect') as HTMLSelectElement
        fireEvent.click(typeSelect)

        const spaOption = screen.queryByTestId('typeSelect-spaOption') as HTMLSelectElement
        fireEvent.click(spaOption)

        // Add another redirect URI
        const addButton = screen.queryByTestId('redirectUriAddButton') as HTMLButtonElement
        fireEvent.click(addButton)

        // Should now have two redirect URI inputs
        let redirectUriInputs = screen.queryAllByTestId('redirectUriInput')
        expect(redirectUriInputs.length).toBe(2)

        // Fill in both URIs
        fireEvent.change(
          redirectUriInputs[0],
          { target: { value: 'http://localhost:3000' } },
        )
        fireEvent.change(
          redirectUriInputs[1],
          { target: { value: 'http://example.com' } },
        )

        // Fill required fields
        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        fireEvent.change(
          nameInput,
          { target: { value: 'test app' } },
        )

        const scopeInputs = screen.queryAllByTestId('scopeInput')
        fireEvent.click(scopeInputs[0])

        // Remove first URI using the trash button
        const removeButtons = screen.queryAllByTestId('redirectUriRemoveButton')
        fireEvent.click(removeButtons[0])

        // Should now have one URI input
        redirectUriInputs = screen.queryAllByTestId('redirectUriInput')
        expect(redirectUriInputs.length).toBe(1)
        expect(redirectUriInputs[0].getAttribute('value')).toBe('http://example.com')

        // Submit the form
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        fireEvent.click(saveBtn)

        // Verify API call includes only the remaining URI
        await waitFor(() => {
          expect(mockCreate).toHaveBeenLastCalledWith({ postAppReq: expect.objectContaining({ redirectUris: ['http://example.com'] }) })
        })
      },
    )
  },
)
