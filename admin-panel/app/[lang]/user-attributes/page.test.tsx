import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../../../vitest.setup'
import Page from 'app/[lang]/user-attributes/page'
import { userAttributes } from 'tests/userAttributeMock'
import { useGetApiV1UserAttributesQuery } from 'services/auth/api'

vi.mock(
  'services/auth/api',
  () => ({ useGetApiV1UserAttributesQuery: vi.fn() }),
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

vi.mock(
  'next-intl',
  () => ({ useTranslations: () => (key: string) => key }),
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
  'User Attributes Page Component',
  () => {
    beforeEach(() => {
      (useGetApiV1UserAttributesQuery as Mock).mockReturnValue({ data: { userAttributes } })
    })

    it(
      'renders empty table when no user attributes data',
      () => {
        (useGetApiV1UserAttributesQuery as Mock).mockReturnValue({ data: undefined })
        render(<Page />)

        const rows = screen.queryAllByTestId('userAttributeRow')
        expect(rows.length).toBe(0)
      },
    )

    it(
      'renders user attributes',
      async () => {
        render(<Page />)

        const rows = screen.queryAllByTestId('userAttributeRow')
        expect(rows.length).toBe(3)

        rows.forEach((
          row, index,
        ) => {
          expect(row.querySelectorAll('td')[0]?.innerHTML).toContain(userAttributes[index].name)
          const editLink = row.querySelectorAll('td')[5]?.getElementsByTagName('a')
          expect(editLink[0].getAttribute('href')).toBe(`/user-attributes/${userAttributes[index].id}`)
        })

        const createButton = screen.getByTestId('createButton')
        expect(createButton.getAttribute('href')).toBe('/user-attributes/new')
      },
    )

    it(
      'shows loading state when isLoading is true',
      () => {
        (useGetApiV1UserAttributesQuery as Mock).mockReturnValue({ isLoading: true })
        render(<Page />)
        expect(screen.getByTestId('spinner')).toBeInTheDocument()
      },
    )
  },
)
