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
      appBanners: [],
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
      onResetPasskeyInfo: vi.fn(),
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
      'show no unlock email button when passkeyOption is not provided',
      () => {
        const props = {
          ...defaultProps,
          passkeyOption: null as false | PublicKeyCredentialRequestOptionsJSON | null,
        }
        const container = setup(props)

        const unlockButton = container.querySelector('button[aria-label="Edit email"]')
        expect(unlockButton).toBeNull()

        const emailField = container.querySelector('input[name="email"]') as HTMLInputElement
        expect(emailField).not.toBeNull()
        expect(emailField.disabled).toBeFalsy()
      },
    )

    it(
      'triggers onResetPasskeyInfo when the unlock email button is clicked',
      () => {
        const props = {
          ...defaultProps,
          passkeyOption: {
            challenge: 'dummy-challenge',
            allowCredentials: [{ id: 'dummy-id' }],
          } as PublicKeyCredentialRequestOptionsJSON,
        }
        const container = setup(props)

        const emailField = container.querySelector('input[name="email"]') as HTMLInputElement
        expect(emailField).not.toBeNull()
        expect(emailField.disabled).toBeTruthy()

        const unlockButton = container.querySelector('button[aria-label="Edit email"]')
        expect(unlockButton).not.toBeNull()
        if (unlockButton) {
          fireEvent.click(unlockButton)
        }
        // Verify that the onResetPasskeyInfo callback is called.
        expect(props.onResetPasskeyInfo).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'triggers onResetPasskeyInfo when the unlock email button is clicked and passkeyOption is false',
      () => {
        const props = {
          ...defaultProps,
          passkeyOption: false as false | PublicKeyCredentialRequestOptionsJSON | null,
        }
        const container = setup(props)

        const emailField = container.querySelector('input[name="email"]') as HTMLInputElement
        expect(emailField).not.toBeNull()
        expect(emailField.disabled).toBeTruthy()

        const unlockButton = container.querySelector('button[aria-label="Edit email"]')
        expect(unlockButton).not.toBeNull()
        if (unlockButton) {
          fireEvent.click(unlockButton)
        }
        // Verify that the onResetPasskeyInfo callback is called.
        expect(props.onResetPasskeyInfo).toHaveBeenCalledTimes(1)
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

    it(
      'renders recovery code button when allowRecoveryCode is true',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            allowRecoveryCode: true,
          },
        }
        const container = setup(props)

        const recoveryCodeButton = getByText(
          container,
          signIn.recoveryCode.en,
        )
        expect(recoveryCodeButton).toBeDefined()
      },
    )

    it(
      'does not render recovery code button when allowRecoveryCode is false',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            allowRecoveryCode: false,
          },
        }
        const container = setup(props)

        const recoveryCodeButton = container.querySelector(`button[title="${signIn.recoveryCode.en}"]`)
        expect(recoveryCodeButton).toBeNull()
      },
    )

    it(
      'calls onSwitchView with RecoveryCodeSignIn when recovery code button is clicked',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            allowRecoveryCode: true,
          },
        }
        const container = setup(props)

        const recoveryCodeButton = getByText(
          container,
          signIn.recoveryCode.en,
        )
        fireEvent.click(recoveryCodeButton)
        expect(defaultProps.onSwitchView).toHaveBeenCalledWith(View.RecoveryCodeSignIn)
      },
    )

    it(
      'does not render bottom section when all options are disabled',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            enableSignUp: false,
            enablePasswordReset: false,
            allowRecoveryCode: false,
          },
        }
        const container = setup(props)

        const signUpButton = container.querySelector(`button[title="${signIn.signUp.en}"]`)
        const resetPasswordButton = container.querySelector(`button[title="${signIn.passwordReset.en}"]`)
        const recoveryCodeButton = container.querySelector(`button[title="${signIn.recoveryCode.en}"]`)

        expect(signUpButton).toBeNull()
        expect(resetPasswordButton).toBeNull()
        expect(recoveryCodeButton).toBeNull()
      },
    )

    describe(
      'Banner rendering',
      () => {
        it(
          'renders no banners when appBanners array is empty',
          () => {
            const props = {
              ...defaultProps,
              appBanners: [],
            }
            const container = setup(props)

            const banners = container.querySelectorAll('[role="alert"]')
            expect(banners.length).toBe(0)
          },
        )

        it(
          'renders single banner with correct content',
          () => {
            const mockBanner = {
              id: 1,
              type: 'info',
              text: 'Default banner text',
              locales: [
                {
                  locale: 'en', value: 'Welcome to our service!',
                },
                {
                  locale: 'fr', value: 'Bienvenue dans notre service!',
                },
              ],
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z',
              deletedAt: null,
              isActive: true,
            }

            const props = {
              ...defaultProps,
              appBanners: [mockBanner],
            }
            const container = setup(props as any)

            const banners = container.querySelectorAll('[role="alert"]')
            expect(banners.length).toBe(1)
            expect(banners[0].textContent).toContain('Welcome to our service!')
            expect(banners[0].className).toContain('text-blue-500')
          },
        )

        it(
          'renders multiple banners in correct order',
          () => {
            const mockBanners = [
              {
                id: 1,
                type: 'info',
                text: 'Info banner',
                locales: [{
                  locale: 'en', value: 'Information message',
                }],
                createdAt: '2023-01-01T00:00:00Z',
                updatedAt: '2023-01-01T00:00:00Z',
                deletedAt: null,
                isActive: true,
              },
              {
                id: 2,
                type: 'warning',
                text: 'Warning banner',
                locales: [{
                  locale: 'en', value: 'Warning message',
                }],
                createdAt: '2023-01-01T00:00:00Z',
                updatedAt: '2023-01-01T00:00:00Z',
                deletedAt: null,
                isActive: true,
              },
              {
                id: 3,
                type: 'error',
                text: 'Error banner',
                locales: [{
                  locale: 'en', value: 'Error message',
                }],
                createdAt: '2023-01-01T00:00:00Z',
                updatedAt: '2023-01-01T00:00:00Z',
                deletedAt: null,
                isActive: true,
              },
            ]

            const props = {
              ...defaultProps,
              appBanners: mockBanners,
            }
            const container = setup(props as any)

            const banners = container.querySelectorAll('[role="alert"]')
            expect(banners.length).toBe(3)

            // Check order and content
            expect(banners[0].textContent).toContain('Information message')
            expect(banners[0].className).toContain('text-blue-500')

            expect(banners[1].textContent).toContain('Warning message')
            expect(banners[1].className).toContain('text-yellow-500')

            expect(banners[2].textContent).toContain('Error message')
            expect(banners[2].className).toContain('text-red-500')
          },
        )

        it(
          'renders banner with localized content for current locale',
          () => {
            const mockBanner = {
              id: 1,
              type: 'success',
              text: 'Default text',
              locales: [
                {
                  locale: 'en', value: 'English success message',
                },
                {
                  locale: 'fr', value: 'Message de succès en français',
                },
                {
                  locale: 'es', value: 'Mensaje de éxito en español',
                },
              ],
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z',
              deletedAt: null,
              isActive: true,
            }

            const props = {
              ...defaultProps,
              locale: 'fr' as any,
              appBanners: [mockBanner],
            }
            const container = setup(props as any)

            const banner = container.querySelector('[role="alert"]')
            expect(banner).not.toBeNull()
            expect(banner?.textContent).toContain('Message de succès en français')
            expect(banner?.className).toContain('text-green-500')
          },
        )

        it(
          'falls back to default text when locale not found',
          () => {
            const mockBanner = {
              id: 1,
              type: 'info',
              text: 'Default fallback text',
              locales: [
                {
                  locale: 'fr', value: 'Texte en français',
                },
                {
                  locale: 'es', value: 'Texto en español',
                },
              ],
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z',
              deletedAt: null,
              isActive: true,
            }

            const props = {
              ...defaultProps,
              locale: 'en' as any, // English not available in locales
              appBanners: [mockBanner],
            }
            const container = setup(props as any)

            const banner = container.querySelector('[role="alert"]')
            expect(banner).not.toBeNull()
            expect(banner?.textContent).toContain('Default fallback text')
          },
        )

        it(
          'renders banner with empty locales array using default text',
          () => {
            const mockBanner = {
              id: 1,
              type: 'warning',
              text: 'Default warning text',
              locales: [],
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z',
              deletedAt: null,
              isActive: true,
            }

            const props = {
              ...defaultProps,
              appBanners: [mockBanner],
            }
            const container = setup(props as any)

            const banner = container.querySelector('[role="alert"]')
            expect(banner).not.toBeNull()
            expect(banner?.textContent).toContain('Default warning text')
            expect(banner?.className).toContain('text-yellow-500')
          },
        )

        it(
          'renders banners with different types showing correct styling',
          () => {
            const mockBanners = [
              {
                id: 1,
                type: 'info',
                text: 'Info text',
                locales: [{
                  locale: 'en', value: 'Info message',
                }],
                createdAt: '2023-01-01T00:00:00Z',
                updatedAt: '2023-01-01T00:00:00Z',
                deletedAt: null,
                isActive: true,
              },
              {
                id: 2,
                type: 'warning',
                text: 'Warning text',
                locales: [{
                  locale: 'en', value: 'Warning message',
                }],
                createdAt: '2023-01-01T00:00:00Z',
                updatedAt: '2023-01-01T00:00:00Z',
                deletedAt: null,
                isActive: true,
              },
              {
                id: 3,
                type: 'error',
                text: 'Error text',
                locales: [{
                  locale: 'en', value: 'Error message',
                }],
                createdAt: '2023-01-01T00:00:00Z',
                updatedAt: '2023-01-01T00:00:00Z',
                deletedAt: null,
                isActive: true,
              },
              {
                id: 4,
                type: 'success',
                text: 'Success text',
                locales: [{
                  locale: 'en', value: 'Success message',
                }],
                createdAt: '2023-01-01T00:00:00Z',
                updatedAt: '2023-01-01T00:00:00Z',
                deletedAt: null,
                isActive: true,
              },
            ]

            const props = {
              ...defaultProps,
              appBanners: mockBanners,
            }
            const container = setup(props as any)

            const banners = container.querySelectorAll('[role="alert"]')
            expect(banners.length).toBe(4)

            // Check each banner type has correct styling
            expect(banners[0].className).toContain('text-blue-500') // info
            expect(banners[1].className).toContain('text-yellow-500') // warning
            expect(banners[2].className).toContain('text-red-500') // error
            expect(banners[3].className).toContain('text-green-500') // success

            // Check icons are present
            expect(container.querySelector('.lucide-info')).not.toBeNull()
            expect(container.querySelector('.lucide-triangle-alert')).not.toBeNull()
            expect(container.querySelector('.lucide-circle-x')).not.toBeNull()
            expect(container.querySelector('.lucide-circle-check')).not.toBeNull()
          },
        )

        it(
          'renders banner with unknown type without specific styling',
          () => {
            const mockBanner = {
              id: 1,
              type: 'custom-type',
              text: 'Custom banner text',
              locales: [{
                locale: 'en', value: 'Custom message',
              }],
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z',
              deletedAt: null,
              isActive: true,
            }

            const props = {
              ...defaultProps,
              appBanners: [mockBanner],
            }
            const container = setup(props as any)

            const banner = container.querySelector('[role="alert"]')
            expect(banner).not.toBeNull()
            expect(banner?.textContent).toContain('Custom message')

            // Should not have any specific color class
            expect(banner?.className).not.toContain('text-blue-500')
            expect(banner?.className).not.toContain('text-yellow-500')
            expect(banner?.className).not.toContain('text-red-500')
            expect(banner?.className).not.toContain('text-green-500')
          },
        )
      },
    )
  },
)
