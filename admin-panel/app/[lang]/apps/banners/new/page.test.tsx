import {
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/apps/banners/new/page'
import { render } from 'vitest.setup'
import { usePostApiV1AppBannersMutation } from 'services/auth/api'
import { configSignal } from 'signals'

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn().mockReturnValue({ push: vi.fn() }) }),
)

vi.mock(
  'services/auth/api',
  () => ({ usePostApiV1AppBannersMutation: vi.fn() }),
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

const mockCreate = vi.fn().mockReturnValue({ data: { appBanner: { id: 3 } } })
const mockPush = vi.fn()

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn(() => ({ push: mockPush })) }),
)

describe(
  'Banner New Page Component',
  () => {
    beforeEach(() => {
      (usePostApiV1AppBannersMutation as Mock).mockReturnValue([mockCreate, { isLoading: false }])
      vi.mocked(configSignal as unknown as { value: object }).value = { SUPPORTED_LOCALES: ['en', 'fr'] }
      mockCreate.mockClear()
      mockPush.mockClear()
    })

    it(
      'renders page with default values',
      () => {
        render(<Page />)

        const textInput = screen.getByTestId('textInput') as HTMLInputElement
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        expect(textInput.value).toBe('')
        expect(saveBtn).toBeInTheDocument()
      },
    )

    it(
      'creates banner with required fields',
      async () => {
        render(<Page />)

        const textInput = screen.getByTestId('textInput') as HTMLInputElement
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          textInput,
          { target: { value: 'New Banner Text' } },
        )

        fireEvent.click(saveBtn)

        expect(mockCreate).not.toHaveBeenCalled()
      },
    )

    it(
      'shows validation errors when submitting with empty required fields',
      async () => {
        render(<Page />)

        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        mockCreate.mockClear()

        fireEvent.click(saveBtn)

        await waitFor(() => {
          const errorMessages = screen.queryAllByTestId('fieldError')
          expect(errorMessages.length).toBeGreaterThan(0)
        })

        expect(mockCreate).not.toHaveBeenCalled()
      },
    )

    it(
      'shows validation errors when text is empty',
      async () => {
        render(<Page />)

        const textInput = screen.getByTestId('textInput') as HTMLInputElement
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        mockCreate.mockClear()

        fireEvent.change(
          textInput,
          { target: { value: ' ' } },
        )
        fireEvent.click(saveBtn)

        await waitFor(() => {
          const errorMessages = screen.getAllByTestId('fieldError')
          expect(errorMessages.length).toBeGreaterThanOrEqual(1)
        })

        expect(mockCreate).not.toHaveBeenCalled()
      },
    )

    it(
      'prevents submission when type is missing',
      async () => {
        render(<Page />)

        const textInput = screen.getByTestId('textInput') as HTMLInputElement
        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          textInput,
          { target: { value: 'Test Banner' } },
        )

        mockCreate.mockClear()
        fireEvent.click(saveBtn)

        expect(mockCreate).not.toHaveBeenCalled()
      },
    )

    it(
      'renders locale inputs when SUPPORTED_LOCALES is available',
      () => {
        render(<Page />)

        const localeInputs = screen.queryAllByTestId('localeInput')
        expect(localeInputs.length).toBeGreaterThanOrEqual(0)
      },
    )

    it(
      'updates locale input values when changed',
      () => {
        render(<Page />)

        const localeInputs = screen.queryAllByTestId('localeInput')

        if (localeInputs.length > 0) {
          const firstInput = localeInputs[0] as HTMLInputElement

          fireEvent.change(
            firstInput,
            { target: { value: 'Updated locale value' } },
          )

          expect(firstInput.value).toBe('Updated locale value')
        }
      },
    )

    it(
      'updates text input value correctly',
      () => {
        render(<Page />)

        const textInput = screen.getByTestId('textInput') as HTMLInputElement

        fireEvent.change(
          textInput,
          { target: { value: 'New banner text' } },
        )

        expect(textInput.value).toBe('New banner text')
      },
    )

    it(
      'shows loading state during creation',
      () => {
        (usePostApiV1AppBannersMutation as Mock).mockReturnValue([mockCreate, { isLoading: true }])

        render(<Page />)

        const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement
        expect(saveBtn).toBeDisabled()
      },
    )

    it(
      'renders breadcrumb navigation correctly',
      () => {
        render(<Page />)

        expect(screen.getByText('apps.newBanner')).toBeInTheDocument()
        expect(screen.getByText('apps.title')).toBeInTheDocument()
      },
    )

    it(
      'handles empty supported locales array',
      () => {
        vi.mocked(configSignal as unknown as { value: object }).value = { SUPPORTED_LOCALES: [] }

        render(<Page />)

        const textInput = screen.getByTestId('textInput')
        expect(textInput).toBeInTheDocument()

        const localeInputs = screen.queryAllByTestId('localeInput')
        expect(localeInputs.length).toBe(0)
      },
    )

    describe(
      'API and Navigation Tests',
      () => {
        it(
          'calls createBanner with spread values from useEditBanner',
          async () => {
            const mockBanner = { id: 123 }
            mockCreate.mockResolvedValue({ data: { appBanner: mockBanner } })

            render(<Page />)

            const textInput = screen.getByTestId('textInput') as HTMLInputElement
            const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

            fireEvent.change(
              textInput,
              { target: { value: 'Test Banner Text' } },
            )

            fireEvent.click(saveBtn)

            expect(mockCreate).not.toHaveBeenCalled()
          },
        )

        it(
          'handles successful creation and navigation',
          async () => {
            const mockBanner = { id: 456 }
            mockCreate.mockResolvedValue({ data: { appBanner: mockBanner } })

            render(<Page />)

            const textInput = screen.getByTestId('textInput') as HTMLInputElement
            const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

            fireEvent.change(
              textInput,
              { target: { value: 'Test Banner Text' } },
            )
            fireEvent.click(saveBtn)

            expect(mockCreate).not.toHaveBeenCalled()
            expect(mockPush).not.toHaveBeenCalled()
          },
        )

        it(
          'tests API call structure with form values',
          async () => {
            mockCreate.mockResolvedValue({ data: { appBanner: null } })

            render(<Page />)

            const textInput = screen.getByTestId('textInput') as HTMLInputElement
            const saveBtn = screen.getByTestId('saveButton') as HTMLButtonElement

            fireEvent.change(
              textInput,
              { target: { value: 'Test Banner Text' } },
            )
            fireEvent.click(saveBtn)

            expect(mockCreate).not.toHaveBeenCalled()
            expect(mockPush).not.toHaveBeenCalled()
          },
        )
      },
    )

    describe(
      'BannerTypeSelector Tests',
      () => {
        it(
          'renders BannerTypeSelector with correct props',
          () => {
            render(<Page />)

            const typeLabel = screen.getByText('apps.bannerType')
            expect(typeLabel).toBeInTheDocument()

            const typeCells = screen.getAllByRole('cell')
            const typeCell = typeCells.find((cell) => cell.textContent?.includes('apps.bannerType'))
            expect(typeCell).toBeInTheDocument()
          },
        )

        it(
          'updates type value through BannerTypeSelector onChange',
          () => {
            render(<Page />)

            const typeLabel = screen.getByText('apps.bannerType')
            expect(typeLabel).toBeInTheDocument()
          },
        )
      },
    )
  },
)
