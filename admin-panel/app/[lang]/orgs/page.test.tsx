import {
  describe, it, expect, vi, beforeEach,
} from 'vitest'
import {
  render, screen,
} from '@testing-library/react'
import Page from 'app/[lang]/orgs/page'
import { useGetApiV1OrgsQuery } from 'services/auth/api'

vi.mock(
  'services/auth/api',
  () => ({ useGetApiV1OrgsQuery: vi.fn() }),
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
  'Orgs Page',
  () => {
    const mockOrgs = [
      {
        id: '1', name: 'Org 1', slug: 'org-1',
      },
      {
        id: '2', name: 'Org 2', slug: 'org-2',
      },
    ]

    beforeEach(() => {
    // Setup default mock implementations
      vi.mocked(useGetApiV1OrgsQuery).mockReturnValue({
        data: { orgs: mockOrgs },
        isLoading: false,
        error: null,
      } as any)
    })

    it(
      'renders the page title',
      () => {
        render(<Page />)
        expect(screen.getByText('orgs.title')).toBeInTheDocument()
      },
    )

    it(
      'renders create button with correct href',
      () => {
        render(<Page />)
        const createButton = screen.getByTestId('createButton')
        expect(createButton).toHaveAttribute(
          'href',
          '/orgs/new',
        )
      },
    )

    it(
      'renders org table with correct data',
      () => {
        render(<Page />)

        // Check if org names are displayed
        mockOrgs.forEach((org) => {
          expect(screen.getAllByText(org.name)).toHaveLength(2)
          expect(screen.getAllByText(org.slug)).toHaveLength(2)
        })
      },
    )

    it(
      'renders edit links for each org',
      () => {
        render(<Page />)

        // Check if edit links are present for each org
        mockOrgs.forEach((org) => {
          const row = screen.getByTestId(`roleRow-${org.id}`)
          const editLinks = row.querySelectorAll('a')
          expect(editLinks).toHaveLength(1)
          expect(editLinks[0]).toHaveAttribute(
            'href',
            `/orgs/${org.id}`,
          )
        })
      },
    )

    it(
      'handles empty orgs data',
      () => {
        vi.mocked(useGetApiV1OrgsQuery).mockReturnValue({
          data: { orgs: [] },
          isLoading: false,
          error: null,
        } as any)

        render(<Page />)

        // Should still render table structure but with no data rows
        expect(screen.getByText('orgs.name')).toBeInTheDocument()
        expect(screen.getByText('orgs.slug')).toBeInTheDocument()
      },
    )

    it(
      'handles undefined data from query',
      () => {
        vi.mocked(useGetApiV1OrgsQuery).mockReturnValue({
          data: undefined,
          isLoading: false,
          error: null,
        } as any)

        render(<Page />)

        // Should render table structure but with no data rows
        expect(screen.getByText('orgs.name')).toBeInTheDocument()
        expect(screen.getByText('orgs.slug')).toBeInTheDocument()

        // Verify no org data is rendered
        expect(screen.queryByTestId(/^roleRow-/)).not.toBeInTheDocument()
      },
    )
  },
)
