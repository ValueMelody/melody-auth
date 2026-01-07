import {
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/user-attributes/[id]/page'
import { render } from 'vitest.setup'
import {
  useGetApiV1UserAttributesByIdQuery,
  usePutApiV1UserAttributesByIdMutation,
  useDeleteApiV1UserAttributesByIdMutation,
} from 'services/auth/api'
import { configSignal } from 'signals'

const mockUserAttribute = {
  id: 1,
  name: 'firstName',
  includeInSignUpForm: true,
  requiredInSignUpForm: false,
  includeInIdTokenBody: true,
  includeInUserInfo: false,
  unique: false,
  locales: [
    {
      locale: 'en', value: 'First Name',
    },
    {
      locale: 'fr', value: 'Prénom',
    },
  ],
  validationRegex: '',
  validationLocales: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
}

vi.mock(
  'next/navigation',
  () => ({ useParams: () => ({ id: '1' }) }),
)

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn().mockReturnValue({ push: vi.fn() }) }),
)

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1UserAttributesByIdQuery: vi.fn(),
    usePutApiV1UserAttributesByIdMutation: vi.fn(),
    useDeleteApiV1UserAttributesByIdMutation: vi.fn(),
  }),
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

const mockUseAuth = vi.fn().mockReturnValue({
  userInfo: {
    authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
    roles: ['super_admin'],
  },
})

vi.mock(
  '@melody-auth/react',
  () => ({ useAuth: () => mockUseAuth() }),
)

const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockPush = vi.fn()

describe(
  'User Attributes Edit Page Component',
  () => {
    beforeEach(() => {
      (useGetApiV1UserAttributesByIdQuery as Mock).mockReturnValue({
        data: { userAttribute: mockUserAttribute },
        isLoading: false,
      })
      ;(usePutApiV1UserAttributesByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }])
      ;(useDeleteApiV1UserAttributesByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }])

      vi.mocked(configSignal as unknown as { value: object }).value = { SUPPORTED_LOCALES: ['en', 'fr'] }

      mockUseAuth.mockReturnValue({
        userInfo: {
          authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
          roles: ['super_admin'],
        },
      })

      mockUpdate.mockClear()
      mockDelete.mockClear()
      mockPush.mockClear()
    })

    it(
      'renders loading state',
      () => {
        (useGetApiV1UserAttributesByIdQuery as Mock).mockReturnValue({
          data: undefined,
          isLoading: true,
        })

        render(<Page />)
        expect(screen.getByTestId('spinner')).toBeInTheDocument()
      },
    )

    it(
      'renders user attribute data',
      () => {
        render(<Page />)

        const nameInput = screen.getByTestId('nameInput') as HTMLInputElement
        const switches = screen.getAllByRole('switch')

        expect(nameInput.value).toBe('firstName')
        expect(switches[0]).toBeChecked() // includeInSignUpForm
        expect(switches[1]).not.toBeChecked() // requiredInSignUpForm
        expect(switches[2]).toBeChecked() // includeInIdTokenBody
        expect(switches[3]).not.toBeChecked() // includeInUserInfo

        expect(screen.getByText('2024-01-01T00:00:00Z UTC')).toBeInTheDocument()
        expect(screen.getByText('2024-01-02T00:00:00Z UTC')).toBeInTheDocument()
      },
    )

    it(
      'updates user attribute name',
      async () => {
        render(<Page />)

        const nameInput = screen.getByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'lastName' } },
        )
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenCalledWith({
          id: 1,
          putUserAttributeReq: {
            name: 'lastName',
            includeInSignUpForm: true,
            requiredInSignUpForm: false,
            includeInIdTokenBody: true,
            includeInUserInfo: false,
            unique: false,
            validationRegex: '',
            validationLocales: [],
            locales: [
              {
                locale: 'en', value: 'First Name',
              },
              {
                locale: 'fr', value: 'Prénom',
              },
            ],
          },
        })
      },
    )

    it(
      'updates includeInIdTokenBody switch',
      async () => {
        render(<Page />)

        const switches = screen.getAllByRole('switch')
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        // Toggle includeInIdTokenBody switch
        fireEvent.click(switches[2])
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenCalledWith({
          id: 1,
          putUserAttributeReq: {
            name: 'firstName',
            includeInSignUpForm: true,
            requiredInSignUpForm: false,
            includeInIdTokenBody: false,
            includeInUserInfo: false,
            unique: false,
            validationRegex: '',
            validationLocales: [],
            locales: [
              {
                locale: 'en', value: 'First Name',
              },
              {
                locale: 'fr', value: 'Prénom',
              },
            ],
          },
        })
      },
    )

    it(
      'updates includeInUserInfo switch',
      async () => {
        render(<Page />)

        const switches = screen.getAllByRole('switch')
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        // Toggle includeInUserInfo switch
        fireEvent.click(switches[3])
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenCalledWith({
          id: 1,
          putUserAttributeReq: {
            name: 'firstName',
            includeInSignUpForm: true,
            requiredInSignUpForm: false,
            includeInIdTokenBody: true,
            includeInUserInfo: true,
            unique: false,
            validationRegex: '',
            validationLocales: [],
            locales: [
              {
                locale: 'en', value: 'First Name',
              },
              {
                locale: 'fr', value: 'Prénom',
              },
            ],
          },
        })
      },
    )

    it(
      'handles includeInSignUpForm dependency',
      () => {
        render(<Page />)

        const switches = screen.getAllByRole('switch')
        const includeInSignUpFormSwitch = switches[0]
        const requiredInSignUpFormSwitch = switches[1]

        // Enable requiredInSignUpForm first
        fireEvent.click(requiredInSignUpFormSwitch)
        expect(requiredInSignUpFormSwitch).toBeChecked()

        // Disable includeInSignUpForm - should auto-disable requiredInSignUpForm
        fireEvent.click(includeInSignUpFormSwitch)

        expect(includeInSignUpFormSwitch).not.toBeChecked()
        expect(requiredInSignUpFormSwitch).not.toBeChecked()
      },
    )

    it(
      'disables requiredInSignUpForm when includeInSignUpForm is false',
      () => {
        const userAttributeWithoutSignUp = {
          ...mockUserAttribute,
          includeInSignUpForm: false,
          requiredInSignUpForm: false,
        }

        ;(useGetApiV1UserAttributesByIdQuery as Mock).mockReturnValue({
          data: { userAttribute: userAttributeWithoutSignUp },
          isLoading: false,
        })

        render(<Page />)

        const switches = screen.getAllByRole('switch')
        const requiredInSignUpFormSwitch = switches[1]

        expect(requiredInSignUpFormSwitch).toBeDisabled()
      },
    )

    it(
      'shows validation errors',
      async () => {
        render(<Page />)

        const nameInput = screen.getByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        // Clear the name to trigger validation error
        fireEvent.change(
          nameInput,
          { target: { value: ' ' } },
        )
        fireEvent.click(saveBtn)

        const allErrorMessages = await screen.findAllByTestId('fieldError')
        expect(allErrorMessages[0].textContent).toBe('common.fieldIsRequired')
        expect(allErrorMessages[1].textContent).toBe('')
        expect(mockUpdate).not.toHaveBeenCalled()
      },
    )

    it(
      'handles locale changes',
      async () => {
        render(<Page />)

        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement
        const localeInputs = screen.queryAllByTestId('localeInput')

        if (localeInputs.length > 0) {
          fireEvent.change(
            localeInputs[0],
            { target: { value: 'Updated First Name' } },
          )
          fireEvent.click(saveBtn)

          expect(mockUpdate).toHaveBeenCalledWith({
            id: 1,
            putUserAttributeReq: {
              name: 'firstName',
              includeInSignUpForm: true,
              requiredInSignUpForm: false,
              includeInIdTokenBody: true,
              includeInUserInfo: false,
              unique: false,
              validationRegex: '',
              validationLocales: [],
              locales: [
                {
                  locale: 'en', value: 'Updated First Name',
                },
                {
                  locale: 'fr', value: 'Prénom',
                },
              ],
            },
          })
        }
      },
    )

    it(
      'disables save button when no changes',
      () => {
        render(<Page />)

        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement
        expect(saveBtn).toBeDisabled()
      },
    )

    it(
      'enables save button when changes are made',
      () => {
        render(<Page />)

        const nameInput = screen.getByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'updatedName' } },
        )
        expect(saveBtn).not.toBeDisabled()
      },
    )

    it(
      'handles delete operation',
      async () => {
        render(<Page />)

        const deleteBtn = screen.getByTestId('deleteButton') as HTMLButtonElement
        fireEvent.click(deleteBtn)

        // Confirm delete
        const confirmBtn = screen.getByTestId('confirmButton') as HTMLButtonElement
        fireEvent.click(confirmBtn)

        await waitFor(() => {
          expect(mockDelete).toHaveBeenCalledWith({ id: 1 })
        })
      },
    )

    it(
      'shows loading states',
      () => {
        ;(usePutApiV1UserAttributesByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: true }])
        ;(useDeleteApiV1UserAttributesByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: true }])

        render(<Page />)

        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement
        const deleteBtn = screen.getByTestId('deleteButton') as HTMLButtonElement

        expect(saveBtn).toBeDisabled()
        expect(deleteBtn).toBeDisabled()
      },
    )

    it(
      'disables inputs when user lacks write permission',
      () => {
        mockUseAuth.mockReturnValue({
          userInfo: {
            authId: '123', roles: ['read_only'],
          },
        })

        render(<Page />)

        const nameInput = screen.getByTestId('nameInput') as HTMLInputElement
        const switches = screen.getAllByRole('switch')

        expect(nameInput).toBeDisabled()
        switches.forEach((switchElement) => {
          expect(switchElement).toBeDisabled()
        })

        expect(screen.queryByTestId('saveButton')).not.toBeInTheDocument()
        expect(screen.queryByTestId('deleteButton')).not.toBeInTheDocument()
      },
    )

    it(
      'returns null when user attribute not found',
      () => {
        ;(useGetApiV1UserAttributesByIdQuery as Mock).mockReturnValue({
          data: { userAttribute: null },
          isLoading: false,
        })

        const { container } = render(<Page />)
        expect(container.firstChild?.firstChild).toBeNull()
      },
    )

    it(
      'renders user attribute with existing validation regex',
      () => {
        const userAttributeWithValidation = {
          ...mockUserAttribute,
          validationRegex: '^[0-9]{5}$',
          validationLocales: [
            {
              locale: 'en', value: 'Please enter a valid zip code',
            },
            {
              locale: 'fr', value: 'Veuillez entrer un code postal valide',
            },
          ],
        }

        ;(useGetApiV1UserAttributesByIdQuery as Mock).mockReturnValue({
          data: { userAttribute: userAttributeWithValidation },
          isLoading: false,
        })

        render(<Page />)

        const validationRegexInput = screen.getByTestId('validationRegexInput') as HTMLInputElement
        expect(validationRegexInput.value).toBe('^[0-9]{5}$')
      },
    )

    it(
      'updates validation regex field',
      async () => {
        render(<Page />)

        const validationRegexInput = screen.getByTestId('validationRegexInput') as HTMLInputElement
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          validationRegexInput,
          { target: { value: '^[a-zA-Z]+$' } },
        )
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenCalledWith({
          id: 1,
          putUserAttributeReq: {
            name: 'firstName',
            includeInSignUpForm: true,
            requiredInSignUpForm: false,
            includeInIdTokenBody: true,
            includeInUserInfo: false,
            unique: false,
            validationRegex: '^[a-zA-Z]+$',
            validationLocales: [],
            locales: [
              {
                locale: 'en', value: 'First Name',
              },
              {
                locale: 'fr', value: 'Prénom',
              },
            ],
          },
        })
      },
    )

    it(
      'updates validation locales',
      async () => {
        render(<Page />)

        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement
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

          expect(mockUpdate).toHaveBeenCalledWith({
            id: 1,
            putUserAttributeReq: {
              name: 'firstName',
              includeInSignUpForm: true,
              requiredInSignUpForm: false,
              includeInIdTokenBody: true,
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
              locales: [
                {
                  locale: 'en', value: 'First Name',
                },
                {
                  locale: 'fr', value: 'Prénom',
                },
              ],
            },
          })
        }
      },
    )

    it(
      'updates both validation regex and validation locales',
      async () => {
        render(<Page />)

        const validationRegexInput = screen.getByTestId('validationRegexInput') as HTMLInputElement
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement
        const localeInputs = screen.queryAllByTestId('localeInput')

        fireEvent.change(
          validationRegexInput,
          { target: { value: '^\\d{3}-\\d{4}$' } },
        )

        const validationLocaleInputs = localeInputs.slice(2)

        if (validationLocaleInputs.length >= 2) {
          fireEvent.change(
            validationLocaleInputs[0],
            { target: { value: 'Please enter format: XXX-XXXX' } },
          )

          fireEvent.change(
            validationLocaleInputs[1],
            { target: { value: 'Veuillez entrer le format: XXX-XXXX' } },
          )

          fireEvent.click(saveBtn)

          expect(mockUpdate).toHaveBeenCalledWith({
            id: 1,
            putUserAttributeReq: {
              name: 'firstName',
              includeInSignUpForm: true,
              requiredInSignUpForm: false,
              includeInIdTokenBody: true,
              includeInUserInfo: false,
              unique: false,
              validationRegex: '^\\d{3}-\\d{4}$',
              validationLocales: [
                {
                  locale: 'en', value: 'Please enter format: XXX-XXXX',
                },
                {
                  locale: 'fr', value: 'Veuillez entrer le format: XXX-XXXX',
                },
              ],
              locales: [
                {
                  locale: 'en', value: 'First Name',
                },
                {
                  locale: 'fr', value: 'Prénom',
                },
              ],
            },
          })
        }
      },
    )

    it(
      'enables save button when validation regex changes',
      () => {
        render(<Page />)

        const validationRegexInput = screen.getByTestId('validationRegexInput') as HTMLInputElement
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        expect(saveBtn).toBeDisabled()

        fireEvent.change(
          validationRegexInput,
          { target: { value: '^[0-9]+$' } },
        )

        expect(saveBtn).not.toBeDisabled()
      },
    )

    it(
      'enables save button when validation locales change',
      () => {
        render(<Page />)

        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement
        const localeInputs = screen.queryAllByTestId('localeInput')

        expect(saveBtn).toBeDisabled()

        const validationLocaleInputs = localeInputs.slice(2)

        if (validationLocaleInputs.length >= 1) {
          fireEvent.change(
            validationLocaleInputs[0],
            { target: { value: 'Error message' } },
          )

          expect(saveBtn).not.toBeDisabled()
        }
      },
    )

    it(
      'clears existing validation regex',
      async () => {
        const userAttributeWithValidation = {
          ...mockUserAttribute,
          validationRegex: '^[0-9]{5}$',
        }

        ;(useGetApiV1UserAttributesByIdQuery as Mock).mockReturnValue({
          data: { userAttribute: userAttributeWithValidation },
          isLoading: false,
        })

        render(<Page />)

        const validationRegexInput = screen.getByTestId('validationRegexInput') as HTMLInputElement
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        expect(validationRegexInput.value).toBe('^[0-9]{5}$')

        fireEvent.change(
          validationRegexInput,
          { target: { value: '' } },
        )

        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenCalledWith({
          id: 1,
          putUserAttributeReq: {
            name: 'firstName',
            includeInSignUpForm: true,
            requiredInSignUpForm: false,
            includeInIdTokenBody: true,
            includeInUserInfo: false,
            unique: false,
            validationRegex: '',
            validationLocales: [],
            locales: [
              {
                locale: 'en', value: 'First Name',
              },
              {
                locale: 'fr', value: 'Prénom',
              },
            ],
          },
        })
      },
    )

    it(
      'disables validation regex input when user lacks write permission',
      () => {
        mockUseAuth.mockReturnValue({
          userInfo: {
            authId: '123', roles: ['read_only'],
          },
        })

        render(<Page />)

        const validationRegexInput = screen.getByTestId('validationRegexInput') as HTMLInputElement
        expect(validationRegexInput).toBeDisabled()
      },
    )
  },
)
