import {
  fireEvent, screen,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/saml/new/page'
import { render } from 'vitest.setup'
import { usePostApiV1SamlIdpsMutation } from 'services/auth/api'

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn().mockReturnValue({ push: () => {} }) }),
)

vi.mock(
  'services/auth/api',
  () => ({ usePostApiV1SamlIdpsMutation: vi.fn() }),
)

const mockCreate = vi.fn().mockReturnValue({ data: { idp: { id: '1' } } })

describe(
  'SAML New Page Component',
  () => {
    beforeEach(() => {
      (usePostApiV1SamlIdpsMutation as Mock).mockReturnValue([mockCreate, { isLoading: false }])
    })

    it(
      'render page',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const userIdAttributeInput = screen.queryByTestId('userIdAttributeInput') as HTMLInputElement
        const emailAttributeInput = screen.queryByTestId('emailAttributeInput') as HTMLInputElement
        const firstNameAttributeInput = screen.queryByTestId('firstNameAttributeInput') as HTMLInputElement
        const lastNameAttributeInput = screen.queryByTestId('lastNameAttributeInput') as HTMLInputElement
        const metadataInput = screen.queryByTestId('metadataInput') as HTMLTextAreaElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        expect(nameInput?.value).toBe('')
        expect(userIdAttributeInput?.value).toBe('')
        expect(emailAttributeInput?.value).toBe('')
        expect(firstNameAttributeInput?.value).toBe('')
        expect(lastNameAttributeInput?.value).toBe('')
        expect(metadataInput?.value).toBe('')
        expect(saveBtn).toBeInTheDocument()
      },
    )

    it(
      'create SAML IdP',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const userIdAttributeInput = screen.queryByTestId('userIdAttributeInput') as HTMLInputElement
        const emailAttributeInput = screen.queryByTestId('emailAttributeInput') as HTMLInputElement
        const firstNameAttributeInput = screen.queryByTestId('firstNameAttributeInput') as HTMLInputElement
        const lastNameAttributeInput = screen.queryByTestId('lastNameAttributeInput') as HTMLInputElement
        const metadataInput = screen.queryByTestId('metadataInput') as HTMLTextAreaElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'Test SAML IdP' } },
        )
        fireEvent.change(
          userIdAttributeInput,
          { target: { value: 'uid' } },
        )
        fireEvent.change(
          emailAttributeInput,
          { target: { value: 'email' } },
        )
        fireEvent.change(
          firstNameAttributeInput,
          { target: { value: 'firstName' } },
        )
        fireEvent.change(
          lastNameAttributeInput,
          { target: { value: 'lastName' } },
        )
        fireEvent.change(
          metadataInput,
          { target: { value: '<EntityDescriptor>...</EntityDescriptor>' } },
        )

        fireEvent.click(saveBtn)

        expect(mockCreate).toHaveBeenLastCalledWith({
          postSamlIdpReq: {
            isActive: true,
            name: 'Test SAML IdP',
            userIdAttribute: 'uid',
            emailAttribute: 'email',
            firstNameAttribute: 'firstName',
            lastNameAttribute: 'lastName',
            metadata: '<EntityDescriptor>...</EntityDescriptor>',
          },
        })
      },
    )

    it(
      'should show errors when name is empty',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        // Reset mock before test
        mockCreate.mockClear()

        // Leave name empty
        fireEvent.change(
          nameInput,
          { target: { value: '' } },
        )
        fireEvent.click(saveBtn)

        // Verify error is displayed for required name field
        const errorMessage = await screen.findAllByText('common.fieldIsRequired')
        expect(errorMessage.length).toBe(3)

        // Verify create was not called
        expect(mockCreate).not.toHaveBeenCalled()
      },
    )

    it(
      'should show errors and not create IdP when validation fails',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const userIdAttributeInput = screen.queryByTestId('userIdAttributeInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        // Reset mock before test
        mockCreate.mockClear()

        // Set invalid data to trigger validation errors
        fireEvent.change(
          nameInput,
          { target: { value: 'Test SAML IdP' } },
        )
        fireEvent.change(
          userIdAttributeInput,
          { target: { value: ' ' } },
        )
        fireEvent.click(saveBtn)

        // Verify error is displayed
        const errorMessage = await screen.findAllByTestId('fieldError')
        expect(errorMessage.length).toBe(2)

        // Verify create was not called
        expect(mockCreate).not.toHaveBeenCalled()
      },
    )
  },
)
