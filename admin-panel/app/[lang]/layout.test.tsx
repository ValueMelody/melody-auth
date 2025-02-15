import { render } from '@testing-library/react'
import {
  describe, it, expect, beforeEach, vi,
} from 'vitest'
import { getMessages } from 'next-intl/server'
import RootLayout from './layout'

// Mock next-intl/server
vi.mock(
  'next-intl/server',
  () => ({ getMessages: vi.fn() }),
)

// Mock NextIntlClientProvider as it's a client component
vi.mock(
  'next-intl',
  () => ({
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='next-intl-provider'>{children}</div>
    ),
  }),
)

// Mock Setup component
vi.mock(
  'app/Setup',
  () => ({
    default: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='setup-component'>{children}</div>
    ),
  }),
)

describe(
  'RootLayout',
  () => {
    beforeEach(() => {
    // Reset all mocks before each test
      vi.clearAllMocks()
      ;(getMessages as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({})
    })

    it(
      'renders the layout with correct structure',
      async () => {
        const mockChildren = <div>Test Content</div>
        const params = { locale: 'en' }

        const {
          container, getByTestId,
        } = render(await RootLayout({
          children: mockChildren,
          params: { locale: params.locale },
        }))

        // Check if html tag has correct lang attribute
        expect(container.querySelector('html')).toHaveAttribute(
          'lang',
          'en',
        )

        // Verify NextIntlClientProvider is rendered
        expect(getByTestId('next-intl-provider')).toBeInTheDocument()

        // Verify Setup component is rendered
        expect(getByTestId('setup-component')).toBeInTheDocument()

        // Verify section has correct classes
        expect(container.querySelector('section')).toHaveClass(
          'flex',
          'flex-col',
          'min-h-screen',
          'w-full',
        )
      },
    )

    it(
      'calls getMessages during rendering',
      async () => {
        await RootLayout({
          children: <div>Test</div>,
          params: { locale: 'en' },
        })

        expect(getMessages).toHaveBeenCalled()
      },
    )
  },
)
