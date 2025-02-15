import {
  describe, it, expect, vi, beforeEach,
} from 'vitest'
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react'
import Page from 'app/[lang]/orgs/[id]/page'
import {
  useGetApiV1OrgsByIdQuery, usePutApiV1OrgsByIdMutation, useDeleteApiV1OrgsByIdMutation,
} from 'services/auth/api'

// Mock the required hooks and modules
vi.mock(
  'next-intl',
  () => ({ useTranslations: vi.fn(() => (key: string) => key) }),
)

vi.mock(
  'next/navigation',
  () => ({ useParams: vi.fn(() => ({ id: '1' })) }),
)

vi.mock(
  'hooks/useLocaleRoute',
  () => ({ default: vi.fn(() => ({ push: vi.fn() })) }),
)

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1OrgsByIdQuery: vi.fn(),
    usePutApiV1OrgsByIdMutation: vi.fn(),
    useDeleteApiV1OrgsByIdMutation: vi.fn(),
  }),
)

describe(
  'Org Edit Page',
  () => {
    const mockOrg = {
      id: 1,
      name: 'Test Org',
      slug: 'test-org',
      companyLogoUrl: 'https://example.com/logo.png',
      fontFamily: 'Arial',
      fontUrl: 'https://fonts.com/arial',
      layoutColor: '#ffffff',
      labelColor: '#000000',
      primaryButtonColor: '#0000ff',
      primaryButtonLabelColor: '#ffffff',
      primaryButtonBorderColor: '#0000ff',
      secondaryButtonColor: '#ffffff',
      secondaryButtonLabelColor: '#0000ff',
      secondaryButtonBorderColor: '#0000ff',
      criticalIndicatorColor: '#ff0000',
      termsLink: 'https://example.com/terms',
      privacyPolicyLink: 'https://example.com/privacy',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
    }

    const mockUpdateOrg = vi.fn()
    const mockDeleteOrg = vi.fn()

    beforeEach(() => {
      vi.mocked(useGetApiV1OrgsByIdQuery).mockReturnValue({
        data: { org: mockOrg },
        isLoading: false,
        error: null,
      } as any)

      vi.mocked(usePutApiV1OrgsByIdMutation).mockReturnValue([
        mockUpdateOrg,
        { isLoading: false },
      ] as any)

      vi.mocked(useDeleteApiV1OrgsByIdMutation).mockReturnValue([
        mockDeleteOrg,
        { isLoading: false },
      ] as any)
    })

    it(
      'renders the page title',
      () => {
        render(<Page />)
        expect(screen.getByText('orgs.org')).toBeInTheDocument()
      },
    )

    it(
      'renders form with org data',
      () => {
        render(<Page />)

        expect(screen.getByTestId('nameInput')).toHaveValue(mockOrg.name)
        expect(screen.getByTestId('slugInput')).toHaveValue(mockOrg.slug)
        expect(screen.getByTestId('companyLogoUrlInput')).toHaveValue(mockOrg.companyLogoUrl)
        expect(screen.getByTestId('layoutColorInput')).toHaveValue(mockOrg.layoutColor)
      },
    )

    it(
      'updates input values on change',
      () => {
        render(<Page />)

        const nameInput = screen.getByTestId('nameInput')
        fireEvent.change(
          nameInput,
          { target: { value: 'New Name' } },
        )
        expect(nameInput).toHaveValue('New Name')
      },
    )

    it(
      'calls update mutation when saving',
      async () => {
        render(<Page />)

        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )
        fireEvent.click(saveButton)

        expect(mockUpdateOrg).toHaveBeenCalledWith({
          id: 1,
          putOrgReq: expect.objectContaining({
            name: mockOrg.name,
            slug: mockOrg.slug,
          }),
        })
      },
    )

    it(
      'shows validation errors when saving with empty name',
      () => {
        render(<Page />)

        const nameInput = screen.getByTestId('nameInput')
        fireEvent.change(
          nameInput,
          { target: { value: '' } },
        )

        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )
        expect(saveButton).toBeDisabled()
      },
    )

    it(
      'calls delete mutation when confirming deletion',
      () => {
        render(<Page />)

        const deleteButton = screen.getByRole(
          'button',
          { name: /delete/i },
        )
        fireEvent.click(deleteButton)

        const confirmButton = screen.getByRole(
          'button',
          { name: /confirm/i },
        )
        fireEvent.click(confirmButton)

        expect(mockDeleteOrg).toHaveBeenCalledWith({ id: 1 })
      },
    )

    it(
      'renders timestamps',
      () => {
        render(<Page />)

        expect(screen.getByText(`${mockOrg.createdAt} UTC`)).toBeInTheDocument()
        expect(screen.getByText(`${mockOrg.updatedAt} UTC`)).toBeInTheDocument()
      },
    )

    it(
      'handles loading state',
      () => {
        vi.mocked(useGetApiV1OrgsByIdQuery).mockReturnValue({
          data: null,
          isLoading: true,
          error: null,
        } as any)

        render(<Page />)
        expect(screen.queryByTestId('nameInput')).not.toBeInTheDocument()
      },
    )

    it(
      'prevents saving and shows errors when validation fails',
      async () => {
        render(<Page />)

        // Set invalid values to trigger validation errors
        const nameInput = screen.getByTestId('nameInput')
        const slugInput = screen.getByTestId('slugInput')

        // Clear required fields to trigger validation errors
        fireEvent.change(
          nameInput,
          { target: { value: ' ' } },
        )
        fireEvent.change(
          slugInput,
          { target: { value: ' ' } },
        )

        // Clear mock before save attempt
        vi.clearAllMocks()

        // Try to save
        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )
        fireEvent.click(saveButton)

        // Verify errors are shown
        await waitFor(() => {
          const errorMessages = screen.queryAllByTestId('fieldError')
          expect(errorMessages.length).toBeGreaterThan(0)
        })

        // Verify the update mutation was not called
        expect(mockUpdateOrg).not.toHaveBeenCalled()
      },
    )

    it(
      'updates company logo and slug correctly',
      async () => {
        render(<Page />)

        // Test company logo URL input
        const companyLogoInput = screen.getByTestId('companyLogoUrlInput')
        fireEvent.change(
          companyLogoInput,
          { target: { value: 'https://example.com/new-logo.png' } },
        )
        expect(companyLogoInput).toHaveValue('https://example.com/new-logo.png')

        // Test slug input
        const slugInput = screen.getByTestId('slugInput')
        fireEvent.change(
          slugInput,
          { target: { value: 'new-org-slug' } },
        )
        expect(slugInput).toHaveValue('new-org-slug')

        // Clear mock before save attempt
        vi.clearAllMocks()

        // Save and verify changes
        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )
        fireEvent.click(saveButton)

        expect(mockUpdateOrg).toHaveBeenCalledWith({
          id: 1,
          putOrgReq: expect.objectContaining({
            companyLogoUrl: 'https://example.com/new-logo.png',
            slug: 'new-org-slug',
          }),
        })
      },
    )

    it(
      'updates font settings correctly',
      async () => {
        render(<Page />)

        // Test font family input
        const fontFamilyInput = screen.getByTestId('fontFamilyInput')
        fireEvent.change(
          fontFamilyInput,
          { target: { value: 'Roboto' } },
        )
        expect(fontFamilyInput).toHaveValue('Roboto')

        // Test font URL input
        const fontUrlInput = screen.getByTestId('fontUrlInput')
        fireEvent.change(
          fontUrlInput,
          { target: { value: 'https://fonts.googleapis.com/css2?family=Roboto' } },
        )
        expect(fontUrlInput).toHaveValue('https://fonts.googleapis.com/css2?family=Roboto')

        // Clear mock before save attempt
        vi.clearAllMocks()

        // Save and verify font changes
        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )
        fireEvent.click(saveButton)

        expect(mockUpdateOrg).toHaveBeenCalledWith({
          id: 1,
          putOrgReq: expect.objectContaining({
            fontFamily: 'Roboto',
            fontUrl: 'https://fonts.googleapis.com/css2?family=Roboto',
          }),
        })
      },
    )

    it(
      'updates color inputs correctly',
      async () => {
        render(<Page />)

        // Test layout and label colors
        const layoutColorInput = screen.getByTestId('layoutColorInput')
        const labelColorInput = screen.getByTestId('labelColorInput')

        fireEvent.change(
          layoutColorInput,
          { target: { value: '#123456' } },
        )
        fireEvent.change(
          labelColorInput,
          { target: { value: '#654321' } },
        )

        expect(layoutColorInput).toHaveValue('#123456')
        expect(labelColorInput).toHaveValue('#654321')

        // Test primary button colors
        const primaryButtonColorInput = screen.getByTestId('primaryButtonColorInput')
        const primaryButtonLabelColorInput = screen.getByTestId('primaryButtonLabelColorInput')
        const primaryButtonBorderColorInput = screen.getByTestId('primaryButtonBorderColorInput')

        fireEvent.change(
          primaryButtonColorInput,
          { target: { value: '#111111' } },
        )
        fireEvent.change(
          primaryButtonLabelColorInput,
          { target: { value: '#222222' } },
        )
        fireEvent.change(
          primaryButtonBorderColorInput,
          { target: { value: '#333333' } },
        )

        expect(primaryButtonColorInput).toHaveValue('#111111')
        expect(primaryButtonLabelColorInput).toHaveValue('#222222')
        expect(primaryButtonBorderColorInput).toHaveValue('#333333')

        // Test secondary button colors
        const secondaryButtonColorInput = screen.getByTestId('secondaryButtonColorInput')
        const secondaryButtonLabelColorInput = screen.getByTestId('secondaryButtonLabelColorInput')
        const secondaryButtonBorderColorInput = screen.getByTestId('secondaryButtonBorderColorInput')
        const criticalIndicatorColorInput = screen.getByTestId('criticalIndicatorColorInput')

        fireEvent.change(
          secondaryButtonColorInput,
          { target: { value: '#444444' } },
        )
        fireEvent.change(
          secondaryButtonLabelColorInput,
          { target: { value: '#555555' } },
        )
        fireEvent.change(
          secondaryButtonBorderColorInput,
          { target: { value: '#666666' } },
        )
        fireEvent.change(
          criticalIndicatorColorInput,
          { target: { value: '#ff0001' } },
        )

        expect(secondaryButtonColorInput).toHaveValue('#444444')
        expect(secondaryButtonLabelColorInput).toHaveValue('#555555')
        expect(secondaryButtonBorderColorInput).toHaveValue('#666666')
        expect(criticalIndicatorColorInput).toHaveValue('#ff0001')

        // Clear mock before save attempt
        vi.clearAllMocks()

        // Save and verify all color changes
        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )
        fireEvent.click(saveButton)

        expect(mockUpdateOrg).toHaveBeenCalledWith({
          id: 1,
          putOrgReq: expect.objectContaining({
            layoutColor: '#123456',
            labelColor: '#654321',
            primaryButtonColor: '#111111',
            primaryButtonLabelColor: '#222222',
            primaryButtonBorderColor: '#333333',
            secondaryButtonColor: '#444444',
            secondaryButtonLabelColor: '#555555',
            secondaryButtonBorderColor: '#666666',
            criticalIndicatorColor: '#FF0001',
          }),
        })
      },
    )

    it(
      'updates terms and privacy policy links',
      async () => {
        render(<Page />)

        // Test terms link update
        const termsInput = screen.getByTestId('termsLinkInput')
        fireEvent.change(
          termsInput,
          { target: { value: 'https://newterms.com' } },
        )
        expect(termsInput).toHaveValue('https://newterms.com')

        // Test privacy policy link update
        const privacyInput = screen.getByTestId('privacyPolicyLinkInput')
        fireEvent.change(
          privacyInput,
          { target: { value: 'https://newprivacy.com' } },
        )
        expect(privacyInput).toHaveValue('https://newprivacy.com')

        // Clear mock before save attempt
        vi.clearAllMocks()

        // Save the changes
        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )
        fireEvent.click(saveButton)

        expect(mockUpdateOrg).toHaveBeenCalledWith({
          id: 1,
          putOrgReq: expect.objectContaining({
            termsLink: 'https://newterms.com',
            privacyPolicyLink: 'https://newprivacy.com',
          }),
        })
      },
    )
  },
)
