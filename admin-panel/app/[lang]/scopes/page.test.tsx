import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../../../vitest.setup'
import Page from 'app/[lang]/scopes/page'
import { useGetApiV1ScopesQuery } from 'services/auth/api'
import { scopes } from 'tests/scopeMock'

vi.mock(
  'services/auth/api',
  () => ({ useGetApiV1ScopesQuery: vi.fn() }),
)

vi.mock(
  'i18n/navigation',
  () => ({
    useRouter: vi.fn(() => ({ push: vi.fn() })),
    Link: vi.fn(({ href }: { href: string }) => <a href={href}>Link</a>),
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
      (useGetApiV1ScopesQuery as Mock).mockReturnValue({ data: { scopes } })
    })

    it(
      'renders scopes',
      async () => {
        render(<Page />)

        const rows = screen.queryAllByTestId('scopeRow')
        expect(rows.length).toBe(4)

        rows.forEach((
          row, index,
        ) => {
          expect(row.querySelectorAll('td')[0]?.innerHTML).toContain(scopes[index].name)
          expect(row.querySelectorAll('td')[1]?.innerHTML).toContain(scopes[index].note)
          expect(row.querySelectorAll('td')[2]?.innerHTML).toContain(scopes[index].type.toUpperCase())
          const editLink = row.querySelectorAll('td')[3]?.getElementsByTagName('a')
          expect(editLink[0].getAttribute('href')).toBe(`/scopes/${scopes[index].id}`)
        })
      },
    )

    it(
      'renders empty table when data is undefined',
      async () => {
        (useGetApiV1ScopesQuery as Mock).mockReturnValue({ data: undefined })

        render(<Page />)

        const rows = screen.queryAllByTestId('scopeRow')
        expect(rows.length).toBe(0)
      },
    )

    it(
      'renders breadcrumb with correct page label',
      () => {
        render(<Page />)
        expect(screen.getByText(/scopes\.title/i)).toBeInTheDocument()
      },
    )

    it(
      'renders loading state when scopes are loading',
      () => {
        (useGetApiV1ScopesQuery as Mock).mockReturnValue({
          isLoading: true,
          data: undefined,
          error: null,
        })
        render(<Page />)
        expect(screen.getByTestId('spinner')).toBeInTheDocument()
      },
    )
  },
)
