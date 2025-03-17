import {
  getByText, getByLabelText, fireEvent, queryByText,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, vi, beforeEach,
} from 'vitest'
import OtpMfa from './OtpMfa'
import { otpMfa } from 'pages/tools/locale'
import { View } from 'pages/hooks'

describe(
  'OtpMfa Component',
  () => {
    const defaultProps = {
      locale: 'en' as any,
      handleChange: vi.fn(),
      handleMfa: vi.fn(),
      submitError: null as string | null,
      allowFallbackToEmailMfa: true,
      onSwitchView: vi.fn(),
      values: { mfaCode: [] },
      errors: { mfaCode: undefined },
    }

    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <OtpMfa {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      defaultProps.handleChange.mockReset()
      defaultProps.handleMfa.mockReset()
      defaultProps.onSwitchView.mockReset()
    })

    it(
      'renders view title with otpMfa code text',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          otpMfa.code.en,
        )
        expect(titleElement).toBeDefined()
      },
    )

    it(
      'renders primary button with otpMfa verify text',
      () => {
        const container = setup()
        const primaryButton = getByText(
          container,
          otpMfa.verify.en,
        )
        expect(primaryButton).toBeDefined()
      },
    )

    it(
      'calls handleMfa when primary button is clicked',
      () => {
        const container = setup()
        const primaryButton = getByText(
          container,
          otpMfa.verify.en,
        )
        fireEvent.click(primaryButton)
        expect(defaultProps.handleMfa).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'calls onSwitchView with View.EmailMfa when secondary button is clicked and fallback is allowed',
      () => {
        const container = setup()
        const secondaryButton = getByText(
          container,
          otpMfa.switchToEmail.en,
        )
        expect(secondaryButton).toBeDefined()
        fireEvent.click(secondaryButton)
        expect(defaultProps.onSwitchView).toHaveBeenCalledWith(View.EmailMfa)
      },
    )

    it(
      'does not render fallback secondary button when allowFallbackToEmailMfa is false',
      () => {
        const props = {
          ...defaultProps, allowFallbackToEmailMfa: false,
        }
        const container = setup(props)
        const secondaryButton = queryByText(
          container,
          otpMfa.switchToEmail.en,
        )
        expect(secondaryButton).toBeNull()
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
        const errorMessage = 'Invalid MFA Code'
        const props = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )
  },
)
