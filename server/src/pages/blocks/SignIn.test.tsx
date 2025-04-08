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
import * as hooks from 'pages/hooks'
import { Policy } from 'dtos/oauth'

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
      onSubmit: vi.fn((e: Event) => e.preventDefault()),
      onChange: vi.fn(),
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
        enablePasswordlessSignIn: false,
        googleClientId: 'google-client-id',
        facebookClientId: 'facebook-client-id',
        githubClientId: 'github-client-id',
        appleClientId: 'apple-client-id',
        discordClientId: 'discord-client-id',
        enableSignUp: true,
        enablePasswordReset: true,
        oidcProviders: [],
      } as unknown as InitialProps,
      onVerifyPasskey: vi.fn(),
      onPasswordlessSignIn: vi.fn((e: Event) => e.preventDefault()),
      getPasskeyOption: vi.fn(),
      shouldLoadPasskeyInfo: false,
      passkeyOption: null as false | PublicKeyCredentialRequestOptionsJSON | null,
      onSubmitError: vi.fn(),
      isSubmitting: false,
      isSending: false,
      isVerifyingPasskey: false,
      isPasswordlessSigningIn: false,
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
      defaultProps.onSubmit.mockReset()
      defaultProps.onChange.mockReset()
      defaultProps.onSwitchView.mockReset()
      defaultProps.onVerifyPasskey.mockReset()
      defaultProps.onPasswordlessSignIn.mockReset()
      defaultProps.getPasskeyOption.mockReset()
      defaultProps.onSubmitError.mockReset()
      vi.resetAllMocks()
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
      'renders the email input field and calls handleChange on change',
      () => {
        const container = setup()
        const emailField = container.querySelector('input[name="email"]') as HTMLInputElement
        expect(emailField).toBeDefined()
        fireEvent.input(
          emailField,
          { target: { value: 'user@example.com' } },
        )
        expect(defaultProps.onChange).toHaveBeenCalledWith(
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
        expect(defaultProps.onVerifyPasskey).toHaveBeenCalledTimes(1)
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
        expect(defaultProps.onChange).toHaveBeenCalledWith(
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
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'renders the social sign in section when client IDs are provided',
      () => {
        const container = setup()
        const facebookSignIn = container.querySelector('#facebook-login-btn')
        const githubSignIn = container.querySelector('#github-login-btn')
        const googleSignIn = container.querySelector('#g_id_onload')
        const discordSignIn = container.querySelector('#discord-login-btn')
        const appleSignIn = container.querySelector('#apple-login-btn')
        expect(facebookSignIn).not.toBeNull()
        expect(githubSignIn).not.toBeNull()
        expect(googleSignIn).not.toBeNull()
        expect(discordSignIn).not.toBeNull()
        expect(appleSignIn).not.toBeNull()
      },
    )

    it(
      'does not render social sign in section when no client IDs are provided',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            googleClientId: '',
            facebookClientId: '',
            githubClientId: '',
            discordClientId: '',
            appleClientId: '',
          },
        }
        const container = setup(props)

        const facebookSignIn = container.querySelector('#facebook-login-btn')
        const githubSignIn = container.querySelector('#github-login-btn')
        const googleSignIn = container.querySelector('#g_id_onload')
        const discordSignIn = container.querySelector('#discord-login-btn')
        const appleSignIn = container.querySelector('#apple-login-btn')
        expect(facebookSignIn).toBeNull()
        expect(githubSignIn).toBeNull()
        expect(googleSignIn).toBeNull()
        expect(discordSignIn).toBeNull()
        expect(appleSignIn).toBeNull()
      },
    )

    it(
      'renders only google sign in button',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            googleClientId: 'google-id',
            facebookClientId: '',
            githubClientId: '',
            discordClientId: '',
            appleClientId: '',
          },
        }
        const container = setup(props)

        // Google should be present
        const googleSignIn = container.querySelector('#g_id_onload')
        expect(googleSignIn).not.toBeNull()

        // Facebook Github and Discord should not be present
        const facebookSignIn = container.querySelector('#facebook-login-btn')
        const githubSignIn = container.querySelector('#github-login-btn')
        const discordSignIn = container.querySelector('#discord-login-btn')
        const appleSignIn = container.querySelector('#apple-login-btn')
        expect(facebookSignIn).toBeNull()
        expect(githubSignIn).toBeNull()
        expect(discordSignIn).toBeNull()
        expect(appleSignIn).toBeNull()
      },
    )

    it(
      'renders only facebook sign in button',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            googleClientId: '',
            githubClientId: '',
            discordClientId: '',
            appleClientId: '',
          },
        }
        const container = setup(props)

        // Google should not be present
        const googleSignIn = container.querySelector('#g_id_onload')
        expect(googleSignIn).toBeNull()

        // Facebook should be present
        const facebookSignIn = container.querySelector('#facebook-login-btn')
        expect(facebookSignIn).not.toBeNull()

        // Github should not be present
        const githubSignIn = container.querySelector('#github-login-btn')
        expect(githubSignIn).toBeNull()

        // Discord should not be present
        const discordSignIn = container.querySelector('#discord-login-btn')
        expect(discordSignIn).toBeNull()

        // Apple should not be present
        const appleSignIn = container.querySelector('#apple-login-btn')
        expect(appleSignIn).toBeNull()
      },
    )

    it(
      'renders only github sign in button',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            googleClientId: '',
            facebookClientId: '',
            discordClientId: '',
            appleClientId: '',
          },
        }
        const container = setup(props)

        // Google should not be present
        const googleSignIn = container.querySelector('#g_id_onload')
        expect(googleSignIn).toBeNull()

        // Facebook should not be present
        const facebookSignIn = container.querySelector('#facebook-login-btn')
        expect(facebookSignIn).toBeNull()

        // Github should be present
        const githubSignIn = container.querySelector('#github-login-btn')
        expect(githubSignIn).not.toBeNull()

        // Discord should not be present
        const discordSignIn = container.querySelector('#discord-login-btn')
        expect(discordSignIn).toBeNull()

        // Apple should not be present
        const appleSignIn = container.querySelector('#apple-login-btn')
        expect(appleSignIn).toBeNull()
      },
    )

    it(
      'renders only discord sign in button',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            googleClientId: '',
            facebookClientId: '',
            githubClientId: '',
            appleClientId: '',
            discordClientId: 'discord-client-id',
          },
        }
        const container = setup(props)

        // Google should not be present
        const googleSignIn = container.querySelector('#g_id_onload')
        expect(googleSignIn).toBeNull()

        // Facebook should not be present
        const facebookSignIn = container.querySelector('#facebook-login-btn')
        expect(facebookSignIn).toBeNull()

        // Github should not be present
        const githubSignIn = container.querySelector('#github-login-btn')
        expect(githubSignIn).toBeNull()

        // Discord should be present
        const discordSignIn = container.querySelector('#discord-login-btn')
        expect(discordSignIn).not.toBeNull()

        // Apple should not be present
        const appleSignIn = container.querySelector('#apple-login-btn')
        expect(appleSignIn).toBeNull()
      },
    )

    it(
      'renders only apple sign in button',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            googleClientId: '',
            facebookClientId: '',
            githubClientId: '',
            discordClientId: '',
            appleClientId: 'apple-client-id',
          },
        }
        const container = setup(props)

        // Google should not be present
        const googleSignIn = container.querySelector('#g_id_onload')
        expect(googleSignIn).toBeNull()

        // Facebook should not be present
        const facebookSignIn = container.querySelector('#facebook-login-btn')
        expect(facebookSignIn).toBeNull()

        // Github should not be present
        const githubSignIn = container.querySelector('#github-login-btn')
        expect(githubSignIn).toBeNull()

        // Discord should be present
        const discordSignIn = container.querySelector('#discord-login-btn')
        expect(discordSignIn).toBeNull()

        // Apple should be present
        const appleSignIn = container.querySelector('#apple-login-btn')
        expect(appleSignIn).not.toBeNull()
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

    it(
      'renders correctly for passwordless sign in without password field',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            enablePasswordSignIn: false,
            enablePasswordlessSignIn: true,
          },
        }
        const container = setup(props)

        // Should render email field
        const emailField = container.querySelector('input[name="email"]')
        expect(emailField).toBeDefined()

        // Should not render password field
        const passwordField = container.querySelector('input[name="password"]')
        expect(passwordField).toBeNull()

        // Should render continue button instead of submit button
        const submitButton = container.querySelector('button[type="submit"]')
        expect(submitButton).toBeNull()

        const continueButton = getByText(
          container,
          signIn.continue.en,
        )
        expect(continueButton).toBeDefined()
        expect(continueButton.getAttribute('type')).toBe('button')

        // Test continue button click
        fireEvent.click(continueButton)
        expect(defaultProps.onPasswordlessSignIn).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'handles email input in passwordless mode',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            enablePasswordSignIn: false,
            enablePasswordlessSignIn: true,
          },
        }
        const container = setup(props)
        const emailField = container.querySelector('input[name="email"]') as HTMLInputElement
        expect(emailField).toBeDefined()
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
      'does not render SignUp and PasswordReset buttons when both are disabled',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            enableSignUp: false,
            enablePasswordReset: false,
          },
        }
        const container = setup(props)

        const signUpButton = container.querySelector('button[title="Sign Up"]')
        expect(signUpButton).toBeNull()

        const resetPasswordButton = container.querySelector('button[title="Reset Password"]')
        expect(resetPasswordButton).toBeNull()
      },
    )

    it(
      'renders only PasswordReset button when SignUp is disabled',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            enableSignUp: false,
            enablePasswordReset: true,
          },
        }
        const container = setup(props)

        const signUpButton = container.querySelector('button[title="Sign Up"]')
        expect(signUpButton).toBeNull()

        const resetPasswordButton = getByText(
          container,
          signIn.passwordReset.en,
        )
        expect(resetPasswordButton).toBeDefined()
      },
    )

    it(
      'renders only SignUp button when PasswordReset is disabled',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            enableSignUp: true,
            enablePasswordReset: false,
          },
        }
        const container = setup(props)

        const signUpButton = getByText(
          container,
          signIn.signUp.en,
        )
        expect(signUpButton).toBeDefined()

        const resetPasswordButton = container.querySelector('button[title="Reset Password"]')
        expect(resetPasswordButton).toBeNull()
      },
    )

    it(
      'renders OIDC sign in buttons when oidcProviders are provided',
      () => {
        // Mock the useSocialSignIn hook result
        const mockOidcConfigs = [
          {
            name: 'provider1',
            config: {
              authorizeEndpoint: 'https://provider1.com/auth',
              tokenEndpoint: 'https://provider1.com/token',
              jwksEndpoint: 'https://provider1.com/jwks',
              clientId: 'client-id-1',
            },
          },
          {
            name: 'provider2',
            config: {
              authorizeEndpoint: 'https://provider2.com/auth',
              tokenEndpoint: 'https://provider2.com/token',
              jwksEndpoint: 'https://provider2.com/jwks',
              clientId: 'client-id-2',
            },
          },
        ]

        // Mock the useSocialSignIn hook
        vi.spyOn(
          hooks,
          'useSocialSignIn',
        ).mockImplementation(() => ({
          oidcConfigs: mockOidcConfigs,
          oidcCodeVerifier: 'test-code-verifier',
          socialSignInState: {
            state: 'test-state',
            clientId: 'client-id-1',
            redirectUri: 'http://localhost:3000/identity/v1/authorize-oidc/provider1',
            responseType: 'code',
            codeChallenge: 'test-code-challenge',
            codeChallengeMethod: 'S256',
            locale: 'en',
            policy: Policy.SignInOrSignUp,
            org: 'test-org',
            scopes: ['openid', 'email', 'profile'],
          },
          handleGoogleSignIn: vi.fn(),
          handleFacebookSignIn: vi.fn(),
          handleGetOidcConfigs: vi.fn(),
        }))

        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            googleClientId: '',
            facebookClientId: '',
            githubClientId: '',
            discordClientId: '',
            oidcProviders: ['provider1', 'provider2'],
          },
        }
        const container = setup(props)

        // OIDC providers should be present
        const oidcProvider1 = container.querySelector('#oidc-provider1')
        const oidcProvider2 = container.querySelector('#oidc-provider2')
        expect(oidcProvider1).not.toBeNull()
        expect(oidcProvider1?.getAttribute('href')).toContain('redirect_uri=http://localhost:3000/identity/v1/authorize-oidc/provider1')
        expect(oidcProvider1?.getAttribute('href')).toContain('"codeVerifier":"test-code-verifier"')
        expect(oidcProvider2).not.toBeNull()
        expect(oidcProvider2?.getAttribute('href')).toContain('redirect_uri=http://localhost:3000/identity/v1/authorize-oidc/provider2')
        expect(oidcProvider2?.getAttribute('href')).toContain('"codeVerifier":"test-code-verifier"')

        // Other social sign-in buttons should not be present
        const googleSignIn = container.querySelector('#g_id_onload')
        const facebookSignIn = container.querySelector('#facebook-login-btn')
        const githubSignIn = container.querySelector('#github-login-btn')
        const discordSignIn = container.querySelector('#discord-login-btn')
        expect(googleSignIn).toBeNull()
        expect(facebookSignIn).toBeNull()
        expect(githubSignIn).toBeNull()
        expect(discordSignIn).toBeNull()
      },
    )
  },
)
