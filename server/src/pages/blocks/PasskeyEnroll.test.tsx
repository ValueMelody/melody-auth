import {
  getByText, fireEvent,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, vi, beforeEach,
} from 'vitest'
import PasskeyEnroll from './PasskeyEnroll'
import { passkeyEnroll } from 'pages/tools/locale'

describe(
  'PasskeyEnroll Component',
  () => {
    const defaultProps = {
      locale: 'en' as any,
      onDecline: vi.fn(),
      onEnroll: vi.fn(),
      submitError: null as string | null,
      rememberSkip: false,
      onRememberSkip: vi.fn(),
      isEnrolling: false,
      isDeclining: false,
    }

    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <PasskeyEnroll {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      defaultProps.onDecline.mockReset()
      defaultProps.onEnroll.mockReset()
      defaultProps.onRememberSkip.mockReset()
    })

    it(
      'renders view title correctly',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          passkeyEnroll.title.en,
        )
        expect(titleElement).toBeDefined()
      },
    )

    it(
      'renders skip and enroll secondary buttons and triggers handlers on click',
      () => {
        const container = setup()

        const skipButton = getByText(
          container,
          passkeyEnroll.skip.en,
        )
        const enrollButton = getByText(
          container,
          passkeyEnroll.enroll.en,
        )
        expect(skipButton).toBeDefined()
        expect(enrollButton).toBeDefined()

        fireEvent.click(skipButton)
        expect(defaultProps.onDecline).toHaveBeenCalledTimes(1)

        fireEvent.click(enrollButton)
        expect(defaultProps.onEnroll).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'renders submit error message when submitError is provided',
      () => {
        const errorMessage = 'Error occurred'
        const props = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'renders checkbox input with correct label and checked state, and triggers handleRememberSkip on change',
      () => {
        const container = setup({
          ...defaultProps, rememberSkip: true,
        })
        const checkboxLabel = getByText(
          container,
          passkeyEnroll.rememberSkip.en,
        )
        expect(checkboxLabel).toBeDefined()

        const checkboxInput = container.querySelector('input#skipPasskeyEnroll') as HTMLInputElement
        expect(checkboxInput).toBeDefined()
        expect(checkboxInput.checked).toBe(true)

        fireEvent.click(checkboxInput)
        expect(defaultProps.onRememberSkip).toHaveBeenCalledWith(false)
      },
    )
  },
)
