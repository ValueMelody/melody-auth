import {
  getByText, fireEvent,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, beforeEach, vi, beforeAll,
} from 'vitest'
import SignIn from './SignIn'
import { signIn } from 'pages/tools/locale'
import {
  InitialProps, View,
} from 'pages/hooks'

beforeAll(() => {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault()
    },
  )
})

describe(
  'SignIn Component',
  () => {
    const defaultProps = {
      locale: 'en' as any,
      handleSubmit: vi.fn((e: Event) => e.preventDefault()),
      handleChange: vi.fn(),
      values: {
        email: '',
        password: '',
      },
      errors: {
        email: undefined,
        password: undefined,
      },
      submitError: null as string | null,
      onSwitchView: vi.fn(),
      initialProps: {
        allowPasskey: true,
        enablePasswordSignIn: true,
        enablePasswordlessSignIn: true,
        googleClientId: 'google-client-id',
        facebookClientId: 'facebook-client-id',
        githubClientId: 'github-client-id',
        enableSignUp: true,
        enablePasswordReset: true,
      } as unknown as InitialProps,
      handleVerifyPasskey: vi.fn(),
      handlePasswordlessSignIn: vi.fn((e: Event) => e.preventDefault()),
      getPasskeyOption: vi.fn(),
      shouldLoadPasskeyInfo: false,
      passkeyOption: null as false | PublicKeyCredentialRequestOptionsJSON | null,
      handleSubmitError: vi.fn(),
      params: { scope: 'openid email profile' } as any,
    }

    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <SignIn {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      defaultProps.handleSubmit.mockReset()
      defaultProps.handleChange.mockReset()
      defaultProps.onSwitchView.mockReset()
      defaultProps.handleVerifyPasskey.mockReset()
      defaultProps.handlePasswordlessSignIn.mockReset()
      defaultProps.getPasskeyOption.mockReset()
      defaultProps.handleSubmitError.mockReset()
    })

    it(
      'renders the title',
      () => {
        const container = setup()
        const title = getByText(
          container,
          signIn.title.en,
        )
        expect(title).toBeDefined()
      },
    )

    it(
      'renders the allowPasskey script tag when allowPasskey is true',
      () => {
        const container = setup()
        const script = container.querySelector('script[src="https://unpkg.com/@simplewebauthn/browser/dist/bundle/index.umd.min.js"]')
        expect(script).toBeDefined()
      },
    )

    it(
      'renders the email input field and calls handleChange on change',
      () => {
        const container = setup()
        const emailField = container.querySelector('input[name="email"]') as HTMLInputElement
        expect(emailField).toBeDefined()
        fireEvent.input(
          emailField,
          { target: { value: 'user@example.com' } },
        )
        expect(defaultProps.handleChange).toHaveBeenCalledWith(
          'email',
          'user@example.com',
        )
      },
    )

    it(
      'renders PrimaryButton with withPasskey title when passkeyOption is provided and calls handleVerifyPasskey on click',
      () => {
        const props = {
          ...defaultProps, passkeyOption: {} as PublicKeyCredentialRequestOptionsJSON,
        }
        const container = setup(props)
        const withPasskeyButton = getByText(
          container,
          signIn.withPasskey.en,
        )
        expect(withPasskeyButton).toBeDefined()
        fireEvent.click(withPasskeyButton)
        expect(defaultProps.handleVerifyPasskey).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'renders the PasswordField when enablePasswordSignIn is true and shouldLoadPasskeyInfo is false and calls handleChange on change',
      () => {
        const container = setup()
        const passwordField = container.querySelector('input[name="password"]') as HTMLInputElement
        expect(passwordField).toBeDefined()
        fireEvent.input(
          passwordField,
          { target: { value: 'password123' } },
        )
        expect(defaultProps.handleChange).toHaveBeenCalledWith(
          'password',
          'password123',
        )
      },
    )

    it(
      'calls getPasskeyOption when shouldLoadPasskeyInfo is true and the continue button is clicked',
      () => {
        const props = {
          ...defaultProps, shouldLoadPasskeyInfo: true,
        }
        const container = setup(props)
        const continueButton = getByText(
          container,
          signIn.continue.en,
        )
        expect(continueButton).toBeDefined()
        fireEvent.click(continueButton)
        expect(defaultProps.getPasskeyOption).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'calls handleSubmit when form is submitted via the submit button click',
      () => {
        const container = setup()
        const submitButton = getByText(
          container,
          signIn.submit.en,
        )
        expect(submitButton).toBeDefined()
        fireEvent.click(submitButton)
        expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'calls handlePasswordlessSignIn when the passwordless continue button is clicked',
      () => {
        const container = setup()
        const passwordlessButton = getByText(
          container,
          signIn.continue.en,
        )
        expect(passwordlessButton).toBeDefined()
        fireEvent.click(passwordlessButton)
        expect(defaultProps.handlePasswordlessSignIn).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'renders the social sign in section when client IDs are provided',
      () => {
        const container = setup()
        const facebookSignIn = container.querySelector('#facebook-login-btn')
        const githubSignIn = container.querySelector('#github-login-btn')
        const googleSignIn = container.querySelector('#g_id_onload')
        expect(facebookSignIn).toBeDefined()
        expect(githubSignIn).toBeDefined()
        expect(googleSignIn).toBeDefined()
      },
    )

    it(
      'renders the submit error message when submitError is provided',
      () => {
        const errorMessage = 'Invalid credentials'
        const props = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'calls onSwitchView with SignUp when the SignUp SecondaryButton is clicked',
      () => {
        const container = setup()
        const signUpButton = getByText(
          container,
          signIn.signUp.en,
        )
        fireEvent.click(signUpButton)
        expect(defaultProps.onSwitchView).toHaveBeenCalledWith(View.SignUp)
      },
    )

    it(
      'calls onSwitchView with ResetPassword when the PasswordReset SecondaryButton is clicked',
      () => {
        const container = setup()
        const passwordResetButton = getByText(
          container,
          signIn.passwordReset.en,
        )
        fireEvent.click(passwordResetButton)
        expect(defaultProps.onSwitchView).toHaveBeenCalledWith(View.ResetPassword)
      },
    )
  },
)
