import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../../../vitest.setup'
import Page from 'app/[lang]/apps/page'
import { apps } from 'tests/appMock'
import { useGetApiV1AppsQuery } from 'services/auth/api'

vi.mock(
  'services/auth/api',
  () => ({ useGetApiV1AppsQuery: vi.fn() }),
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

describe(
  'Page Component',
  () => {
    beforeEach(() => {
      (useGetApiV1AppsQuery as Mock).mockReturnValue({ data: { apps } })
    })

    it(
      'renders empty table when no apps data',
      () => {
        (useGetApiV1AppsQuery as Mock).mockReturnValue({ data: undefined })
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
  },
)
