import {
  getByText, getByLabelText, fireEvent,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, beforeEach, vi, beforeAll,
} from 'vitest'
import SmsMfa from './SmsMfa'
import { smsMfa } from 'pages/tools/locale'
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
  'SmsMfa Component',
  () => {
    const defaultProps = {
      locale: 'en' as any,
      onSwitchView: vi.fn(),
      handleSubmit: vi.fn((e: Event) => e.preventDefault()),
      handleChange: vi.fn(),
      values: {
        phoneNumber: '',
        mfaCode: null as string[] | null,
      },
      errors: {
        phoneNumber: undefined,
        mfaCode: undefined,
      },
      submitError: null as string | null,
      currentNumber: null as string | null,
      countryCode: '+1',
      allowFallbackToEmailMfa: false,
      resent: false,
      handleResend: vi.fn(),
    }

    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <SmsMfa {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      defaultProps.onSwitchView.mockReset()
      defaultProps.handleSubmit.mockReset()
      defaultProps.handleChange.mockReset()
      defaultProps.handleResend.mockReset()
    })

    it(
      'renders SmsMfa title',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          smsMfa.title.en,
        )
        expect(titleElement).toBeDefined()
      },
    )

    it(
      'renders phone field when currentNumber is not provided',
      () => {
        const container = setup({
          ...defaultProps, currentNumber: null,
        })
        const phoneInput = container.querySelector('input[name="phoneNumber"]') as HTMLInputElement
        expect(phoneInput).toBeDefined()
        expect(phoneInput.disabled).toBe(false)
      },
    )

    it(
      'disables phone field when currentNumber is provided',
      () => {
        const currentNumber = '123-456-7890'
        const container = setup({
          ...defaultProps, currentNumber,
        })
        const phoneInput = container.querySelector('input[name="phoneNumber"]') as HTMLInputElement
        expect(phoneInput).toBeDefined()
        expect(phoneInput.disabled).toBe(true)
        expect(phoneInput.value).toBe(currentNumber)
      },
    )

    it(
      'renders extended form when mfaCode is provided',
      () => {
        const container = setup({
          ...defaultProps,
          values: {
            ...defaultProps.values, mfaCode: [''],
          },
        })
        const resendButton = getByText(
          container,
          smsMfa.resend.en,
        )
        expect(resendButton).toBeDefined()
        const codeInput = getByLabelText(
          container,
          'Code input 1',
        ) as HTMLInputElement
        expect(codeInput).toBeDefined()
      },
    )

    it(
      'calls handleSubmit on form submission',
      () => {
        const container = setup()
        const verifyButton = getByText(
          container,
          smsMfa.verify.en,
        )
        expect(verifyButton).toBeDefined()
        fireEvent.click(verifyButton)
        expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'calls handleResend when resend button is clicked in extended form',
      () => {
        const container = setup({
          ...defaultProps,
          values: {
            ...defaultProps.values, mfaCode: [''],
          },
          resent: false,
        })
        const resendButton = getByText(
          container,
          smsMfa.resend.en,
        )
        expect(resendButton).toBeDefined()
        fireEvent.click(resendButton)
        expect(defaultProps.handleResend).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'calls onSwitchView with View.EmailMfa when fallback button is clicked',
      () => {
        const container = setup({
          ...defaultProps, currentNumber: '123-456-7890', allowFallbackToEmailMfa: true,
        })
        const fallbackButton = getByText(
          container,
          smsMfa.switchToEmail.en,
        )
        expect(fallbackButton).toBeDefined()
        fireEvent.click(fallbackButton)
        expect(defaultProps.onSwitchView).toHaveBeenCalledWith(View.EmailMfa)
      },
    )

    it(
      'calls handleChange when phone field value changes',
      () => {
        const container = setup()
        const phoneInput = container.querySelector('input[name="phoneNumber"]') as HTMLInputElement
        expect(phoneInput).toBeDefined()
        fireEvent.input(
          phoneInput,
          { target: { value: '987-654-3210' } },
        )
        expect(defaultProps.handleChange).toHaveBeenCalledWith(
          'phoneNumber',
          '987-654-3210',
        )
      },
    )

    it(
      'calls handleChange when CodeInput value changes in extended form',
      () => {
        const container = setup({
          ...defaultProps,
          values: {
            ...defaultProps.values, mfaCode: [''],
          },
        })
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
        const errorMessage = 'Submission failed'
        const container = setup({
          ...defaultProps, submitError: errorMessage,
        })
        expect(container.textContent).toContain(errorMessage)
      },
    )
  },
)
