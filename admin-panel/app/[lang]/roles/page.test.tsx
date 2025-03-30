import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../../../vitest.setup'
import Page from 'app/[lang]/roles/page'
import { roles } from 'tests/roleMock'
import { useGetApiV1RolesQuery } from 'services/auth/api'

vi.mock(
  'services/auth/api',
  () => ({ useGetApiV1RolesQuery: vi.fn() }),
)

vi.mock(
  'i18n/navigation',
  () => ({
    useRouter: vi.fn(() => ({ push: vi.fn() })),
    Link: vi.fn(({
      href, 'data-testid': dataTestId,
    }: { href: string; 'data-testid': string }) => <a
      href={href}
      data-testid={dataTestId}>Link</a>),
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
      (useGetApiV1RolesQuery as Mock).mockReturnValue({ data: { roles } })
    })

    it(
      'render roles',
      async () => {
        render(<Page />)

        const rows = screen.queryAllByTestId('roleRow')
        expect(rows.length).toBe(4)
        expect(rows[0].querySelector('td')?.innerHTML).toContain(roles[0].name)
        const editLinks = rows[0].querySelector('td')?.getElementsByTagName('a')
        expect(editLinks?.length).toBe(0)

        expect(rows[1].querySelector('td')?.innerHTML).toContain(roles[1].name)
        const editLinks1 = rows[1].querySelector('td')?.getElementsByTagName('a')
        expect(editLinks1?.length).toBe(1)
        expect(editLinks1?.[0].getAttribute('href')).toBe('/roles/2')

        const createButton = screen.getByTestId('createButton')
        expect(createButton.getAttribute('href')).toBe('/roles/new')
      },
    )

    it(
      'renders empty table when no roles are returned',
      () => {
        (useGetApiV1RolesQuery as Mock).mockReturnValue({
          data: undefined,
          isLoading: false,
          error: null,
        })

        render(<Page />)

        const rows = screen.queryAllByTestId('roleRow')
        expect(rows.length).toBe(0)
      },
    )
  },
)
