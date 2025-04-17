import {
  describe, it, expect,
} from 'vitest'
import { JSDOM } from 'jsdom'
import PasswordReset from './PasswordReset'
import {
  localeConfig, typeConfig,
} from 'configs'

const mockProps = {
  branding: {
    name: 'Test Brand',
    logo: 'test-logo.png',
    logoUrl: '',
    emailLogoUrl: 'https://test.com/logo.png',
    fontFamily: 'Arial',
    fontUrl: null,
    layoutColor: '#ffffff',
    buttonColor: '#000000',
    buttonTextColor: '#ffffff',
    textColor: '#000000',
    linkColor: '#0000ff',
    labelColor: '#000000',
    primaryButtonColor: '#000000',
    primaryButtonLabelColor: '#ffffff',
    primaryButtonBorderColor: '#000000',
    secondaryButtonColor: '#ffffff',
    secondaryButtonLabelColor: '#000000',
    secondaryButtonBorderColor: '#000000',
  },
  resetCode: 'RESET1234',
  locale: 'en' as typeConfig.Locale,
}

function renderAndParse (props = mockProps) {
  // Render the PasswordReset template to an HTML string.
  // We call .toString() on the component as is done in UpdateInfo tests.
  const html = PasswordReset(props).toString()
  const dom = new JSDOM(
    html,
    {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost',
    },
  )
  return {
    document: dom.window.document, window: dom.window,
  }
}

describe(
  'PasswordReset',
  () => {
    it(
      'renders the component with correct title',
      () => {
        const { document } = renderAndParse()
        const header = document.querySelector('h1')
        expect(header?.textContent).toBe(localeConfig.passwordResetEmail.title[mockProps.locale])
      },
    )

    it(
      'renders description and reset code',
      () => {
        const { document } = renderAndParse()
        const paragraph = document.querySelector('p')
        expect(paragraph).toBeTruthy()

        // Check that the paragraph contains the localized description text.
        expect(paragraph?.textContent).toContain(localeConfig.passwordResetEmail.desc[mockProps.locale])

        // Check that the reset code is rendered in the <span>.
        const span = paragraph?.querySelector('span')
        expect(span?.textContent).toBe(mockProps.resetCode)
      },
    )

    it(
      'renders correctly with a different locale',
      () => {
        const propsFr = {
          ...mockProps,
          locale: 'fr' as typeConfig.Locale,
        }
        const { document } = renderAndParse(propsFr)
        const header = document.querySelector('h1')
        expect(header?.textContent).toBe(localeConfig.passwordResetEmail.title[propsFr.locale])

        const paragraph = document.querySelector('p')
        expect(paragraph?.textContent).toContain(localeConfig.passwordResetEmail.desc[propsFr.locale])

        const span = paragraph?.querySelector('span')
        expect(span?.textContent).toBe(mockProps.resetCode)
      },
    )
  },
)
