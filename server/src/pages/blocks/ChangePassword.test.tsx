import {
  getByText, fireEvent,
} from '@testing-library/dom'
import {
  expect,
  describe,
  it,
  vi,
  beforeEach,
  beforeAll,
  Mock,
} from 'vitest'
import { render } from 'hono/jsx/dom'
import ChangePassword, { ChangePasswordProps } from './ChangePassword'
import { changePassword } from 'pages/tools/locale'

beforeAll(() => {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault()
    },
  )
})

describe(
  'ChangePassword Component',
  () => {
    const defaultProps: ChangePasswordProps = {
      locale: 'en' as any,
      success: false,
      handleSubmit: vi.fn((e) => e.preventDefault()),
      handleChange: vi.fn(),
      values: {
        password: '',
        confirmPassword: '',
      },
      errors: {
        password: undefined,
        confirmPassword: undefined,
      },
      submitError: null,
      redirectUri: '/login',
    }

    // Setup function to render ChangePassword and return a container element.
    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <ChangePassword {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      (defaultProps.handleSubmit as Mock).mockReset();
      (defaultProps.handleChange as Mock).mockReset()
    })

    it(
      'renders form elements correctly',
      () => {
        const container = setup()

        const passwordInput = container.querySelector('#form-password')
        const confirmPasswordInput = container.querySelector('#form-confirmPassword')
        expect(passwordInput).toBeDefined()
        expect(confirmPasswordInput).toBeDefined()

        // Check if form exists
        const formElement = container.querySelector('form')
        expect(formElement).toBeDefined()

        // Check if submit button exists (assuming PrimaryButton renders a button element)
        const submitButton = container.querySelector('button[type="submit"]')
        expect(submitButton).toBeDefined()

        // Check redirect link exists
        const redirectLink = container.querySelector('a[href="/login"]')
        expect(redirectLink).toBeDefined()
      },
    )

    it(
      'displays success message when success prop is true',
      () => {
        const props = {
          ...defaultProps, success: true,
        }
        const container = setup(props)

        const successMessage = changePassword.success.en
        const successElement = getByText(
          container,
          successMessage,
        )
        expect(successElement).toBeDefined()
      },
    )

    it(
      'displays submit error message when submitError is provided',
      () => {
        const errorMessage = 'Invalid passwords'
        const props = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)

        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'redirect link has correct href and text',
      () => {
        const container = setup()

        const redirectLink = container.querySelector('a')
        expect(redirectLink).toBeDefined()
        expect(redirectLink?.getAttribute('href')).toBe(defaultProps.redirectUri)
        // Check that the link text is not empty
        expect(redirectLink?.textContent?.trim().length).toBeGreaterThan(0)
      },
    )

    it(
      'calls handleSubmit when submit button is clicked',
      () => {
        const container = setup()

        const submitButton = getByText(
          container,
          changePassword.confirm.en,
        )
        expect(submitButton).toBeDefined()

        if (submitButton) {
          fireEvent.click(submitButton)
          expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1)
        }
      },
    )

    it(
      'calls handleChange when password input changes',
      () => {
        const container = setup()

        // Simulate change on the password input; assuming input has id 'form-password'
        const passwordInput = container.querySelector('#form-password')
        expect(passwordInput).toBeDefined()
        if (passwordInput) {
          fireEvent.input(
            passwordInput,
            { target: { value: 'newpassword' } },
          )
          expect(defaultProps.handleChange).toHaveBeenCalledWith(
            'password',
            'newpassword',
          )
        }
      },
    )

    it(
      'calls handleChange when confirm password input changes',
      () => {
        const container = setup()

        // Simulate change on confirm password input; assuming input has id 'form-confirmPassword'
        const confirmPasswordInput = container.querySelector('#form-confirmPassword')
        expect(confirmPasswordInput).toBeDefined()
        if (confirmPasswordInput) {
          fireEvent.input(
            confirmPasswordInput,
            { target: { value: 'newpassword' } },
          )
          expect(defaultProps.handleChange).toHaveBeenCalledWith(
            'confirmPassword',
            'newpassword',
          )
        }
      },
    )
  },
)
