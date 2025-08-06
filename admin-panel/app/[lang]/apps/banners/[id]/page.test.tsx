import {
  fireEvent, screen, waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/apps/banners/[id]/page'
import { render } from 'vitest.setup'
import {
  useGetApiV1AppBannersByIdQuery,
  usePutApiV1AppBannersByIdMutation,
  useDeleteApiV1AppBannersByIdMutation,
  useGetApiV1AppsQuery,
} from 'services/auth/api'
import { apps } from 'tests/appMock'

const mockBanner = {
  id: 1,
  type: 'info',
  text: 'Test Banner',
  isActive: true,
  appIds: [1, 3],
  locales: [
    {
      locale: 'en', value: 'English Banner Text',
    },
    {
      locale: 'fr', value: 'Texte de bannière français',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
}

const mockNav = {
  id: '1',
  push: vi.fn(),
}

vi.mock(
  'next/navigation',
  () => ({ useParams: vi.fn(() => ({ id: mockNav.id })) }),
)

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn(() => ({ push: mockNav.push })) }),
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

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1AppBannersByIdQuery: vi.fn(),
    usePutApiV1AppBannersByIdMutation: vi.fn(),
    useDeleteApiV1AppBannersByIdMutation: vi.fn(),
    useGetApiV1AppsQuery: vi.fn(),
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

const mockUpdate = vi.fn()
const mockDelete = vi.fn()

describe(
  'Banner Edit Page',
  () => {
    beforeEach(() => {
      (useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
        data: { appBanner: mockBanner },
        isLoading: false,
      });
      (usePutApiV1AppBannersByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteApiV1AppBannersByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }]);
      (useGetApiV1AppsQuery as Mock).mockReturnValue({ data: { apps: apps.filter((app) => app.isActive && app.type === 'spa') } })

      mockUpdate.mockClear()
      mockDelete.mockClear()
      mockNav.push.mockClear()
    })

    it(
      'renders banner data',
      () => {
        render(<Page />)

        const textInput = screen.getByTestId('textInput') as HTMLInputElement
        const statusInput = screen.getByTestId('statusInput') as HTMLInputElement
        const appInputs = screen.getAllByTestId('appInput')

        expect(textInput.value).toBe(mockBanner.text)
        expect(statusInput.getAttribute('aria-checked')).toBe(mockBanner.isActive ? 'true' : 'false')
        expect(appInputs.length).toBe(2)

        const saveBtn = screen.queryByTestId('saveButton')
        const deleteBtn = screen.queryByTestId('deleteButton')

        expect(saveBtn).toBeInTheDocument()
        expect(deleteBtn).toBeInTheDocument()

        if (saveBtn) {
          expect(saveBtn).toBeDisabled()
        }
      },
    )

    it(
      'updates banner text',
      async () => {
        render(<Page />)

        const textInput = screen.getByTestId('textInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          textInput,
          { target: { value: 'Updated Banner Text' } },
        )

        expect(textInput.value).toBe('Updated Banner Text')
        expect(saveBtn).toBeInTheDocument()
        expect(saveBtn?.disabled).toBeFalsy()
        if (saveBtn) fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenCalledWith({
          id: 1,
          putAppBannerReq: { text: 'Updated Banner Text' },
        })
      },
    )

    it(
      'updates banner status',
      async () => {
        render(<Page />)

        const statusInput = screen.getByTestId('statusInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.click(statusInput)

        expect(statusInput.getAttribute('aria-checked')).toBe('false')
        expect(saveBtn).toBeInTheDocument()
        expect(saveBtn?.disabled).toBeFalsy()
        if (saveBtn) fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenCalledWith({
          id: 1,
          putAppBannerReq: { isActive: false },
        })
      },
    )

    it(
      'toggles app selection',
      async () => {
        render(<Page />)

        const appInputs = screen.getAllByTestId('appInput')
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        expect(appInputs[0].getAttribute('aria-checked')).toBe('true')

        fireEvent.click(appInputs[0])

        expect(saveBtn).toBeInTheDocument()
        expect(saveBtn?.disabled).toBeFalsy()
        if (saveBtn) fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenCalledWith({
          id: 1,
          putAppBannerReq: { appIds: [3] },
        })
      },
    )

    it(
      'adds new app to banner',
      async () => {
        const bannerWithOneApp = {
          ...mockBanner,
          appIds: [1],
        }

        ;(useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
          data: { appBanner: bannerWithOneApp },
          isLoading: false,
        })

        render(<Page />)

        const appInputs = screen.getAllByTestId('appInput')
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        expect(appInputs[1].getAttribute('aria-checked')).toBe('false')

        fireEvent.click(appInputs[1])

        expect(saveBtn).toBeInTheDocument()
        expect(saveBtn?.disabled).toBeFalsy()
        if (saveBtn) fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenCalledWith({
          id: 1,
          putAppBannerReq: { appIds: [1, 3] },
        })
      },
    )

    it(
      'updates multiple fields',
      async () => {
        render(<Page />)

        const textInput = screen.getByTestId('textInput') as HTMLInputElement
        const statusInput = screen.getByTestId('statusInput') as HTMLInputElement
        const appInputs = screen.getAllByTestId('appInput')
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          textInput,
          { target: { value: 'New Banner Text' } },
        )
        fireEvent.click(statusInput)
        fireEvent.click(appInputs[0])

        expect(textInput.value).toBe('New Banner Text')
        expect(statusInput.getAttribute('aria-checked')).toBe('false')
        expect(saveBtn).toBeInTheDocument()
        expect(saveBtn?.disabled).toBeFalsy()
        if (saveBtn) fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenCalledWith({
          id: 1,
          putAppBannerReq: {
            text: 'New Banner Text',
            isActive: false,
            appIds: [3],
          },
        })
      },
    )

    it(
      'deletes banner',
      async () => {
        mockDelete.mockResolvedValue(undefined)

        render(<Page />)

        const deleteBtn = screen.getByTestId('deleteButton') as HTMLButtonElement
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

        fireEvent.click(deleteBtn)
        expect(screen.queryByRole('alertdialog')).toBeInTheDocument()

        fireEvent.click(screen.getByTestId('confirmButton') as HTMLButtonElement)

        expect(mockDelete).toHaveBeenCalledWith({ id: 1 })

        await waitFor(() => {
          expect(mockNav.push).toHaveBeenCalledWith('/apps')
        })
      },
    )

    it(
      'shows validation errors when saving with empty text',
      async () => {
        render(<Page />)

        const textInput = screen.getByTestId('textInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          textInput,
          { target: { value: ' ' } },
        )

        expect(saveBtn).toBeInTheDocument()
        if (saveBtn) fireEvent.click(saveBtn)

        await waitFor(() => {
          const errorMessages = screen.queryAllByTestId('fieldError')
          expect(errorMessages.length).toBeGreaterThan(0)
        })

        expect(mockUpdate).not.toHaveBeenCalled()
      },
    )

    it(
      'renders loading state when banner is loading',
      () => {
        (useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
          data: undefined,
          isLoading: true,
        })
        render(<Page />)
        expect(screen.getByTestId('spinner')).toBeInTheDocument()
      },
    )

    it(
      'returns null when banner data is not available',
      () => {
        (useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
          data: { appBanner: null },
          isLoading: false,
        })

        const { container } = render(<Page />)

        expect(container.firstChild?.firstChild).toBeNull()

        expect(screen.queryByTestId('textInput')).not.toBeInTheDocument()
        expect(screen.queryByTestId('statusInput')).not.toBeInTheDocument()
        expect(screen.queryByTestId('saveButton')).not.toBeInTheDocument()
        expect(screen.queryByTestId('deleteButton')).not.toBeInTheDocument()
      },
    )

    it(
      'shows loading states for update and delete',
      () => {
        ;(usePutApiV1AppBannersByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: true }])
        ;(useDeleteApiV1AppBannersByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: true }])

        render(<Page />)

        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const deleteBtn = screen.getByTestId('deleteButton') as HTMLButtonElement

        expect(saveBtn).toBeDisabled()
        expect(deleteBtn).toBeDisabled()
      },
    )

    it(
      'disables inputs when user lacks write permission',
      () => {
        const originalMock = mockUseAuth.getMockImplementation()
        mockUseAuth.mockReturnValue({
          userInfo: {
            authId: '123',
            roles: ['read_only'],
          },
        })

        render(<Page />)

        const textInput = screen.getByTestId('textInput') as HTMLInputElement
        const statusInput = screen.getByTestId('statusInput') as HTMLInputElement
        const appInputs = screen.getAllByTestId('appInput')

        expect(textInput).toBeDisabled()
        expect(statusInput).toBeDisabled()
        appInputs.forEach((appInput) => {
          expect(appInput).toBeDisabled()
        })

        expect(screen.queryByTestId('saveButton')).not.toBeInTheDocument()
        expect(screen.queryByTestId('deleteButton')).not.toBeInTheDocument()

        if (originalMock) {
          mockUseAuth.mockImplementation(originalMock)
        } else {
          mockUseAuth.mockReturnValue({
            userInfo: {
              authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
              roles: ['super_admin'],
            },
          })
        }
      },
    )

    it(
      'handles undefined apps data gracefully',
      () => {
        ;(useGetApiV1AppsQuery as Mock).mockReturnValue({ data: undefined })

        render(<Page />)

        const appInputs = screen.queryAllByTestId('appInput')
        expect(appInputs).toHaveLength(0)
      },
    )

    it(
      'filters apps to only show active SPA apps',
      () => {
        const allApps = [
          ...apps,
          {
            id: 6, name: 'Active S2S App', type: 's2s', isActive: true,
          },
          {
            id: 7, name: 'Inactive SPA App', type: 'spa', isActive: false,
          },
        ]

        ;(useGetApiV1AppsQuery as Mock).mockReturnValue({ data: { apps: allApps } })

        render(<Page />)

        const appInputs = screen.getAllByTestId('appInput')
        expect(appInputs).toHaveLength(2)
      },
    )

    it(
      'renders timestamps',
      () => {
        render(<Page />)

        expect(screen.getByText(`${mockBanner.createdAt} UTC`)).toBeInTheDocument()
        expect(screen.getByText(`${mockBanner.updatedAt} UTC`)).toBeInTheDocument()
      },
    )

    it(
      'displays banner breadcrumb with correct navigation',
      () => {
        render(<Page />)

        expect(screen.getByText('Test Banner')).toBeInTheDocument()
        expect(screen.getByText('apps.title')).toBeInTheDocument()
      },
    )

    it(
      'updates locale values',
      async () => {
        render(<Page />)

        const localeInputs = screen.queryAllByTestId('localeInput') as HTMLInputElement[]
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        expect(localeInputs[0]?.value).toBe('English Banner Text')
        expect(localeInputs[1]?.value).toBe('Texte de bannière français')

        fireEvent.change(
          localeInputs[0],
          { target: { value: 'Updated English Banner' } },
        )
        fireEvent.change(
          localeInputs[1],
          { target: { value: 'Bannière française mise à jour' } },
        )

        expect(localeInputs[0]?.value).toBe('Updated English Banner')
        expect(localeInputs[1]?.value).toBe('Bannière française mise à jour')
        expect(saveBtn).toBeInTheDocument()
        expect(saveBtn?.disabled).toBeFalsy()
        if (saveBtn) fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenCalledWith({
          id: 1,
          putAppBannerReq: {
            locales: [
              {
                locale: 'en', value: 'Updated English Banner',
              },
              {
                locale: 'fr', value: 'Bannière française mise à jour',
              },
            ],
          },
        })
      },
    )

    describe(
      'locale comparison logic',
      () => {
        it(
          'detects when locales are added',
          async () => {
            const bannerWithoutLocales = {
              ...mockBanner,
              locales: undefined,
            }

            ;(useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
              data: { appBanner: bannerWithoutLocales },
              isLoading: false,
            })

            render(<Page />)

            const localeInputs = screen.queryAllByTestId('localeInput') as HTMLInputElement[]
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

            fireEvent.change(
              localeInputs[0],
              { target: { value: 'New English Banner' } },
            )

            expect(saveBtn.disabled).toBeFalsy()
          },
        )

        it(
          'detects when number of locales changes',
          async () => {
            const bannerWithOneLocale = {
              ...mockBanner,
              locales: [{
                locale: 'en', value: 'English only',
              }],
            }

            ;(useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
              data: { appBanner: bannerWithOneLocale },
              isLoading: false,
            })

            render(<Page />)

            const localeInputs = screen.queryAllByTestId('localeInput') as HTMLInputElement[]
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

            fireEvent.change(
              localeInputs[0],
              { target: { value: 'Updated English' } },
            )
            fireEvent.change(
              localeInputs[1],
              { target: { value: 'New French' } },
            )

            expect(saveBtn.disabled).toBeFalsy()
          },
        )

        it(
          'detects when locale values change',
          async () => {
            const bannerWithLocales = {
              ...mockBanner,
              locales: [
                {
                  locale: 'en', value: 'Original English',
                },
                {
                  locale: 'fr', value: 'Original French',
                },
              ],
            }

            ;(useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
              data: { appBanner: bannerWithLocales },
              isLoading: false,
            })

            render(<Page />)

            const localeInputs = screen.queryAllByTestId('localeInput') as HTMLInputElement[]
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

            fireEvent.change(
              localeInputs[0],
              { target: { value: 'Modified English' } },
            )

            expect(saveBtn.disabled).toBeFalsy()
          },
        )

        it(
          'detects when locale keys change',
          async () => {
            const bannerWithDifferentLocales = {
              ...mockBanner,
              locales: [
                {
                  locale: 'es', value: 'Spanish Banner',
                },
                {
                  locale: 'fr', value: 'French Banner',
                },
              ],
            }

            ;(useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
              data: { appBanner: bannerWithDifferentLocales },
              isLoading: false,
            })

            render(<Page />)

            const localeInputs = screen.queryAllByTestId('localeInput') as HTMLInputElement[]
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

            fireEvent.change(
              localeInputs[0],
              { target: { value: 'English Banner' } },
            )

            expect(saveBtn.disabled).toBeFalsy()
          },
        )

        it(
          'disables save button when no locale changes are made',
          async () => {
            const unchangedBanner = {
              ...mockBanner,
              locales: [
                {
                  locale: 'en', value: 'Unchanged English',
                },
                {
                  locale: 'fr', value: 'Unchanged French',
                },
              ],
            }

            ;(useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
              data: { appBanner: unchangedBanner },
              isLoading: false,
            })

            render(<Page />)

            const localeInputs = screen.queryAllByTestId('localeInput') as HTMLInputElement[]
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

            expect(localeInputs[0]?.value).toBe('Unchanged English')
            expect(localeInputs[1]?.value).toBe('Unchanged French')

            fireEvent.change(
              localeInputs[0],
              { target: { value: 'Modified English' } },
            )
            fireEvent.change(
              localeInputs[0],
              { target: { value: 'Unchanged English' } },
            )

            fireEvent.change(
              localeInputs[1],
              { target: { value: 'Modified French' } },
            )
            fireEvent.change(
              localeInputs[1],
              { target: { value: 'Unchanged French' } },
            )

            expect(saveBtn).toBeInTheDocument()
            expect(saveBtn?.disabled).toBeTruthy()
          },
        )

        it(
          'sends only changed fields when type is not different',
          async () => {
            render(<Page />)
            const textInput = screen.queryByTestId('textInput') as HTMLInputElement
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
            fireEvent.change(
              textInput,
              { target: { value: 'Only text changed' } },
            )
            expect(saveBtn).toBeInTheDocument()
            if (saveBtn) fireEvent.click(saveBtn)
            expect(mockUpdate).toHaveBeenCalledWith({
              id: 1,
              putAppBannerReq: { text: 'Only text changed' },
            })
          },
        )

        it(
          'handles undefined appIds when adding app',
          async () => {
            const bannerWithoutApps = {
              ...mockBanner, appIds: undefined,
            }
            ;(useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
              data: { appBanner: bannerWithoutApps }, isLoading: false,
            })
            render(<Page />)
            const appInputs = screen.getAllByTestId('appInput')
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
            expect(appInputs[0].getAttribute('aria-checked')).toBe('false')
            fireEvent.click(appInputs[0])
            expect(saveBtn).toBeInTheDocument()
            if (saveBtn) fireEvent.click(saveBtn)
            expect(mockUpdate).toHaveBeenCalledWith({
              id: 1, putAppBannerReq: { appIds: [1] },
            })
          },
        )

        it(
          'handles null appIds when checking checkbox state',
          async () => {
            const bannerWithNullApps = {
              ...mockBanner, appIds: null,
            }
            ;(useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
              data: { appBanner: bannerWithNullApps }, isLoading: false,
            })
            render(<Page />)
            const appInputs = screen.getAllByTestId('appInput')
            appInputs.forEach((appInput) => {
              expect(appInput.getAttribute('aria-checked')).toBe('false')
            })
          },
        )

        it(
          'handles empty appIds array when checking checkbox state',
          async () => {
            const bannerWithEmptyApps = {
              ...mockBanner, appIds: [],
            }
            ;(useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
              data: { appBanner: bannerWithEmptyApps }, isLoading: false,
            })
            render(<Page />)
            const appInputs = screen.getAllByTestId('appInput')
            appInputs.forEach((appInput) => {
              expect(appInput.getAttribute('aria-checked')).toBe('false')
            })
          },
        )

        it(
          'detects app differences when banner has different apps',
          async () => {
            const bannerWithDifferentApps = {
              ...mockBanner, appIds: [3],
            }
            ;(useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
              data: { appBanner: bannerWithDifferentApps }, isLoading: false,
            })
            render(<Page />)
            const appInputs = screen.getAllByTestId('appInput')
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
            expect(appInputs[0].getAttribute('aria-checked')).toBe('false')
            expect(appInputs[1].getAttribute('aria-checked')).toBe('true')
            fireEvent.click(appInputs[0])
            expect(saveBtn).toBeInTheDocument()
            expect(saveBtn?.disabled).toBeFalsy()
            if (saveBtn) fireEvent.click(saveBtn)
            expect(mockUpdate).toHaveBeenCalledWith({
              id: 1, putAppBannerReq: { appIds: [3, 1] },
            })
          },
        )

        it(
          'covers all hasDifferentApps branches with length and content differences',
          async () => {
            const bannerWithExtraApp = {
              ...mockBanner, appIds: [1, 3],
            }
            ;(useGetApiV1AppBannersByIdQuery as Mock).mockReturnValue({
              data: { appBanner: bannerWithExtraApp }, isLoading: false,
            })
            render(<Page />)
            const appInputs = screen.getAllByTestId('appInput')
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
            expect(appInputs[0].getAttribute('aria-checked')).toBe('true')
            expect(appInputs[1].getAttribute('aria-checked')).toBe('true')
            fireEvent.click(appInputs[1])
            expect(saveBtn).toBeInTheDocument()
            expect(saveBtn?.disabled).toBeFalsy()
            if (saveBtn) fireEvent.click(saveBtn)
            expect(mockUpdate).toHaveBeenCalledWith({
              id: 1, putAppBannerReq: { appIds: [1] },
            })
          },
        )

        it(
          'handles status changes (hasDifferentStatus)',
          async () => {
            render(<Page />)
            const statusInput = screen.queryByTestId('statusInput') as HTMLInputElement
            const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
            expect(statusInput.getAttribute('aria-checked')).toBe('true')
            expect(saveBtn?.disabled).toBeTruthy()
            fireEvent.click(statusInput)
            expect(statusInput.getAttribute('aria-checked')).toBe('false')
            expect(saveBtn?.disabled).toBeFalsy()
            if (saveBtn) fireEvent.click(saveBtn)
            expect(mockUpdate).toHaveBeenCalledWith({
              id: 1, putAppBannerReq: { isActive: false },
            })
          },
        )
      },
    )
  },
)
