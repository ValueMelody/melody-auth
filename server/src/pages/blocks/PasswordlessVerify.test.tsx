import {
  getByText, getByLabelText, fireEvent,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, vi, beforeEach, beforeAll,
  Mock,
} from 'vitest'
import PasswordlessVerify, { PasswordlessVerifyProps } from './PasswordlessVerify'
import { passwordlessCode } from 'pages/tools/locale'

beforeAll(() => {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault()
    },
  )
})

describe(
  'PasswordlessVerify Component',
  () => {
    const defaultProps: PasswordlessVerifyProps = {
      locale: 'en' as any,
      handleSubmit: vi.fn(),
      handleChange: vi.fn(),
      resent: false,
      values: { mfaCode: [] },
      errors: { mfaCode: undefined },
      submitError: null,
      sendPasswordlessCode: vi.fn(),
    }

    const setup = (props: PasswordlessVerifyProps = defaultProps) => {
      const container = document.createElement('div')
      render(
        <PasswordlessVerify {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      (defaultProps.handleSubmit as Mock).mockReset();
      (defaultProps.handleChange as Mock).mockReset();
      (defaultProps.sendPasswordlessCode as Mock).mockReset()
    })

    it(
      'renders view title correctly',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          passwordlessCode.title.en,
        )
        expect(titleElement).toBeDefined()
      },
    )

    it(
      'calls handleSubmit on form submission',
      () => {
        const container = setup()
        const button = getByText(
          container,
          passwordlessCode.verify.en,
        )
        expect(button).toBeDefined()
        fireEvent.click(button)
        expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'renders secondary button with resend text when resent is false and triggers sendPasswordlessCode on click',
      () => {
        const props = {
          ...defaultProps, resent: false,
        }
        const container = setup(props)
        const secondaryButton = getByText(
          container,
          passwordlessCode.resend.en,
        )
        expect(secondaryButton).toBeDefined()
        expect((secondaryButton as HTMLFormElement).disabled).toBe(false)
        fireEvent.click(secondaryButton)
        expect(defaultProps.sendPasswordlessCode).toHaveBeenCalledWith(true)
      },
    )

    it(
      'renders secondary button with resent text when resent is true and is disabled',
      () => {
        const props = {
          ...defaultProps, resent: true,
        }
        const container = setup(props)
        const secondaryButton = getByText(
          container,
          passwordlessCode.resent.en,
        )
        expect(secondaryButton).toBeDefined()
        expect((secondaryButton as HTMLButtonElement).disabled).toBe(true)
      },
    )

    it(
      'calls handleChange when CodeInput value changes',
      () => {
        const container = setup()
        const codeInput = getByLabelText(
          container,
          'Code input 1',
        ) as HTMLInputElement
        expect(codeInput).toBeDefined()
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
      'renders submit error message when submitError is provided',
      () => {
        const errorMessage = 'Invalid code'
        const props = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'renders primary button with verify text',
      () => {
        const container = setup()
        const primaryButton = getByText(
          container,
          passwordlessCode.verify.en,
        )
        expect(primaryButton).toBeDefined()
      },
    )
  },
)
