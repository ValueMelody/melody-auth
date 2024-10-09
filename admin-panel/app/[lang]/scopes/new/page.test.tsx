import {
  fireEvent,
  screen,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/scopes/new/page'
import { render } from 'vitest.setup'
import { usePostApiV1ScopesMutation } from 'services/auth/api'
import { configSignal } from 'signals'

vi.mock(
  'next/navigation',
  () => ({ useRouter: vi.fn().mockReturnValue({ push: () => {} }) }),
)

vi.mock(
  'services/auth/api',
  () => ({ usePostApiV1ScopesMutation: vi.fn() }),
)

vi.mock('signals', () => ({
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
}))

const mockCreate = vi.fn().mockReturnValue({ data: { scope: { id: 3 } } })

describe(
  'Page Component',
  () => {
    beforeEach(() => {
      (usePostApiV1ScopesMutation as Mock).mockReturnValue([mockCreate, { isLoading: false }]);
    })

    it(
      'renders page',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const typeSelect = screen.queryByTestId('typeSelect') as HTMLSelectElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const localeInputs = screen.queryAllByTestId('localeInput')
        expect(nameInput?.value).toBe('')
        expect(noteInput?.value).toBe('')
        expect(typeSelect?.value).toBe('')
        expect(saveBtn).toBeInTheDocument()
        expect(localeInputs.length).toBe(0)
      },
    )

    it(
      'create s2s role',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const typeSelect = screen.queryByTestId('typeSelect') as HTMLSelectElement
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
          typeSelect,
          { target: { value: 's2s' } },
        )

        expect(screen.queryAllByTestId('localeInput').length).toBe(0)

        fireEvent.click(saveBtn)

        expect(mockCreate).toHaveBeenLastCalledWith({
          postScopeReq: {
            name: 'new name',
            note: 'new note',
            type: 's2s',
          },
        })
      },
    )

    it(
      'create spa role',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const typeSelect = screen.queryByTestId('typeSelect') as HTMLSelectElement
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
          typeSelect,
          { target: { value: 'spa' } },
        )

        const localeInputs = screen.queryAllByTestId('localeInput')
        expect(localeInputs.length).toBe(2)

        fireEvent.change(
          localeInputs[0],
          { target: { value: 'test en' } },
        )

        fireEvent.change(
          localeInputs[1],
          { target: { value: 'test fr' } },
        )

        fireEvent.click(saveBtn)

        expect(mockCreate).toHaveBeenLastCalledWith({
          postScopeReq: {
            name: 'new name',
            note: 'new note',
            type: 'spa',
            locales: [
              { locale: 'en', value: 'test en'},
              { locale: 'fr', value: 'test fr'}
            ]
          },
        })
      },
    )

    it(
      'create when app consent not enabled',
      async () => {
        vi.mocked(configSignal as unknown as { value: object }).value = {
          ENABLE_USER_APP_CONSENT: false,
          SUPPORTED_LOCALES: ['en', 'fr'],
        }

        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const noteInput = screen.queryByTestId('noteInput') as HTMLInputElement
        const typeSelect = screen.queryByTestId('typeSelect') as HTMLSelectElement
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
          typeSelect,
          { target: { value: 'spa' } },
        )

        const localeInputs = screen.queryAllByTestId('localeInput')
        expect(localeInputs.length).toBe(0)

        fireEvent.click(saveBtn)

        expect(mockCreate).toHaveBeenLastCalledWith({
          postScopeReq: {
            name: 'new name',
            note: 'new note',
            type: 'spa',
          },
        })
      },
    )
  },
)
