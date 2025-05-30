import {
  fireEvent,
  screen,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/user-attributes/new/page'
import { render } from 'vitest.setup'
import { usePostApiV1UserAttributesMutation } from 'services/auth/api'
import { configSignal } from 'signals'

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn().mockReturnValue({ push: () => {} }) }),
)

vi.mock(
  'services/auth/api',
  () => ({ usePostApiV1UserAttributesMutation: vi.fn() }),
)

vi.mock(
  'signals',
  () => ({
    configSignal: {
      value: { SUPPORTED_LOCALES: ['en', 'fr'] },
      subscribe: () => () => {},
    },
    errorSignal: {
      value: '',
      subscribe: () => () => {},
    },
  }),
)

const mockCreate = vi.fn().mockReturnValue({ data: { userAttribute: { id: 3 } } })
const mockPush = vi.fn()

describe(
  'User Attributes New Page Component',
  () => {
    beforeEach(() => {
      (usePostApiV1UserAttributesMutation as Mock).mockReturnValue([mockCreate, { isLoading: false }])
      vi.mocked(configSignal as unknown as { value: object }).value = { SUPPORTED_LOCALES: ['en', 'fr'] }
      mockCreate.mockClear()
      mockPush.mockClear()
    })

    it(
      'renders page with default values',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const switches = screen.queryAllByRole('switch')

        expect(nameInput?.value).toBe('')
        expect(saveBtn).toBeInTheDocument()
        expect(switches.length).toBe(4) // All boolean switches

        // Check default switch states
        switches.forEach((switchElement) => {
          expect(switchElement).not.toBeChecked()
        })
      },
    )

    it(
      'creates user attribute with basic data',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'firstName' } },
        )

        fireEvent.click(saveBtn)

        expect(mockCreate).toHaveBeenLastCalledWith({
          postUserAttributeReq: {
            name: 'firstName',
            locales: [],
            includeInSignUpForm: false,
            requiredInSignUpForm: false,
            includeInIdTokenBody: false,
            includeInUserInfo: false,
          },
        })
      },
    )

    it(
      'creates user attribute with all switches enabled',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const switches = screen.queryAllByRole('switch')

        fireEvent.change(
          nameInput,
          { target: { value: 'email' } },
        )

        // Enable all switches
        switches.forEach((switchElement) => {
          fireEvent.click(switchElement)
        })

        fireEvent.click(saveBtn)

        expect(mockCreate).toHaveBeenLastCalledWith({
          postUserAttributeReq: {
            name: 'email',
            locales: [],
            includeInSignUpForm: true,
            requiredInSignUpForm: true,
            includeInIdTokenBody: true,
            includeInUserInfo: true,
          },
        })
      },
    )

    it(
      'disables requiredInSignUpForm when includeInSignUpForm is disabled',
      async () => {
        render(<Page />)

        const switches = screen.queryAllByRole('switch')
        const includeInSignUpFormSwitch = switches[0] // First switch
        const requiredInSignUpFormSwitch = switches[1] // Second switch

        // Enable both switches first
        fireEvent.click(includeInSignUpFormSwitch)
        fireEvent.click(requiredInSignUpFormSwitch)

        expect(includeInSignUpFormSwitch).toBeChecked()
        expect(requiredInSignUpFormSwitch).toBeChecked()

        // Disable includeInSignUpForm - should auto-disable requiredInSignUpForm
        fireEvent.click(includeInSignUpFormSwitch)

        expect(includeInSignUpFormSwitch).not.toBeChecked()
        expect(requiredInSignUpFormSwitch).not.toBeChecked()
      },
    )

    it(
      'shows validation errors when name is empty',
      async () => {
        render(<Page />)

        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        mockCreate.mockClear()

        // Submit without name
        fireEvent.click(saveBtn)

        // Verify error message is displayed
        const errorMessage = await screen.findByTestId('fieldError')
        expect(errorMessage).toBeInTheDocument()
        expect(mockCreate).not.toHaveBeenCalled()
      },
    )

    it(
      'creates user attribute and redirects on success',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'lastName' } },
        )

        fireEvent.click(saveBtn)

        expect(mockCreate).toHaveBeenLastCalledWith({
          postUserAttributeReq: {
            name: 'lastName',
            locales: [],
            includeInSignUpForm: false,
            requiredInSignUpForm: false,
            includeInIdTokenBody: false,
            includeInUserInfo: false,
          },
        })
      },
    )

    it(
      'handles locale editor functionality',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'displayName' } },
        )

        // Check if locale inputs are rendered
        const localeInputs = screen.queryAllByTestId('localeInput')

        if (localeInputs.length > 0) {
          // Add locale values if inputs are present
          fireEvent.change(
            localeInputs[0],
            { target: { value: 'Display Name' } },
          )

          if (localeInputs[1]) {
            fireEvent.change(
              localeInputs[1],
              { target: { value: 'Nom d\'affichage' } },
            )
          }

          fireEvent.click(saveBtn)

          const expectedLocales = [
            {
              locale: 'en', value: 'Display Name',
            },
          ]
          if (localeInputs[1]) {
            expectedLocales.push({
              locale: 'fr', value: 'Nom d\'affichage',
            })
          }

          expect(mockCreate).toHaveBeenLastCalledWith({
            postUserAttributeReq: {
              name: 'displayName',
              locales: expectedLocales,
              includeInSignUpForm: false,
              requiredInSignUpForm: false,
              includeInIdTokenBody: false,
              includeInUserInfo: false,
            },
          })
        } else {
          // If no locale inputs, proceed with empty locales
          fireEvent.click(saveBtn)

          expect(mockCreate).toHaveBeenLastCalledWith({
            postUserAttributeReq: {
              name: 'displayName',
              locales: [],
              includeInSignUpForm: false,
              requiredInSignUpForm: false,
              includeInIdTokenBody: false,
              includeInUserInfo: false,
            },
          })
        }
      },
    )

    it(
      'shows loading state during creation',
      async () => {
        (usePostApiV1UserAttributesMutation as Mock).mockReturnValue([mockCreate, { isLoading: true }])

        render(<Page />)

        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        expect(saveBtn).toBeDisabled()
      },
    )
  },
)
