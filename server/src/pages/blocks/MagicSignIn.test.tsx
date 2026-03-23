import { render } from 'hono/jsx/dom'
import {
  expect, describe, it,
} from 'vitest'
import MagicSignIn from './MagicSignIn'
import { magicSignIn } from 'pages/tools/locale'

describe(
  'MagicSignIn Component',
  () => {
    const setup = (props: {
      locale: any;
      isProcessing: boolean;
      isSuccess: boolean;
      error: string | null;
    }) => {
      const container = document.createElement('div')
      render(
        <MagicSignIn {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    it(
      'shows processing title when isProcessing is true',
      () => {
        const container = setup({
          locale: 'en',
          isProcessing: true,
          isSuccess: false,
          error: null,
        })
        expect(container.textContent).toContain(magicSignIn.processing.en)
        expect(container.textContent).not.toContain(magicSignIn.success.en)
        expect(container.textContent).not.toContain(magicSignIn.invalid.en)
      },
    )

    it(
      'shows success title when sign-in succeeds',
      () => {
        const container = setup({
          locale: 'en',
          isProcessing: false,
          isSuccess: true,
          error: null,
        })
        expect(container.textContent).toContain(magicSignIn.success.en)
        expect(container.textContent).not.toContain(magicSignIn.processing.en)
      },
    )

    it(
      'shows invalid title and error message when error is "invalid"',
      () => {
        const container = setup({
          locale: 'en',
          isProcessing: false,
          isSuccess: false,
          error: 'invalid',
        })
        expect(container.textContent).toContain(magicSignIn.invalid.en)
      },
    )

    it(
      'shows custom error message when error is not "invalid"',
      () => {
        const container = setup({
          locale: 'en',
          isProcessing: false,
          isSuccess: false,
          error: 'Something went wrong',
        })
        expect(container.textContent).toContain('Something went wrong')
        expect(container.textContent).toContain(magicSignIn.invalid.en)
      },
    )

    it(
      'does not show error while still processing',
      () => {
        const container = setup({
          locale: 'en',
          isProcessing: true,
          isSuccess: false,
          error: 'invalid',
        })
        expect(container.textContent).toContain(magicSignIn.processing.en)
        expect(container.textContent).not.toContain(magicSignIn.invalid.en)
      },
    )
  },
)
