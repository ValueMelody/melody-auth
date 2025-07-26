import {
  fireEvent, screen,
  waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/saml/[id]/page'
import { render } from 'vitest.setup'
import {
  useGetApiV1SamlIdpsByIdQuery,
  usePutApiV1SamlIdpsByIdMutation,
  useDeleteApiV1SamlIdpsByIdMutation,
} from 'services/auth/api'

const mockSamlIdp = {
  id: '1',
  isActive: true,
  name: 'Test SAML IdP',
  userIdAttribute: 'uid',
  emailAttribute: 'email',
  firstNameAttribute: 'firstName',
  lastNameAttribute: 'lastName',
  metadata: '<EntityDescriptor>test metadata</EntityDescriptor>',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-02T00:00:00Z',
}

vi.mock(
  'next/navigation',
  () => ({ useParams: vi.fn().mockReturnValue({ id: '1' }) }),
)

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn(() => ({ push: () => {} })) }),
)

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1SamlIdpsByIdQuery: vi.fn(),
    usePutApiV1SamlIdpsByIdMutation: vi.fn(),
    useDeleteApiV1SamlIdpsByIdMutation: vi.fn(),
  }),
)

const mockUpdate = vi.fn()
const mockDelete = vi.fn()

describe(
  'SAML ID Page Component',
  () => {
    beforeEach(() => {
      (useGetApiV1SamlIdpsByIdQuery as Mock).mockReturnValue({ data: { idp: mockSamlIdp } });
      (usePutApiV1SamlIdpsByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteApiV1SamlIdpsByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }])
    })

    it(
      'render SAML IdP',
      async () => {
        render(<Page />)

        const userIdAttributeInput = screen.queryByTestId('userIdAttributeInput') as HTMLInputElement
        const emailAttributeInput = screen.queryByTestId('emailAttributeInput') as HTMLInputElement
        const firstNameAttributeInput = screen.queryByTestId('firstNameAttributeInput') as HTMLInputElement
        const lastNameAttributeInput = screen.queryByTestId('lastNameAttributeInput') as HTMLInputElement
        const metadataInput = screen.queryByTestId('metadataInput') as HTMLTextAreaElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const deleteBtn = screen.queryByTestId('deleteButton')

        expect(userIdAttributeInput?.value).toBe(mockSamlIdp.userIdAttribute)
        expect(emailAttributeInput?.value).toBe(mockSamlIdp.emailAttribute)
        expect(firstNameAttributeInput?.value).toBe(mockSamlIdp.firstNameAttribute)
        expect(lastNameAttributeInput?.value).toBe(mockSamlIdp.lastNameAttribute)
        expect(metadataInput?.value).toBe(mockSamlIdp.metadata)
        expect(saveBtn?.disabled).toBeTruthy()
        expect(deleteBtn).toBeInTheDocument()
      },
    )

    it(
      'update SAML IdP',
      async () => {
        render(<Page />)

        const userIdAttributeInput = screen.queryByTestId('userIdAttributeInput') as HTMLInputElement
        const emailAttributeInput = screen.queryByTestId('emailAttributeInput') as HTMLInputElement
        const metadataInput = screen.queryByTestId('metadataInput') as HTMLTextAreaElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          userIdAttributeInput,
          { target: { value: 'new_uid' } },
        )
        fireEvent.change(
          emailAttributeInput,
          { target: { value: 'new_email' } },
        )
        fireEvent.change(
          metadataInput,
          { target: { value: '<EntityDescriptor>new metadata</EntityDescriptor>' } },
        )

        expect(userIdAttributeInput?.value).toBe('new_uid')
        expect(emailAttributeInput?.value).toBe('new_email')
        expect(metadataInput?.value).toBe('<EntityDescriptor>new metadata</EntityDescriptor>')
        expect(saveBtn?.disabled).toBeFalsy()
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenLastCalledWith({
          id: 1,
          putSamlIdpReq: {
            isActive: true,
            userIdAttribute: 'new_uid',
            emailAttribute: 'new_email',
            firstNameAttribute: 'firstName',
            lastNameAttribute: 'lastName',
            metadata: '<EntityDescriptor>new metadata</EntityDescriptor>',
          },
        })
      },
    )

    it(
      'delete SAML IdP',
      async () => {
        render(<Page />)

        const deleteBtn = screen.queryByTestId('deleteButton') as HTMLButtonElement
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

        fireEvent.click(deleteBtn)
        expect(screen.queryByRole('alertdialog')).toBeInTheDocument()

        fireEvent.click(screen.queryByTestId('confirmButton') as HTMLButtonElement)

        expect(mockDelete).toHaveBeenLastCalledWith({ id: 1 })
      },
    )

    it(
      'shows validation errors when saving with empty required fields',
      async () => {
        render(<Page />)

        const userIdAttributeInput = screen.queryByTestId('userIdAttributeInput') as HTMLInputElement
        const firstNameAttributeInput = screen.queryByTestId('firstNameAttributeInput') as HTMLInputElement
        const lastNameAttributeInput = screen.queryByTestId('lastNameAttributeInput') as HTMLInputElement
        const metadataInput = screen.queryByTestId('metadataInput') as HTMLTextAreaElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        // Store initial number of calls
        const initialCalls = mockUpdate.mock.calls.length

        // Clear required fields to trigger validation errors
        fireEvent.change(
          userIdAttributeInput,
          { target: { value: ' ' } },
        )
        fireEvent.change(
          metadataInput,
          { target: { value: ' ' } },
        )

        fireEvent.change(
          firstNameAttributeInput,
          { target: { value: ' ' } },
        )
        fireEvent.change(
          lastNameAttributeInput,
          { target: { value: ' ' } },
        )

        // Try to save
        fireEvent.click(saveBtn)

        // Verify error messages are displayed
        await waitFor(() => {
          const errorMessages = screen.queryAllByTestId('fieldError')
          expect(errorMessages.length).toBeGreaterThan(0)
        })

        // Verify the update function was not called by comparing with initial calls
        expect(mockUpdate.mock.calls.length).toBe(initialCalls)
      },
    )

    it(
      'save button is disabled when no changes are made',
      () => {
        render(<Page />)

        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        expect(saveBtn?.disabled).toBeTruthy()
      },
    )

    it(
      'save button is disabled when required fields are empty',
      () => {
        const idpWithEmptyFields = {
          ...mockSamlIdp,
          userIdAttribute: '',
          metadata: '',
        }

        ;(useGetApiV1SamlIdpsByIdQuery as Mock).mockReturnValue({ data: { idp: idpWithEmptyFields } })

        render(<Page />)

        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        expect(saveBtn?.disabled).toBeTruthy()
      },
    )

    it(
      'returns null when IdP data is not available',
      () => {
        // Mock the API to return no IdP data
        (useGetApiV1SamlIdpsByIdQuery as Mock).mockReturnValue({ data: { idp: null } })

        render(<Page />)

        // Verify that none of the IdP-related elements are rendered
        expect(screen.queryByTestId('userIdAttributeInput')).not.toBeInTheDocument()
        expect(screen.queryByTestId('emailAttributeInput')).not.toBeInTheDocument()
        expect(screen.queryByTestId('metadataInput')).not.toBeInTheDocument()
        expect(screen.queryByTestId('saveButton')).not.toBeInTheDocument()
        expect(screen.queryByTestId('deleteButton')).not.toBeInTheDocument()
      },
    )

    it(
      'renders loading state when IdP data is loading',
      () => {
        (useGetApiV1SamlIdpsByIdQuery as Mock).mockReturnValue({
          data: undefined,
          isLoading: true,
          error: null,
        })
        render(<Page />)
        expect(screen.getByTestId('spinner')).toBeInTheDocument()
      },
    )
  },
)
