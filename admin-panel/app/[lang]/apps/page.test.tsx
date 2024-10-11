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

describe(
  'Page Component',
  () => {
    beforeEach(() => {
      (useGetApiV1AppsQuery as Mock).mockReturnValue({ data: { apps } })
    })

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
          expect(editLink[0].getAttribute('href')).toBe(`/en/apps/${apps[index].id}`)
        })

        const createButton = screen.getByTestId('createButton')
        expect(createButton.getAttribute('href')).toBe('/en/apps/new')
      },
    )
  },
)
