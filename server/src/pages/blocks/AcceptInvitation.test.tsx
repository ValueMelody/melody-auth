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
import AcceptInvitation, { AcceptInvitationProps } from './AcceptInvitation'
import { acceptInvitation } from 'pages/tools/locale'

beforeAll(() => {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault()
    },
  )
})

describe(
  'AcceptInvitation Component',
  () => {
    const defaultProps: AcceptInvitationProps = {
      locale: 'en' as any,
      success: false,
      onSubmit: vi.fn(),
      onChange: vi.fn(),
      values: {
        password: '',
        confirmPassword: '',
      },
      errors: {
        password: undefined,
        confirmPassword: undefined,
      },
      submitError: null,
      isSubmitting: false,
      isTokenValid: true,
      signinUrl: null,
    }

    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <AcceptInvitation {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      (defaultProps.onSubmit as Mock).mockReset();
      (defaultProps.onChange as Mock).mockReset()
    })

    it(
      'renders nothing when isTokenValid is null',
      () => {
        const container = setup({
          ...defaultProps, isTokenValid: null,
        })
        expect(container.textContent).toBe('')
      },
    )

    it(
      'renders expired message when isTokenValid is false',
      () => {
        const container = setup({
          ...defaultProps, isTokenValid: false,
        })
        expect(container.textContent).toContain(acceptInvitation.expired.en)
      },
    )

    it(
      'renders title, description, password fields and submit button when isTokenValid is true',
      () => {
        const container = setup()

        const title = getByText(
          container,
          acceptInvitation.title.en,
        )
        expect(title).toBeDefined()

        expect(container.textContent).toContain(acceptInvitation.desc.en)

        const passwordInput = container.querySelector('#form-password')
        expect(passwordInput).toBeDefined()

        const confirmPasswordInput = container.querySelector('#form-confirmPassword')
        expect(confirmPasswordInput).toBeDefined()

        const submitButton = container.querySelector('button[type="submit"]')
        expect(submitButton).toBeDefined()
      },
    )

    it(
      'renders success message when isTokenValid is true and success is true',
      () => {
        const container = setup({
          ...defaultProps, success: true,
        })
        expect(container.textContent).toContain(acceptInvitation.success.en)
      },
    )

    it(
      'renders sign-in link when signinUrl is provided and success is true',
      () => {
        const signinUrl = 'https://example.com/signin'
        const container = setup({
          ...defaultProps,
          success: true,
          signinUrl,
        })

        const link = container.querySelector(`a[href="${signinUrl}"]`)
        expect(link).toBeDefined()
        expect(container.textContent).toContain(acceptInvitation.signIn.en)
      },
    )

    it(
      'does not render sign-in link when signinUrl is null and success is true',
      () => {
        const container = setup({
          ...defaultProps,
          success: true,
          signinUrl: null,
        })
        const link = container.querySelector('a')
        expect(link).toBeNull()
      },
    )

    it(
      'calls onSubmit when submit button is clicked',
      () => {
        const container = setup()
        const submitButton = getByText(
          container,
          acceptInvitation.confirm.en,
        )
        fireEvent.click(submitButton)
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'calls onChange with password when password input changes',
      () => {
        const container = setup()
        const passwordInput = container.querySelector('#form-password')
        expect(passwordInput).toBeDefined()
        fireEvent.input(
          passwordInput!,
          { target: { value: 'Password1!' } },
        )
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'password',
          'Password1!',
        )
      },
    )

    it(
      'calls onChange with confirmPassword when confirm password input changes',
      () => {
        const container = setup()
        const confirmPasswordInput = container.querySelector('#form-confirmPassword')
        expect(confirmPasswordInput).toBeDefined()
        fireEvent.input(
          confirmPasswordInput!,
          { target: { value: 'Password1!' } },
        )
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'confirmPassword',
          'Password1!',
        )
      },
    )

    it(
      'displays submit error when submitError is provided',
      () => {
        const errorMessage = 'Invitation error'
        const container = setup({
          ...defaultProps, submitError: errorMessage,
        })
        expect(container.textContent).toContain(errorMessage)
      },
    )
  },
)
