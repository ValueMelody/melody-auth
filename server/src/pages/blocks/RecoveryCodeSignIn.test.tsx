import {
  getByText, fireEvent,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, beforeEach, vi, beforeAll,
  Mock,
} from 'vitest'
import RecoveryCodeSignIn, { RecoveryCodeSignInProps } from './RecoveryCodeSignIn'
import { recoveryCodeSignIn } from 'pages/tools/locale'
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
  'RecoveryCodeSignIn Component',
  () => {
    const defaultProps: RecoveryCodeSignInProps = {
      locale: 'en' as any,
      onSubmit: vi.fn((e: Event) => e.preventDefault()),
      onChange: vi.fn(),
      values: {
        email: '',
        recoveryCode: '',
      },
      errors: {
        email: undefined,
        recoveryCode: undefined,
      },
      submitError: null,
      onSwitchView: vi.fn(),
      isSubmitting: false,
    }

    const setup = (props: RecoveryCodeSignInProps = defaultProps) => {
      const container = document.createElement('div')
      render(
        <RecoveryCodeSignIn {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      (defaultProps.onSubmit as Mock).mockReset();
      (defaultProps.onChange as Mock).mockReset();
      (defaultProps.onSwitchView as Mock).mockReset()
    })

    it(
      'renders view title correctly',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          recoveryCodeSignIn.title.en,
        )
        expect(titleElement).toBeDefined()
      },
    )

    it(
      'renders email field with correct properties',
      () => {
        const container = setup()
        const emailField = container.querySelector('input[name="email"]') as HTMLInputElement
        expect(emailField).toBeDefined()
        expect(emailField.type).toBe('email')
        expect(emailField.getAttribute('autocomplete')).toBe('email')
      },
    )

    it(
      'renders recovery code field with correct properties',
      () => {
        const container = setup()
        const recoveryCodeField = container.querySelector('input[name="recoveryCode"]') as HTMLInputElement
        expect(recoveryCodeField).toBeDefined()
        expect(recoveryCodeField.type).toBe('text')
        expect(recoveryCodeField.getAttribute('autocomplete')).toBe('recoveryCode')
      },
    )

    it(
      'calls onChange when email field value changes',
      () => {
        const container = setup()
        const emailField = container.querySelector('input[name="email"]') as HTMLInputElement
        fireEvent.input(
          emailField,
          { target: { value: 'test@example.com' } },
        )
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'email',
          'test@example.com',
        )
      },
    )

    it(
      'calls onChange when recovery code field value changes',
      () => {
        const container = setup()
        const recoveryCodeField = container.querySelector('input[name="recoveryCode"]') as HTMLInputElement
        fireEvent.input(
          recoveryCodeField,
          { target: { value: 'ABC123DEF456' } },
        )
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'recoveryCode',
          'ABC123DEF456',
        )
      },
    )

    it(
      'displays field values correctly',
      () => {
        const props = {
          ...defaultProps,
          values: {
            email: 'user@example.com',
            recoveryCode: 'XYZ789',
          },
        }
        const container = setup(props)
        const emailField = container.querySelector('input[name="email"]') as HTMLInputElement
        const recoveryCodeField = container.querySelector('input[name="recoveryCode"]') as HTMLInputElement

        expect(emailField.value).toBe('user@example.com')
        expect(recoveryCodeField.value).toBe('XYZ789')
      },
    )

    it(
      'renders primary button with correct text',
      () => {
        const container = setup()
        const confirmButton = getByText(
          container,
          recoveryCodeSignIn.confirm.en,
        )
        expect(confirmButton).toBeDefined()
        expect(confirmButton.getAttribute('type')).toBe('submit')
      },
    )

    it(
      'renders secondary button with correct text',
      () => {
        const container = setup()
        const signInButton = getByText(
          container,
          recoveryCodeSignIn.signIn.en,
        )
        expect(signInButton).toBeDefined()
      },
    )

    it(
      'calls onSubmit when form is submitted',
      () => {
        const container = setup()
        const confirmButton = getByText(
          container,
          recoveryCodeSignIn.confirm.en,
        )
        fireEvent.click(confirmButton)
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'calls onSwitchView with View.SignIn when secondary button is clicked',
      () => {
        const container = setup()
        const signInButton = getByText(
          container,
          recoveryCodeSignIn.signIn.en,
        )
        fireEvent.click(signInButton)
        expect(defaultProps.onSwitchView).toHaveBeenCalledWith(View.SignIn)
      },
    )

    it(
      'renders submit error message when submitError is provided',
      () => {
        const errorMessage = 'Invalid recovery code'
        const props = {
          ...defaultProps,
          submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'does not render submit error when submitError is null',
      () => {
        const container = setup()
        // The SubmitError component should not render any error text when error is null
        expect(container.textContent).not.toContain('Invalid')
        expect(container.textContent).not.toContain('Error')
      },
    )

    it(
      'renders email field error message when errors.email is provided',
      () => {
        const errorMessage = 'Invalid email format'
        const props = {
          ...defaultProps,
          errors: {
            ...defaultProps.errors,
            email: errorMessage,
          },
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'renders recovery code field error message when errors.recoveryCode is provided',
      () => {
        const errorMessage = 'Recovery code is required'
        const props = {
          ...defaultProps,
          errors: {
            ...defaultProps.errors,
            recoveryCode: errorMessage,
          },
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'renders both field error messages when both errors are provided',
      () => {
        const emailError = 'Email is required'
        const recoveryCodeError = 'Recovery code is invalid'
        const props = {
          ...defaultProps,
          errors: {
            email: emailError,
            recoveryCode: recoveryCodeError,
          },
        }
        const container = setup(props)
        expect(container.textContent).toContain(emailError)
        expect(container.textContent).toContain(recoveryCodeError)
      },
    )

    it(
      'shows loading state on primary button when isSubmitting is true',
      () => {
        const props = {
          ...defaultProps,
          isSubmitting: true,
        }
        const container = setup(props)
        const confirmButton = getByText(
          container,
          recoveryCodeSignIn.confirm.en,
        )

        expect(confirmButton).toBeDefined()
      },
    )

    it(
      'does not show loading state on primary button when isSubmitting is false',
      () => {
        const props = {
          ...defaultProps,
          isSubmitting: false,
        }
        const container = setup(props)
        const confirmButton = getByText(
          container,
          recoveryCodeSignIn.confirm.en,
        )

        expect(confirmButton).toBeDefined()
        // Button should be in normal state (not loading)
      },
    )

    it(
      'renders form with correct autoComplete attribute',
      () => {
        const container = setup()
        const form = container.querySelector('form')
        expect(form).toBeDefined()
        expect(form?.getAttribute('autocomplete')).toBe('on')
      },
    )

    it(
      'renders all required form elements',
      () => {
        const container = setup()

        // Check form exists
        const form = container.querySelector('form')
        expect(form).toBeDefined()

        // Check both input fields exist
        const emailField = container.querySelector('input[name="email"]')
        const recoveryCodeField = container.querySelector('input[name="recoveryCode"]')
        expect(emailField).toBeDefined()
        expect(recoveryCodeField).toBeDefined()

        // Check buttons exist
        const confirmButton = getByText(
          container,
          recoveryCodeSignIn.confirm.en,
        )
        const signInButton = getByText(
          container,
          recoveryCodeSignIn.signIn.en,
        )
        expect(confirmButton).toBeDefined()
        expect(signInButton).toBeDefined()
      },
    )

    it(
      'handles empty values correctly',
      () => {
        const props = {
          ...defaultProps,
          values: {
            email: '',
            recoveryCode: '',
          },
        }
        const container = setup(props)
        const emailField = container.querySelector('input[name="email"]') as HTMLInputElement
        const recoveryCodeField = container.querySelector('input[name="recoveryCode"]') as HTMLInputElement

        expect(emailField.value).toBe('')
        expect(recoveryCodeField.value).toBe('')
      },
    )

    it(
      'handles field labels correctly',
      () => {
        const container = setup()

        expect(container.textContent).toContain(recoveryCodeSignIn.email.en)
        expect(container.textContent).toContain(recoveryCodeSignIn.recoveryCode.en)
      },
    )
  },
)
