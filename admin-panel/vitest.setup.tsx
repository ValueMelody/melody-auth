import { vi } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Layout } from 'tests/layout'

const customRender = (ui: React.ReactElement) => {
  return render(
    ui,
    { wrapper: Layout },
  )
}

global.URL = vi.fn().mockImplementation((url) => ({ href: url })) as any

Object.defineProperty(
  window,
  'matchMedia',
  {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  },
)

window.PointerEvent = MouseEvent as typeof PointerEvent

vi.mock(
  'next-intl',
  () => ({
    ...vi.importActual('next-intl'),
    useTranslations: () => (key: string) => key,
    useLocale: () => 'en',
  }),
)

export { customRender as render }
