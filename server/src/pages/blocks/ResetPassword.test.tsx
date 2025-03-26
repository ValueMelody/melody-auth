import {
  getByText,
  getByLabelText,
  queryByText,
  fireEvent,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, vi, beforeEach, beforeAll,
} from 'vitest'
import ResetPassword from './ResetPassword'
import { resetPassword } from 'pages/tools/locale'
import { View } from 'pages/hooks'

beforeAll(() => {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault()
    },
  )
})

describe(
  'ResetPassword Component',
  () => {
    const defaultProps = {
      locale: 'en' as any,
      success: false,
      handleSubmit: vi.fn(),
      submitError: null as string | null,
      onSwitchView: vi.fn(),
      values: {
        email: '',
        mfaCode: null as string[] | null,
        password: '',
        confirmPassword: '',
      },
      errors: {
        email: undefined,
        mfaCode: undefined,
        password: undefined,
        confirmPassword: undefined,
      },
      handleChange: vi.fn(),
      handleResend: vi.fn(),
      resent: false,
    }

    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <ResetPassword {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      defaultProps.handleSubmit.mockReset()
      defaultProps.handleChange.mockReset()
      defaultProps.handleResend.mockReset()
      defaultProps.onSwitchView.mockReset()
    })

    it(
      'renders success view when success is true',
      () => {
        const props = {
          ...defaultProps, success: true,
        }
        const container = setup(props)
        // Expect success message and sign in button to be rendered
        const successMessage = getByText(
          container,
          resetPassword.success.en,
        )
        expect(successMessage).toBeDefined()
        const signInButton = getByText(
          container,
          resetPassword.signIn.en,
        )
        expect(signInButton).toBeDefined()
        // Form and title should not be rendered when success is true
        const titleElement = queryByText(
          container,
          resetPassword.title.en,
        )
        expect(titleElement).toBeNull()
        const form = container.querySelector('form')
        expect(form).toBeNull()
      },
    )

    it(
      'renders form view when success is false and mfaCode is null',
      () => {
        const props = {
          ...defaultProps,
          success: false,
          values: {
            ...defaultProps.values, mfaCode: null,
          },
        }
        const container = setup(props)
        // Check for ViewTitle and description
        const titleElement = getByText(
          container,
          resetPassword.title.en,
        )
        expect(titleElement).toBeDefined()
        const descriptionElement = getByText(
          container,
          resetPassword.desc.en,
        )
        expect(descriptionElement).toBeDefined()
        // Email field should be rendered
        const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement
        expect(emailInput).toBeDefined()
        // Primary button should show the send label since mfaCode is null
        const primaryButton = getByText(
          container,
          resetPassword.send.en,
        )
        expect(primaryButton).toBeDefined()
        // Back sign in button should be rendered
        const backButton = getByText(
          container,
          resetPassword.backSignIn.en,
        )
        expect(backButton).toBeDefined()
      },
    )

    it(
      'renders extended form view when mfaCode is not null',
      () => {
        const props = {
          ...defaultProps,
          success: false,
          values: {
            ...defaultProps.values, mfaCode: [''],
          },
          resent: false,
        }
        const container = setup(props)
        // Email field is rendered
        const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement
        expect(emailInput).toBeDefined()
        // The secondary button for resend code should render with the appropriate label
        const resendButton = getByText(
          container,
          resetPassword.resend.en,
        )
        expect(resendButton).toBeDefined()
        expect((resendButton as HTMLButtonElement).disabled).toBe(false)
        // CodeInput should be rendered with its label
        const codeInput = container.querySelector('input[name="mfaCode"]') as HTMLInputElement
        expect(codeInput).toBeDefined()
        // Password fields should be rendered
        const passwordField = container.querySelector('input[name="password"]') as HTMLInputElement
        expect(passwordField).toBeDefined()
        const confirmPasswordField = container.querySelector('input[name="confirmPassword"]') as HTMLInputElement
        expect(confirmPasswordField).toBeDefined()
      },
    )

    it(
      'calls handleSubmit when primary button is clicked',
      () => {
        const container = setup()
        const primaryButton = getByText(
          container,
          // Primary button title depends on mfaCode value.
          // If mfaCode is null, it shows resetPassword.send; otherwise, it shows resetPassword.reset.
          defaultProps.values.mfaCode !== null
            ? resetPassword.reset.en
            : resetPassword.send.en,
        )
        expect(primaryButton).toBeDefined()
        fireEvent.click(primaryButton)
        expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'calls handleResend when the secondary resend button is clicked in extended form',
      () => {
        const props = {
          ...defaultProps,
          success: false,
          values: {
            ...defaultProps.values, mfaCode: [''],
          },
          resent: false,
        }
        const container = setup(props)
        const resendButton = getByText(
          container,
          resetPassword.resend.en,
        )
        expect(resendButton).toBeDefined()
        fireEvent.click(resendButton)
        expect(defaultProps.handleResend).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'displays resent text and disables button when resent is true',
      () => {
        const props = {
          ...defaultProps,
          success: false,
          values: {
            ...defaultProps.values,
            mfaCode: [''],
          },
          resent: true,
        }
        const container = setup(props)

        const resentButton = getByText(
          container,
          resetPassword.resent.en,
        )
        expect(resentButton).toBeDefined()
        expect((resentButton as HTMLButtonElement).disabled).toBe(true)
      },
    )

    it(
      'calls onSwitchView with View.SignIn when back sign in button is clicked',
      () => {
        const container = setup()
        const backButton = getByText(
          container,
          resetPassword.backSignIn.en,
        )
        expect(backButton).toBeDefined()
        fireEvent.click(backButton)
        expect(defaultProps.onSwitchView).toHaveBeenCalledWith(View.SignIn)
      },
    )

    it(
      'calls handleChange when email field value changes',
      () => {
        const container = setup()
        const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement
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
      'calls handleChange when CodeInput value changes in extended form',
      () => {
        const props = {
          ...defaultProps,
          values: {
            ...defaultProps.values, mfaCode: [''],
          },
        }
        const container = setup(props)
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
      'calls handleChange when confirmPassword field value changes',
      () => {
        const props = {
          ...defaultProps,
          values: {
            ...defaultProps.values,
            mfaCode: [''],
          },
        }
        const container = setup(props)
        const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]') as HTMLInputElement
        expect(confirmPasswordInput).toBeDefined()

        fireEvent.input(
          confirmPasswordInput,
          { target: { value: 'newPassword123' } },
        )

        expect(defaultProps.handleChange).toHaveBeenCalledWith(
          'confirmPassword',
          'newPassword123',
        )
      },
    )

    it(
      'calls handleChange when password field value changes',
      () => {
        const props = {
          ...defaultProps,
          values: {
            ...defaultProps.values,
            mfaCode: [''],
          },
        }
        const container = setup(props)
        const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement
        expect(passwordInput).toBeDefined()

        fireEvent.input(
          passwordInput,
          { target: { value: 'myNewPassword123' } },
        )

        expect(defaultProps.handleChange).toHaveBeenCalledWith(
          'password',
          'myNewPassword123',
        )
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
  },
)
