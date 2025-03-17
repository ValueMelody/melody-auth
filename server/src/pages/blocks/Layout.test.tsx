import { getByText } from '@testing-library/dom'
import {
  expect, describe, it, beforeEach, vi,
} from 'vitest'
import { render } from 'hono/jsx/dom'
import Layout from './Layout'
import { layout } from 'pages/tools/locale'
import { typeConfig } from 'configs'

// Unit tests for the Layout Component

describe(
  'Layout Component',
  () => {
    const dummyLocale = 'en' as typeConfig.Locale
    const dummyLocales = ['en', 'fr'] as typeConfig.Locale[]
    const singleLocale = ['en'] as typeConfig.Locale[]
    const dummyLogo = 'https://example.com/logo.png'
    const dummyChild = <div data-testid='child'>Child Content</div>
    const onSwitchLocale = vi.fn()

    const setup = (props: Partial<Parameters<typeof Layout>[0]> = {}) => {
      const defaultProps = {
        logoUrl: dummyLogo,
        children: dummyChild,
        locale: dummyLocale,
        locales: dummyLocales,
        onSwitchLocale,
        ...props,
      }
      const container = document.createElement('div')
      render(
        <Layout {...defaultProps} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      onSwitchLocale.mockReset()
    })

    it(
      'renders children content',
      () => {
        const container = setup()
        expect(getByText(
          container,
          'Child Content',
        )).toBeDefined()
      },
    )

    it(
      'renders logo image with correct src and alt',
      () => {
        const container = setup()
        const logo = container.querySelector('img')
        expect(logo).toBeDefined()
        expect(logo?.getAttribute('src')).toBe(dummyLogo)
        expect(logo?.getAttribute('alt')).toBe('Logo')
      },
    )

    it(
      'renders LocaleSelector when multiple locales are provided',
      () => {
        const container = setup()
        const localeSelectorDiv = container.querySelector('div.absolute.right-0')
        expect(localeSelectorDiv).toBeDefined()
      },
    )

    it(
      'does not render LocaleSelector when only one locale is provided',
      () => {
        const container = setup({ locales: singleLocale })
        const localeSelectorDiv = container.querySelector('div.absolute.right-0')
        expect(localeSelectorDiv).toBeNull()
      },
    )

    it(
      'renders the powered-by link with correct href and text',
      () => {
        const container = setup()
        const link = container.querySelector('a[href="https://github.com/ValueMelody/melody-auth"]')
        expect(link).toBeDefined()
        expect(link?.textContent?.trim()).toBe(layout.poweredByAuth[dummyLocale])
      },
    )
  },
)
