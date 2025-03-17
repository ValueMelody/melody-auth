import {
  getByText, getByLabelText, fireEvent,
} from '@testing-library/dom'
import {
  expect, describe, it, beforeEach, vi, beforeAll,
  Mock,
} from 'vitest'
import { render } from 'hono/jsx/dom'
import EmailMfa, { EmailMfaProps } from './EmailMfa'
import { emailMfa } from 'pages/tools/locale'

// Unit tests for the EmailMfa Component
beforeAll(() => {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault()
    },
  )
})

describe(
  'EmailMfa Component',
  () => {
    const defaultProps: EmailMfaProps = {
      locale: 'en' as any,
      handleSubmit: vi.fn(),
      handleChange: vi.fn(),
      values: { mfaCode: null },
      errors: { mfaCode: undefined },
      submitError: null,
      resent: false,
      sendEmailMfa: vi.fn(),
    }

    const setup = (props: EmailMfaProps = defaultProps) => {
      const container = document.createElement('div')
      render(
        <EmailMfa {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      (defaultProps.handleSubmit as Mock).mockReset();
      (defaultProps.handleChange as Mock).mockReset();
      (defaultProps.sendEmailMfa as Mock).mockReset()
    })

    it(
      'renders the view title from emailMfa locale',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          emailMfa.title.en,
        )
        expect(titleElement).toBeDefined()
      },
    )

    it(
      'renders SecondaryButton with resend text when not resent',
      () => {
        const container = setup()
        const secondaryButton = getByText(
          container,
          emailMfa.resend.en,
        )
        expect(secondaryButton).toBeDefined()
        expect((secondaryButton as HTMLButtonElement).disabled).toBe(false)
      },
    )

    it(
      'renders SecondaryButton with resent text and disabled when resent is true',
      () => {
        const props: EmailMfaProps = {
          ...defaultProps, resent: true,
        }
        const container = setup(props)
        const secondaryButton = getByText(
          container,
          emailMfa.resent.en,
        )
        expect(secondaryButton).toBeDefined()
        expect((secondaryButton as HTMLButtonElement).disabled).toBe(true)
      },
    )

    it(
      'calls sendEmailMfa with true when SecondaryButton is clicked',
      () => {
        const container = setup()
        const secondaryButton = getByText(
          container,
          emailMfa.resend.en,
        )
        fireEvent.click(secondaryButton)
        expect(defaultProps.sendEmailMfa).toHaveBeenCalledWith(true)
      },
    )

    it(
      'renders CodeInput with the proper label',
      () => {
        const container = setup()
        const codeInputLabel = getByText(
          container,
          emailMfa.code.en,
        )
        expect(codeInputLabel).toBeDefined()
      },
    )

    it(
      'calls handleChange when CodeInput value changes',
      () => {
        const container = setup()
        // Get the first input rendered by CodeInput using its aria-label
        const codeInput = getByLabelText(
          container,
          'Code input 1',
        ) as HTMLInputElement
        fireEvent.input(
          codeInput,
          { target: { value: '1' } },
        )
        expect(defaultProps.handleChange).toHaveBeenCalledWith(
          'mfaCode',
          ['1'],
        )
      },
    )

    it(
      'calls handleSubmit when the form is submitted',
      () => {
        const container = setup()
        const button = getByText(
          container,
          emailMfa.verify.en,
        )
        expect(button).toBeDefined()
        if (button) {
          fireEvent.click(button)
          expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1)
        }
      },
    )

    it(
      'renders submit error message if provided',
      () => {
        const errorMessage = 'Invalid code'
        const props: EmailMfaProps = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'renders PrimaryButton with verify text',
      () => {
        const container = setup()
        const primaryButton = getByText(
          container,
          emailMfa.verify.en,
        )
        expect(primaryButton).toBeDefined()
      },
    )
  },
)
