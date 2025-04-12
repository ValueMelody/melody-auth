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
      onSubmit: vi.fn(),
      onChange: vi.fn(),
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
      onResend: vi.fn(),
      isSubmitting: false,
      isResending: false,
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
      (defaultProps.onSubmit as Mock).mockReset();
      (defaultProps.onChange as Mock).mockReset();
      (defaultProps.onResend as Mock).mockReset()
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
        expect(defaultProps.onChange).toHaveBeenCalledWith(
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
          expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
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
          expect(defaultProps.onResend).toHaveBeenCalledTimes(1)
        }
      },
    )

    it(
      'displays resent text when resent prop is true',
      () => {
        const mfaCode = ['']
        const props = {
          ...defaultProps,
          values: {
            ...defaultProps.values, mfaCode,
          },
          resent: true,
        }
        const container = setup(props)

        const resentButton = getByText(
          container,
          changeEmail.resent.en,
        )
        expect(resentButton).toBeDefined()
        expect((resentButton as HTMLButtonElement).disabled).toBe(true)
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

    it(
      'calls handleChange when code input changes',
      () => {
        const props = {
          ...defaultProps,
          values: {
            ...defaultProps.values,
            mfaCode: ['', '', '', '', '', ''],
          },
        }
        const container = setup(props)

        const firstCodeInput = container.querySelector('input[aria-label="Code input 1"]')
        expect(firstCodeInput).toBeDefined()

        fireEvent.input(
firstCodeInput as HTMLInputElement,
{ target: { value: '1' } },
        )

        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'mfaCode',
          ['1', '', '', '', '', ''],
        )
      },
    )

    it(
      'handles null mfaCode by using empty array in CodeInput',
      () => {
        const props = {
          ...defaultProps,
          values: {
            ...defaultProps.values,
            mfaCode: ['1', '2', '3', '', '', ''],
          },
        }
        const container = setup(props)

        // Now CodeInput should be rendered with empty inputs
        const newCodeInputs = container.querySelectorAll('input[aria-label^="Code input"]') as NodeListOf<HTMLInputElement>
        expect(newCodeInputs.length).toBe(6)
        expect(newCodeInputs[0].value).toBe('1')
        expect(newCodeInputs[1].value).toBe('2')
        expect(newCodeInputs[2].value).toBe('3')
        expect(newCodeInputs[3].value).toBe('')
        expect(newCodeInputs[4].value).toBe('')
        expect(newCodeInputs[5].value).toBe('')
      },
    )

    it(
      'do not display spinner in PrimaryButton when isSubmitting is false',
      () => {
        const props = {
          ...defaultProps,
          isSubmitting: false,
        }
        const container = setup(props)
        const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement
        expect(submitButton).toBeDefined()
        expect(submitButton?.disabled).toBeFalsy()
        const spinnerSpan = submitButton?.querySelector('span.ml-2')
        expect(spinnerSpan).toBeNull()
      },
    )

    it(
      'displays spinner in PrimaryButton when isSubmitting is true',
      () => {
        const props = {
          ...defaultProps,
          isSubmitting: true, // simulate loading state
        }
        const container = setup(props)
        // Find the primary submit button (used for sending code or confirming)
        const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement
        expect(submitButton).toBeDefined()
        // Expect the button to be disabled when in loading state
        expect(submitButton?.disabled).toBeTruthy()
        // Verify that the spinner element (a <span> with class "ml-2") is rendered inside the button
        const spinnerSpan = submitButton?.querySelector('span.ml-2')
        expect(spinnerSpan).toBeDefined()
      },
    )
  },
)
