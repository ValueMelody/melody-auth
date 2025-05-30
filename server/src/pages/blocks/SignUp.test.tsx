import {
  getByText, fireEvent, waitFor,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, beforeEach, vi, beforeAll,
} from 'vitest'
import SignUp from './SignUp'
import { signUp } from 'pages/tools/locale'
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
  'SignUp Component',
  () => {
    const defaultProps = {
      locale: 'en' as any,
      onSubmit: vi.fn((e: Event) => e.preventDefault()),
      onChange: vi.fn(),
      values: {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
      },
      errors: {
        email: undefined,
        password: undefined,
        confirmPassword: undefined,
        firstName: undefined,
        lastName: undefined,
      },
      userAttributes: [],
      isSubmitting: false,
      submitError: null as string | null,
      onSwitchView: vi.fn(),
      initialProps: {
        enableNames: true,
        namesIsRequired: true,
        termsLink: 'https://terms.example.com',
        privacyPolicyLink: 'https://privacy.example.com',
      } as unknown as InitialProps,
    }

    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <SignUp {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      defaultProps.onSubmit.mockReset()
      defaultProps.onChange.mockReset()
      defaultProps.onSwitchView.mockReset()
    })

    it(
      'renders the title',
      () => {
        const container = setup()
        const title = getByText(
          container,
          signUp.title.en,
        )
        expect(title).toBeDefined()
      },
    )

    it(
      'renders email, password, and confirm password fields',
      () => {
        const container = setup()
        const emailField = container.querySelector('input[name="email"]')
        expect(emailField).toBeDefined()

        const passwordField = container.querySelector('input[name="password"]')
        expect(passwordField).toBeDefined()

        const confirmPasswordField = container.querySelector('input[name="confirmPassword"]')
        expect(confirmPasswordField).toBeDefined()
      },
    )

    it(
      'renders firstName and lastName fields when enableNames is true',
      () => {
        const container = setup()
        const firstNameField = container.querySelector('input[name="firstName"]')
        expect(firstNameField).toBeDefined()

        const lastNameField = container.querySelector('input[name="lastName"]')
        expect(lastNameField).toBeDefined()
      },
    )

    it(
      'does not render firstName and lastName fields when enableNames is false',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps, enableNames: false,
          },
        }
        const container = setup(props)
        const firstNameField = container.querySelector('input[name="firstName"]')
        expect(firstNameField).toBeNull()

        const lastNameField = container.querySelector('input[name="lastName"]')
        expect(lastNameField).toBeNull()
      },
    )

    it(
      'calls handleChange when input fields change',
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

        const passwordField = container.querySelector('input[name="password"]') as HTMLInputElement
        fireEvent.input(
          passwordField,
          { target: { value: '123456' } },
        )
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'password',
          '123456',
        )

        const confirmPasswordField = container.querySelector('input[name="confirmPassword"]') as HTMLInputElement
        fireEvent.input(
          confirmPasswordField,
          { target: { value: '123456' } },
        )
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'confirmPassword',
          '123456',
        )

        if (defaultProps.initialProps.enableNames) {
          const firstNameField = container.querySelector('input[name="firstName"]') as HTMLInputElement
          fireEvent.input(
            firstNameField,
            { target: { value: 'John' } },
          )
          expect(defaultProps.onChange).toHaveBeenCalledWith(
            'firstName',
            'John',
          )

          const lastNameField = container.querySelector('input[name="lastName"]') as HTMLInputElement
          fireEvent.input(
            lastNameField,
            { target: { value: 'Doe' } },
          )
          expect(defaultProps.onChange).toHaveBeenCalledWith(
            'lastName',
            'Doe',
          )
        }
      },
    )

    it(
      'calls handleSubmit when PrimaryButton is clicked',
      () => {
        const container = setup()
        const signUpButton = getByText(
          container,
          signUp.signUp.en,
        )
        fireEvent.click(signUpButton)
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'renders submit error message when submitError is provided',
      () => {
        const errorMessage = 'Sign up failed'
        const props = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'calls onSwitchView with SignIn when SecondaryButton is clicked',
      () => {
        const container = setup()
        const signInButton = getByText(
          container,
          signUp.signIn.en,
        )
        fireEvent.click(signInButton)
        expect(defaultProps.onSwitchView).toHaveBeenCalledWith(View.SignIn)
      },
    )

    it(
      'renders terms and privacy policy links when provided',
      () => {
        const container = setup()
        const termsLink = container.querySelector('a[href="https://terms.example.com"]')
        expect(termsLink).toBeDefined()
        const privacyLink = container.querySelector('a[href="https://privacy.example.com"]')
        expect(privacyLink).toBeDefined()
        expect(container.textContent).toContain(signUp.linkConnect.en)
      },
    )

    it(
      'does not render terms and privacy section when both links are missing',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            termsLink: '',
            privacyPolicyLink: '',
          },
        }
        const container = setup(props)

        const termsLink = container.querySelector('a[href*="terms"]')
        expect(termsLink).toBeNull()
        const privacyLink = container.querySelector('a[href*="privacy"]')
        expect(privacyLink).toBeNull()

        expect(container.textContent).not.toContain(signUp.bySignUp.en)
        expect(container.textContent).not.toContain(signUp.linkConnect.en)
      },
    )

    it(
      'renders only terms link when privacy policy link is missing',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            termsLink: 'https://terms.example.com',
            privacyPolicyLink: '',
          },
        }
        const container = setup(props)

        const termsLink = container.querySelector('a[href="https://terms.example.com"]')
        expect(termsLink).toBeDefined()
        expect(termsLink?.textContent).toBe(signUp.terms.en)

        const privacyLink = container.querySelector('a[href*="privacy"]')
        expect(privacyLink).toBeNull()

        expect(container.textContent).not.toContain(signUp.linkConnect.en)
      },
    )

    it(
      'renders only privacy policy link when terms link is missing',
      () => {
        const props = {
          ...defaultProps,
          initialProps: {
            ...defaultProps.initialProps,
            termsLink: '',
            privacyPolicyLink: 'https://privacy.example.com',
          },
        }
        const container = setup(props)

        const privacyLink = container.querySelector('a[href="https://privacy.example.com"]')
        expect(privacyLink).toBeDefined()
        expect(privacyLink?.textContent).toBe(signUp.privacyPolicy.en)

        const termsLink = container.querySelector('a[href*="terms"]')
        expect(termsLink).toBeNull()

        expect(container.textContent).not.toContain(signUp.linkConnect.en)
      },
    )

    it(
      'displays email error message when errors.email is provided',
      () => {
        const errorMessage = 'Invalid email address'
        const props = {
          ...defaultProps,
          errors: {
            ...defaultProps.errors,
            email: errorMessage as unknown as undefined,
          },
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'toggles password visibility when eye icon is clicked',
      async () => {
        const container = setup()
        // Get the password field section; PasswordField sets its section id to `${name}-row`
        const passwordRow = container.querySelector('#password-row') as HTMLElement
        expect(passwordRow).toBeDefined()

        // Get the password input element by its name attribute
        const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement
        expect(passwordInput).toBeDefined()

        // Initially, the password should be hidden (type "password")
        expect(passwordInput.type).toBe('password')

        // Initially, the toggle button (EyeSlashIconButton) is rendered with aria-label "Show password"
        const toggleButton = passwordRow.querySelector('button[aria-label="Show password"]') as HTMLButtonElement
        expect(toggleButton).toBeDefined()

        // Click the toggle button to show the password
        fireEvent.click(toggleButton)

        // Wait for the state update and DOM re-render
        await waitFor(() => {
          expect(passwordInput.type).toBe('text')
        })

        // Now, the toggle button should change to one with aria-label "Hide password"
        const toggleButtonAfter = passwordRow.querySelector('button[aria-label="Hide password"]') as HTMLButtonElement
        expect(toggleButtonAfter).toBeDefined()

        // Click the button again to hide the password
        fireEvent.click(toggleButtonAfter)

        await waitFor(() => {
          expect(passwordInput.type).toBe('password')
        })
      },
    )

    describe(
      'userAttributes',
      () => {
        it(
          'renders userAttribute fields when userAttributes are provided',
          () => {
            const mockUserAttributes = [
              {
                id: 1,
                name: 'department',
                requiredInSignUpForm: true,
                locales: [
                  {
                    locale: 'en', value: 'Department',
                  },
                  {
                    locale: 'es', value: 'Departamento',
                  },
                ],
              },
              {
                id: 2,
                name: 'phone',
                requiredInSignUpForm: false,
                locales: [
                  {
                    locale: 'en', value: 'Phone Number',
                  },
                ],
              },
            ]

            const props = {
              ...defaultProps,
              userAttributes: mockUserAttributes,
              values: {
                ...defaultProps.values,
                1: '',
                2: '',
              },
              errors: {
                ...defaultProps.errors,
                1: undefined,
                2: undefined,
              },
            }

            const container = setup(props as any)

            const departmentField = container.querySelector('input[name="department"]')
            expect(departmentField).toBeDefined()
            const requiredIndicator = container.querySelector('#required-department')
            expect(requiredIndicator).not.toBeNull()

            const phoneField = container.querySelector('input[name="phone"]')
            expect(phoneField).toBeDefined()
            const requiredIndicator2 = container.querySelector('#required-phone')
            expect(requiredIndicator2).toBeNull()

            // Check labels are displayed correctly
            expect(container.textContent).toContain('Department')
            expect(container.textContent).toContain('Phone Number')
          },
        )

        it(
          'does not render userAttribute fields when userAttributes array is empty',
          () => {
            const props = {
              ...defaultProps,
              userAttributes: [],
            }

            const container = setup(props)

            // Only standard fields should be present
            const allInputs = container.querySelectorAll('input')
            const inputNames = Array.from(allInputs).map((input) => input.getAttribute('name'))

            expect(inputNames).toContain('email')
            expect(inputNames).toContain('password')
            expect(inputNames).toContain('confirmPassword')
            expect(inputNames).toContain('firstName')
            expect(inputNames).toContain('lastName')

            // Should not contain any custom attribute fields
            expect(inputNames.length).toBe(5) // email, password, confirmPassword, firstName, lastName
          },
        )

        it(
          'uses fallback name when locale is not found in userAttribute locales',
          () => {
            const mockUserAttributes = [
              {
                id: 3,
                name: 'customField',
                requiredInSignUpForm: true,
                locales: [
                  {
                    locale: 'fr', value: 'Champ Personnalisé',
                  },
                ],
              },
            ]

            const props = {
              ...defaultProps,
              locale: 'en' as any, // English locale, but attribute only has French
              userAttributes: mockUserAttributes,
              values: {
                ...defaultProps.values,
                3: '',
              },
              errors: {
                ...defaultProps.errors,
                3: undefined,
              },
            }

            const container = setup(props as any)

            // Should fall back to the attribute name since 'en' locale is not found
            expect(container.textContent).toContain('customField')
            expect(container.textContent).not.toContain('Champ Personnalisé')
          },
        )

        it(
          'calls onChange with correct attribute id when userAttribute field changes',
          () => {
            const mockUserAttributes = [
              {
                id: 4,
                name: 'company',
                requiredInSignUpForm: true,
                locales: [
                  {
                    locale: 'en', value: 'Company',
                  },
                ],
              },
            ]

            const props = {
              ...defaultProps,
              userAttributes: mockUserAttributes,
              values: {
                ...defaultProps.values,
                4: '',
              },
              errors: {
                ...defaultProps.errors,
                4: undefined,
              },
            }

            const container = setup(props as any)

            const companyField = container.querySelector('input[name="company"]') as HTMLInputElement
            expect(companyField).toBeDefined()

            fireEvent.input(
              companyField,
              { target: { value: 'Acme Corp' } },
            )

            expect(defaultProps.onChange).toHaveBeenCalledWith(
              4,
              'Acme Corp',
            )
          },
        )

        it(
          'displays userAttribute error message when error is provided',
          () => {
            const errorMessage = 'Department is required'
            const mockUserAttributes = [
              {
                id: 5,
                name: 'department',
                requiredInSignUpForm: true,
                locales: [
                  {
                    locale: 'en', value: 'Department',
                  },
                ],
              },
            ]

            const props = {
              ...defaultProps,
              userAttributes: mockUserAttributes,
              values: {
                ...defaultProps.values,
                5: '',
              },
              errors: {
                ...defaultProps.errors,
                5: errorMessage,
              },
            }

            const container = setup(props as any)
            expect(container.textContent).toContain(errorMessage)
          },
        )

        it(
          'renders userAttribute fields with correct values',
          () => {
            const mockUserAttributes = [
              {
                id: 6,
                name: 'position',
                requiredInSignUpForm: false,
                locales: [
                  {
                    locale: 'en', value: 'Position',
                  },
                ],
              },
            ]

            const props = {
              ...defaultProps,
              userAttributes: mockUserAttributes,
              values: {
                ...defaultProps.values,
                6: 'Software Engineer',
              },
              errors: {
                ...defaultProps.errors,
                6: undefined,
              },
            }

            const container = setup(props as any)

            const positionField = container.querySelector('input[name="position"]') as HTMLInputElement
            expect(positionField).toBeDefined()
            expect(positionField.value).toBe('Software Engineer')
          },
        )
      },
    )
  },
)
