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
          expect(editLink[0].getAttribute('href')).toBe(`/en/scopes/${scopes[index].id}`)
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
  },
)
