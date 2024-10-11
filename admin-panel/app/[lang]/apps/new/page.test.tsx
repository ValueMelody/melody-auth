import {
  fireEvent,
  screen,
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
  'next/navigation',
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
        const typeSelect = screen.queryByTestId('typeSelect') as HTMLSelectElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        expect(nameInput?.value).toBe('')
        expect(typeSelect?.value).toBe('')
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
        fireEvent.change(
          typeSelect,
          { target: { value: 's2s' } },
        )

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
        fireEvent.change(
          typeSelect,
          { target: { value: 'spa' } },
        )

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
  },
)
