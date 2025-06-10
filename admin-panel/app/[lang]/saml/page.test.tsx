import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../../../vitest.setup'
import Page from 'app/[lang]/saml/page'
import { useGetApiV1SamlIdpsQuery } from 'services/auth/api'

const mockSamlIdps = [
  {
    id: '1',
    name: 'Google SAML',
    entityId: 'google-saml-entity',
    ssoUrl: 'https://accounts.google.com/o/saml2/idp?idpid=C01abc234',
    certificate: 'mock-certificate-1',
  },
  {
    id: '2',
    name: 'Okta SAML',
    entityId: 'okta-saml-entity',
    ssoUrl: 'https://dev-123456.okta.com/app/sample/sso/saml',
    certificate: 'mock-certificate-2',
  },
]

vi.mock(
  'services/auth/api',
  () => ({ useGetApiV1SamlIdpsQuery: vi.fn() }),
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
  'SAML Page Component',
  () => {
    beforeEach(() => {
      (useGetApiV1SamlIdpsQuery as Mock).mockReturnValue({
        data: { idps: mockSamlIdps },
        isLoading: false,
      })
    })

    it(
      'render SAML IdPs',
      async () => {
        render(<Page />)

        // Check that IdP names are displayed
        expect(screen.getAllByText('Google SAML').length).toBe(2)
        expect(screen.getAllByText('Okta SAML').length).toBe(2)

        // Check edit links
        const editLinks = screen.getAllByTestId('editLink')
        expect(editLinks.length).toBe(4)
        expect(editLinks[0]).toHaveAttribute(
          'href',
          '/saml/1',
        )
        expect(editLinks[1]).toHaveAttribute(
          'href',
          '/saml/2',
        )

        // Check create button
        const createButton = screen.getByTestId('createButton')
        expect(createButton).toHaveAttribute(
          'href',
          '/saml/new',
        )
      },
    )

    it(
      'renders empty table when no SAML IdPs are returned',
      () => {
        (useGetApiV1SamlIdpsQuery as Mock).mockReturnValue({
          data: { idps: [] },
          isLoading: false,
          error: null,
        })

        render(<Page />)

        expect(screen.queryByText('Google SAML')).not.toBeInTheDocument()
        expect(screen.queryByText('Okta SAML')).not.toBeInTheDocument()
      },
    )

    it(
      'renders empty table when data is undefined',
      () => {
        (useGetApiV1SamlIdpsQuery as Mock).mockReturnValue({
          data: undefined,
          isLoading: false,
          error: null,
        })

        render(<Page />)

        expect(screen.queryByText('Google SAML')).not.toBeInTheDocument()
        expect(screen.queryByText('Okta SAML')).not.toBeInTheDocument()
      },
    )

    it(
      'renders loading state when data is loading',
      () => {
        (useGetApiV1SamlIdpsQuery as Mock).mockReturnValue({
          data: undefined,
          isLoading: true,
          error: null,
        })
        render(<Page />)
        expect(screen.getByTestId('spinner')).toBeInTheDocument()
      },
    )

    it(
      'does not render create button when user lacks write permissions',
      () => {
        mockUseAuth.mockReturnValue({
          userInfo: {
            authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
            roles: ['read_only_user'],
          },
        })

        render(<Page />)

        expect(screen.queryByTestId('createButton')).not.toBeInTheDocument()
      },
    )
  },
)
