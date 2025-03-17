import {
  getByText, fireEvent,
} from '@testing-library/dom'
import {
  expect, describe, it, vi, beforeEach, beforeAll,
  Mock,
} from 'vitest'
import { render } from 'hono/jsx/dom'
import ChangeEmail, { ChangeEmailProps } from './ChangeEmail'
import { changeEmail } from 'pages/tools/locale'

beforeAll(() => {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault()
    },
  )
})

describe(
  'ChangeEmail Component',
  () => {
    const defaultProps: ChangeEmailProps = {
      locale: 'en' as any,
      success: false,
      handleSubmit: vi.fn(),
      handleChange: vi.fn(),
      values: {
        email: '',
        mfaCode: null,
      },
      errors: {
        email: undefined,
        mfaCode: undefined,
      },
      submitError: null,
      redirectUri: '/login',
      resent: false,
      handleResend: vi.fn(),
    }

    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <ChangeEmail {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      (defaultProps.handleSubmit as Mock).mockReset();
      (defaultProps.handleChange as Mock).mockReset();
      (defaultProps.handleResend as Mock).mockReset()
    })

    it(
      'renders success view correctly when success prop is true',
      () => {
        const props = {
          ...defaultProps, success: true,
        }
        const container = setup(props)

        // Check for success message
        const successMessage = changeEmail.success.en
        const successElement = getByText(
          container,
          successMessage,
        )
        expect(successElement).toBeDefined()

        // Check that redirect link is rendered with correct href and non-empty text
        const redirectLink = container.querySelector(`a[href="${defaultProps.redirectUri}"]`)
        expect(redirectLink).toBeDefined()
        expect(redirectLink?.textContent?.trim().length).toBeGreaterThan(0)
      },
    )

    it(
      'renders form view correctly when success prop is false',
      () => {
        const container = setup()

        // Check that form exists
        const formElement = container.querySelector('form')
        expect(formElement).toBeDefined()

        // Check that the email field label is rendered
        const emailLabel = getByText(
          container,
          changeEmail.email.en,
        )
        expect(emailLabel).toBeDefined()

        // Check that the primary button displays the send code text when mfaCode is null
        const primaryButtonTitle = changeEmail.sendCode.en
        const submitButton = getByText(
          container,
          primaryButtonTitle,
        )
        expect(submitButton).toBeDefined()
      },
    )

    it(
      'calls handleChange when email input changes',
      () => {
        const container = setup()

        // Assuming Field component associates label with input, we use getByLabelText
        const emailInput = container.querySelector('input[name="email"]')!
        expect(emailInput).toBeDefined()

        fireEvent.input(
          emailInput,
          { target: { value: 'test@example.com' } },
        )
        expect(defaultProps.handleChange).toHaveBeenCalledWith(
          'email',
          'test@example.com',
        )
      },
    )

    it(
      'calls handleSubmit when form is submitted',
      () => {
        const container = setup()
        const formElement = container.querySelector('form')
        const changeEmailButton = getByText(
          container,
          changeEmail.sendCode.en,
        )
        expect(changeEmailButton).toBeDefined()

        if (formElement) {
          fireEvent.click(changeEmailButton)
          expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1)
        }
      },
    )

    it(
      'renders MFA related fields when mfaCode is not null',
      () => {
        const mfaCode = ['']
        const props = {
          ...defaultProps,
          values: {
            ...defaultProps.values, mfaCode,
          },
        }
        const container = setup(props)

        // SecondaryButton should display resend text when not resent
        const secondaryButtonText = changeEmail.resend.en
        const resendButton = getByText(
          container,
          secondaryButtonText,
        )
        expect(resendButton).toBeDefined()

        // CodeInput label should be rendered
        const codeLabel = getByText(
          container,
          changeEmail.code.en,
        )
        expect(codeLabel).toBeDefined()

        // PrimaryButton should display confirm text when mfaCode is provided
        const confirmButton = getByText(
          container,
          changeEmail.confirm.en,
        )
        expect(confirmButton).toBeDefined()
      },
    )

    it(
      'calls handleResend when SecondaryButton is clicked',
      () => {
        const mfaCode = ['']
        const props = {
          ...defaultProps,
          values: {
            ...defaultProps.values, mfaCode,
          },
        }
        const container = setup(props)

        const resendButton = getByText(
          container,
          changeEmail.resend.en,
        )
        expect(resendButton).toBeDefined()

        if (resendButton) {
          fireEvent.click(resendButton)
          expect(defaultProps.handleResend).toHaveBeenCalledTimes(1)
        }
      },
    )

    it(
      'displays submit error message when submitError is provided',
      () => {
        const errorMessage = 'Error occurred'
        const props = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )
  },
)
