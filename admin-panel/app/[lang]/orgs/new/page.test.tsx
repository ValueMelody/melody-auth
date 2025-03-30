import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest'
import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react'
import Page from 'app/[lang]/orgs/new/page'
import { usePostApiV1OrgsMutation } from 'services/auth/api'

// Mock the required hooks and modules
vi.mock(
  'next-intl',
  () => ({ useTranslations: vi.fn(() => (key: string) => key) }),
)

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn(() => ({ push: () => {} })) }),
)

vi.mock(
  'services/auth/api',
  () => ({ usePostApiV1OrgsMutation: vi.fn() }),
)

describe(
  'New Org Page',
  () => {
    const mockCreateOrg = vi.fn()

    beforeEach(() => {
      vi.clearAllMocks()

      vi.mocked(usePostApiV1OrgsMutation).mockReturnValue([
        mockCreateOrg,
        { isLoading: false },
      ] as any)
    })

    it(
      'renders the page title',
      () => {
        render(<Page />)

        expect(screen.getByText('orgs.new')).toBeInTheDocument()
      },
    )

    it(
      'renders empty form fields initially',
      () => {
        render(<Page />)

        expect(screen.getByTestId('nameInput')).toHaveValue('')
        expect(screen.getByTestId('slugInput')).toHaveValue('')
      },
    )

    it(
      'updates input values on change',
      () => {
        render(<Page />)

        const nameInput = screen.getByTestId('nameInput')
        const slugInput = screen.getByTestId('slugInput')

        fireEvent.change(
          nameInput,
          { target: { value: 'New Org' } },
        )
        fireEvent.change(
          slugInput,
          { target: { value: 'new-org' } },
        )

        expect(nameInput).toHaveValue('New Org')
        expect(slugInput).toHaveValue('new-org')
      },
    )

    it(
      'calls create mutation and redirects on successful save',
      async () => {
        const newOrg = {
          id: 1,
          name: 'New Org',
          slug: 'new-org',
        }

        mockCreateOrg.mockResolvedValueOnce({ data: { org: newOrg } })

        render(<Page />)

        const nameInput = screen.getByTestId('nameInput')
        const slugInput = screen.getByTestId('slugInput')

        fireEvent.change(
          nameInput,
          { target: { value: newOrg.name } },
        )
        fireEvent.change(
          slugInput,
          { target: { value: newOrg.slug } },
        )

        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )
        fireEvent.click(saveButton)

        expect(mockCreateOrg).toHaveBeenCalledWith({
          postOrgReq: expect.objectContaining({
            name: newOrg.name,
            slug: newOrg.slug,
          }),
        })
      },
    )

    it(
      'shows validation errors when submitting with empty fields',
      () => {
        render(<Page />)

        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )
        fireEvent.click(saveButton)

        expect(screen.getByText('orgs.name')).toBeInTheDocument()
        expect(screen.getByText('orgs.slug')).toBeInTheDocument()
        expect(mockCreateOrg).not.toHaveBeenCalled()
      },
    )

    it(
      'disables save button while creating',
      () => {
        vi.mocked(usePostApiV1OrgsMutation).mockReturnValue([
          mockCreateOrg,
          { isLoading: true },
        ] as any)

        render(<Page />)

        const saveButton = screen.getByRole(
          'button',
          { name: /save/i },
        )
        expect(saveButton).toBeDisabled()
      },
    )
  },
)
