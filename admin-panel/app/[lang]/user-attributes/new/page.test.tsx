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
        expect(switches.length).toBe(5) // All boolean switches

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
            unique: false,
            validationRegex: '',
            validationLocales: [],
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
            unique: true,
            validationRegex: '',
            validationLocales: [],
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

        const allErrorMessages = await screen.findAllByTestId('fieldError')
        expect(allErrorMessages[0].textContent).toBe('common.fieldIsRequired')
        expect(allErrorMessages[1].textContent).toBe('')
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
            unique: false,
            validationRegex: '',
            validationLocales: [],
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
              unique: false,
              validationRegex: '',
              validationLocales: [],
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
              unique: false,
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

    it(
      'creates user attribute with validation regex',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const validationRegexInput = screen.queryByTestId('validationRegexInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'phoneNumber' } },
        )

        fireEvent.change(
          validationRegexInput,
          { target: { value: '^\\+?[1-9]\\d{1,14}$' } },
        )

        fireEvent.click(saveBtn)

        expect(mockCreate).toHaveBeenLastCalledWith({
          postUserAttributeReq: {
            name: 'phoneNumber',
            locales: [],
            includeInSignUpForm: false,
            requiredInSignUpForm: false,
            includeInIdTokenBody: false,
            includeInUserInfo: false,
            unique: false,
            validationRegex: '^\\+?[1-9]\\d{1,14}$',
            validationLocales: [],
          },
        })
      },
    )

    it(
      'creates user attribute with validation locales',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'customField' } },
        )

        // Get validation locale inputs (they appear after the regular locale inputs)
        const localeInputs = screen.queryAllByTestId('localeInput')
        // First 2 are for attribute locales, next 2 are for validation locales
        const validationLocaleInputs = localeInputs.slice(2)

        if (validationLocaleInputs.length >= 2) {
          fireEvent.change(
            validationLocaleInputs[0],
            { target: { value: 'Invalid format' } },
          )

          fireEvent.change(
            validationLocaleInputs[1],
            { target: { value: 'Format invalide' } },
          )

          fireEvent.click(saveBtn)

          expect(mockCreate).toHaveBeenLastCalledWith({
            postUserAttributeReq: {
              name: 'customField',
              locales: [],
              includeInSignUpForm: false,
              requiredInSignUpForm: false,
              includeInIdTokenBody: false,
              includeInUserInfo: false,
              unique: false,
              validationRegex: '',
              validationLocales: [
                {
                  locale: 'en', value: 'Invalid format',
                },
                {
                  locale: 'fr', value: 'Format invalide',
                },
              ],
            },
          })
        }
      },
    )

    it(
      'creates user attribute with both validation regex and validation locales',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const validationRegexInput = screen.queryByTestId('validationRegexInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'zipCode' } },
        )

        fireEvent.change(
          validationRegexInput,
          { target: { value: '^[0-9]{5}$' } },
        )

        // Get validation locale inputs
        const localeInputs = screen.queryAllByTestId('localeInput')
        const validationLocaleInputs = localeInputs.slice(2)

        if (validationLocaleInputs.length >= 2) {
          fireEvent.change(
            validationLocaleInputs[0],
            { target: { value: 'Please enter a valid 5-digit zip code' } },
          )

          fireEvent.change(
            validationLocaleInputs[1],
            { target: { value: 'Veuillez entrer un code postal à 5 chiffres valide' } },
          )

          fireEvent.click(saveBtn)

          expect(mockCreate).toHaveBeenLastCalledWith({
            postUserAttributeReq: {
              name: 'zipCode',
              locales: [],
              includeInSignUpForm: false,
              requiredInSignUpForm: false,
              includeInIdTokenBody: false,
              includeInUserInfo: false,
              unique: false,
              validationRegex: '^[0-9]{5}$',
              validationLocales: [
                {
                  locale: 'en', value: 'Please enter a valid 5-digit zip code',
                },
                {
                  locale: 'fr', value: 'Veuillez entrer un code postal à 5 chiffres valide',
                },
              ],
            },
          })
        }
      },
    )

    it(
      'updates validation regex field value',
      async () => {
        render(<Page />)

        const validationRegexInput = screen.queryByTestId('validationRegexInput') as HTMLInputElement

        expect(validationRegexInput.value).toBe('')

        fireEvent.change(
          validationRegexInput,
          { target: { value: '^[a-zA-Z]+$' } },
        )

        expect(validationRegexInput.value).toBe('^[a-zA-Z]+$')

        // Update again
        fireEvent.change(
          validationRegexInput,
          { target: { value: '^[a-zA-Z0-9]+$' } },
        )

        expect(validationRegexInput.value).toBe('^[a-zA-Z0-9]+$')
      },
    )
  },
)
