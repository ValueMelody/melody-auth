import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../../../vitest.setup'
import Page from 'app/[lang]/apps/page'
import { apps } from 'tests/appMock'
import { banners } from 'tests/bannerMock'
import {
  useGetApiV1AppsQuery, useGetApiV1AppBannersQuery,
} from 'services/auth/api'
import { configSignal } from 'signals'

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1AppsQuery: vi.fn(),
    useGetApiV1AppBannersQuery: vi.fn(),
  }),
)

vi.mock(
  'i18n/navigation',
  () => ({
    useRouter: vi.fn(() => ({ push: vi.fn() })),
    Link: vi.fn(({
      href, 'data-testid': dataTestId,
    }: { href: string; 'data-testid': string }) => <a
      data-testid={dataTestId}
      href={href}>Link</a>),
  }),
)

const mockUseAuth = vi.fn().mockReturnValue({
  userInfo: {
    authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
    roles: ['super_admin'],
  },
})

// Mock useAuth hook
vi.mock(
  '@melody-auth/react',
  () => ({ useAuth: () => mockUseAuth() }),
)

describe(
  'Page Component',
  () => {
    beforeEach(() => {
      // Ensure app banner feature is enabled during tests
      configSignal.value = { ENABLE_APP_BANNER: true } as any
      (useGetApiV1AppsQuery as Mock).mockReturnValue({ data: { apps } });
      (useGetApiV1AppBannersQuery as Mock).mockReturnValue({ data: { appBanners: banners } })
    })

    it(
      'renders empty table when no apps data',
      () => {
        (useGetApiV1AppsQuery as Mock).mockReturnValue({ data: undefined });
        (useGetApiV1AppBannersQuery as Mock).mockReturnValue({ data: undefined })
        render(<Page />)

        const rows = screen.queryAllByTestId('appRow')
        expect(rows.length).toBe(0)
      },
    )

    it(
      'render apps',
      async () => {
        render(<Page />)

        const rows = screen.queryAllByTestId('appRow')
        expect(rows.length).toBe(5)
        rows.forEach((
          row, index,
        ) => {
          expect(row.querySelectorAll('td')[0]?.innerHTML).toContain(apps[index].name)
          expect(row.querySelectorAll('td')[1]?.innerHTML).toContain(apps[index].clientId)
          expect(row.querySelectorAll('td')[2]?.innerHTML).toContain(apps[index].isActive ? 'common.active' : 'common.disabled')
          expect(row.querySelectorAll('td')[3]?.innerHTML).toContain(apps[index].type.toUpperCase())
          const editLink = row.querySelectorAll('td')[4]?.getElementsByTagName('a')
          expect(editLink[0].getAttribute('href')).toBe(`/apps/${apps[index].id}`)
        })

        const createButton = screen.getByTestId('createButton')
        expect(createButton.getAttribute('href')).toBe('/apps/new')
      },
    )

    it(
      'shows loading state when isLoading is true',
      () => {
        (useGetApiV1AppsQuery as Mock).mockReturnValue({ isLoading: true });
        (useGetApiV1AppBannersQuery as Mock).mockReturnValue({ isLoading: true })
        render(<Page />)
        // Assert that the LoadingPage component is rendered by checking for text that includes 'loading'
        expect(screen.getByTestId('spinner')).toBeInTheDocument()
      },
    )

    it(
      'renders empty app banners table when no banner data',
      () => {
        (useGetApiV1AppBannersQuery as Mock).mockReturnValue({ data: { appBanners: [] } })
        render(<Page />)

        const bannerRows = screen.queryAllByTestId('bannerRow')
        expect(bannerRows.length).toBe(0)
      },
    )

    it(
      'renders app banners table with banner data',
      () => {
        render(<Page />)

        const bannerRows = screen.queryAllByTestId('bannerRow')
        expect(bannerRows.length).toBe(4)

        // Check first banner (info banner)
        const firstRow = bannerRows[0]
        expect(firstRow.querySelectorAll('td')[0]?.innerHTML).toContain(banners[0].text)
        const editLink = firstRow.querySelectorAll('td')[3]?.getElementsByTagName('a')
        expect(editLink[0].getAttribute('href')).toBe(`/apps/banners/${banners[0].id}`)

        // Check second banner (warning banner)
        const secondRow = bannerRows[1]
        expect(secondRow.querySelectorAll('td')[0]?.innerHTML).toContain(banners[1].text)

        // Check third banner (error banner with null text)
        const thirdRow = bannerRows[2]
        expect(thirdRow.querySelectorAll('td')[0]?.innerHTML).not.toContain('null')

        // Check fourth banner (success banner)
        const fourthRow = bannerRows[3]
        expect(fourthRow.querySelectorAll('td')[0]?.innerHTML).toContain(banners[3].text)
      },
    )

    it(
      'renders create banner button when user has write access',
      () => {
        render(<Page />)

        const createBannerButton = screen.getByTestId('createBannerButton')
        expect(createBannerButton.getAttribute('href')).toBe('/apps/banners/new')
      },
    )

    it(
      'does not render create banner button when user lacks write access',
      () => {
        mockUseAuth.mockReturnValue({
          userInfo: {
            authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
            roles: ['user'],
          },
        })

        render(<Page />)

        const createBannerButton = screen.queryByTestId('createBannerButton')
        expect(createBannerButton).not.toBeInTheDocument()
      },
    )

    it(
      'handles both apps and banners loading states',
      () => {
        (useGetApiV1AppsQuery as Mock).mockReturnValue({
          isLoading: false, data: { apps },
        });
        (useGetApiV1AppBannersQuery as Mock).mockReturnValue({ isLoading: true })
        render(<Page />)

        // Should not show loading page since apps are not loading
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()

        // Should show apps table
        const appRows = screen.queryAllByTestId('appRow')
        expect(appRows.length).toBe(5)
      },
    )

    it(
      'displays banner status correctly',
      () => {
        render(<Page />)

        const bannerRows = screen.queryAllByTestId('bannerRow')

        // Check active banner (first banner)
        const firstRow = bannerRows[0]
        const firstStatusCell = firstRow.querySelectorAll('td')[2]
        expect(firstStatusCell?.innerHTML).toContain('common.active')

        // Check inactive banner (third banner)
        const thirdRow = bannerRows[2]
        const thirdStatusCell = thirdRow.querySelectorAll('td')[2]
        expect(thirdStatusCell?.innerHTML).toContain('common.disabled')
      },
    )

    it(
      'displays banner types correctly',
      () => {
        render(<Page />)

        const bannerRows = screen.queryAllByTestId('bannerRow')

        // Check each banner type - BannerTypeLabel renders badges with translated text
        const expectedTypes = {
          info: 'apps.info',
          warning: 'apps.warning',
          error: 'apps.error',
          success: 'apps.success',
        }

        banners.forEach((
          banner, index,
        ) => {
          const row = bannerRows[index]
          const typeCell = row.querySelectorAll('td')[1]
          const expectedTranslationKey = expectedTypes[banner.type as keyof typeof expectedTypes]
          expect(typeCell?.innerHTML).toContain(expectedTranslationKey)
        })
      },
    )

    it(
      'handles empty banner text gracefully',
      () => {
        render(<Page />)

        const bannerRows = screen.queryAllByTestId('bannerRow')

        // Check the error banner (index 2) which has null text
        const errorBannerRow = bannerRows[2]
        const textCell = errorBannerRow.querySelectorAll('td')[0]
        expect(textCell?.innerHTML).not.toContain('null')
        expect(textCell?.innerHTML).not.toContain('undefined')
      },
    )
  },
)
