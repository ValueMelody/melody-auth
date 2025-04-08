import {
  getByText, queryByText, fireEvent,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, vi, beforeEach, beforeAll,
} from 'vitest'
import ResetMfa from './ResetMfa'
import { resetMfa } from 'pages/tools/locale'

beforeAll(() => {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault()
    },
  )
})

describe(
  'ResetMfa Component',
  () => {
    const defaultProps = {
      locale: 'en' as any,
      success: false,
      onSubmit: vi.fn((e: Event) => e.preventDefault()),
      submitError: null as string | null,
      redirectUri: '/redirect',
      isSubmitting: false,
    }

    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <ResetMfa {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      defaultProps.onSubmit.mockReset()
    })

    it(
      'renders success message when success is true',
      () => {
        const props = {
          ...defaultProps, success: true,
        }
        const container = setup(props)
        const successMessage = resetMfa.success.en
        const successElement = getByText(
          container,
          successMessage,
        )
        expect(successElement).toBeDefined()

        // When success is true, the form and view title should not be rendered.
        const titleElement = queryByText(
          container,
          resetMfa.title.en,
        )
        expect(titleElement).toBeNull()
        const form = container.querySelector('form')
        expect(form).toBeNull()
      },
    )

    it(
      'renders the form when success is false',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          resetMfa.title.en,
        )
        expect(titleElement).toBeDefined()
        const descriptionElement = getByText(
          container,
          resetMfa.desc.en,
        )
        expect(descriptionElement).toBeDefined()
        const primaryButton = getByText(
          container,
          resetMfa.confirm.en,
        )
        expect(primaryButton).toBeDefined()
        const form = container.querySelector('form')
        expect(form).toBeDefined()
      },
    )

    it(
      'calls handleSubmit on form submission when success is false',
      () => {
        const container = setup()
        const button = getByText(
          container,
          resetMfa.confirm.en,
        )
        expect(button).toBeDefined()
        fireEvent.click(button)
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'renders submit error message when submitError is provided',
      () => {
        const errorMessage = 'Test error'
        const props = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'renders redirect link with correct href and text',
      () => {
        const container = setup()
        const redirectLink = container.querySelector('a.button-secondary')
        expect(redirectLink).toBeDefined()
        expect(redirectLink?.getAttribute('href')).toBe(defaultProps.redirectUri)
        expect(redirectLink?.textContent).toContain(resetMfa.redirect.en)
      },
    )
  },
)
