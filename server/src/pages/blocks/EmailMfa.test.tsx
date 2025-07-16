import {
  getByText, getByLabelText, fireEvent, createEvent, queryByLabelText,
} from '@testing-library/dom'
import {
  expect, describe, it, beforeEach, vi, beforeAll,
  Mock,
} from 'vitest'
import { render } from 'hono/jsx/dom'
import EmailMfa, { EmailMfaProps } from './EmailMfa'
import { emailMfa } from 'pages/tools/locale'
import { InitialProps } from 'pages/hooks'

// Unit tests for the EmailMfa Component
beforeAll(() => {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault()
    },
  )
})

describe(
  'EmailMfa Component',
  () => {
    const defaultProps: EmailMfaProps = {
      locale: 'en' as any,
      onSubmit: vi.fn(),
      onChange: vi.fn(),
      values: {
        mfaCode: null, rememberDevice: false,
      },
      errors: { mfaCode: undefined },
      submitError: null,
      resent: false,
      sendEmailMfa: vi.fn(),
      isSubmitting: false,
      isSending: false,
      initialProps: { enableMfaRememberDevice: false } as InitialProps,
    }

    const setup = (props: EmailMfaProps = defaultProps) => {
      const container = document.createElement('div')
      render(
        <EmailMfa {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      (defaultProps.onSubmit as Mock).mockReset();
      (defaultProps.onChange as Mock).mockReset();
      (defaultProps.sendEmailMfa as Mock).mockReset()
    })

    it(
      'renders the view title from emailMfa locale',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          emailMfa.title.en,
        )
        expect(titleElement).toBeDefined()
      },
    )

    it(
      'renders SecondaryButton with resend text when not resent',
      () => {
        const container = setup()
        const secondaryButton = getByText(
          container,
          emailMfa.resend.en,
        )
        expect(secondaryButton).toBeDefined()
        expect((secondaryButton as HTMLButtonElement).disabled).toBe(false)
      },
    )

    it(
      'renders SecondaryButton with resent text and disabled when resent is true',
      () => {
        const props: EmailMfaProps = {
          ...defaultProps, resent: true,
        }
        const container = setup(props)
        const secondaryButton = getByText(
          container,
          emailMfa.resent.en,
        )
        expect(secondaryButton).toBeDefined()
        expect((secondaryButton as HTMLButtonElement).disabled).toBe(true)
      },
    )

    it(
      'calls sendEmailMfa with true when SecondaryButton is clicked',
      () => {
        const container = setup()
        const secondaryButton = getByText(
          container,
          emailMfa.resend.en,
        )
        fireEvent.click(secondaryButton)
        expect(defaultProps.sendEmailMfa).toHaveBeenCalledWith(true)
      },
    )

    it(
      'renders CodeInput with the proper label',
      () => {
        const container = setup()
        const codeInputLabel = getByText(
          container,
          emailMfa.code.en,
        )
        expect(codeInputLabel).toBeDefined()
      },
    )

    it(
      'calls handleChange when CodeInput value changes',
      () => {
        const container = setup()
        // Get the first input rendered by CodeInput using its aria-label
        const codeInput = getByLabelText(
          container,
          'Code input 1',
        ) as HTMLInputElement
        fireEvent.input(
          codeInput,
          { target: { value: '1' } },
        )
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'mfaCode',
          ['1'],
        )
      },
    )

    it(
      'calls handleSubmit when the form is submitted',
      () => {
        const container = setup()
        const button = getByText(
          container,
          emailMfa.verify.en,
        )
        expect(button).toBeDefined()
        if (button) {
          fireEvent.click(button)
          expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
        }
      },
    )

    it(
      'renders submit error message if provided',
      () => {
        const errorMessage = 'Invalid code'
        const props: EmailMfaProps = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'renders PrimaryButton with verify text',
      () => {
        const container = setup()
        const primaryButton = getByText(
          container,
          emailMfa.verify.en,
        )
        expect(primaryButton).toBeDefined()
      },
    )

    it(
      'renders error message for mfaCode if provided',
      () => {
        const errorMessage = 'Invalid MFA code'
        const props: EmailMfaProps = {
          ...defaultProps,
          errors: { mfaCode: errorMessage },
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    // Added test: Trigger paste event on CodeInput and verify code update
    it(
      'updates code when paste event is triggered',
      () => {
        const initialCode = ['', '', '', '', '', '']
        const props: EmailMfaProps = {
          ...defaultProps,
          // Provide initial value as six empty strings for the CodeInput
          values: {
            mfaCode: initialCode, rememberDevice: false,
          },
        }
        const container = setup(props)
        // Get the first input element rendered by CodeInput using its aria-label
        const firstInput = getByLabelText(
          container,
          'Code input 1',
        ) as HTMLInputElement
        const pasteValue = '321'
        fireEvent.paste(
          firstInput,
          { clipboardData: { getData: () => pasteValue } },
        )
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'mfaCode',
          ['3', '2', '1', '', '', ''],
        )
      },
    )

    // Added test: Trigger keyDown event on CodeInput to cover onKeyDown functionality for Backspace
    it(
      'calls focus on previous input when Backspace is pressed on an empty input',
      () => {
        const initialCode = ['', '', '', '', '', '']
        const props: EmailMfaProps = {
          ...defaultProps,
          values: {
            mfaCode: initialCode, rememberDevice: false,
          },
        }
        const container = setup(props)
        const secondInput = getByLabelText(
          container,
          'Code input 2',
        ) as HTMLInputElement
        const firstInput = getByLabelText(
          container,
          'Code input 1',
        ) as HTMLInputElement

        const focusSpy = vi.spyOn(
          firstInput,
          'focus',
        )
        fireEvent.keyDown(
          secondInput,
          { key: 'Backspace' },
        )
        expect(focusSpy).toHaveBeenCalled()
        focusSpy.mockRestore()
      },
    )

    // Added test: Cover onKeyDown for ArrowLeft to shift focus to previous input
    it(
      'calls focus on previous input when ArrowLeft is pressed on an input',
      () => {
        const initialCode = ['', '', '', '', '', '']
        const props: EmailMfaProps = {
          ...defaultProps,
          values: {
            mfaCode: initialCode, rememberDevice: false,
          },
        }
        const container = setup(props)
        const secondInput = getByLabelText(
          container,
          'Code input 2',
        ) as HTMLInputElement
        const firstInput = getByLabelText(
          container,
          'Code input 1',
        ) as HTMLInputElement

        const focusSpy = vi.spyOn(
          firstInput,
          'focus',
        )
        fireEvent.keyDown(
          secondInput,
          { key: 'ArrowLeft' },
        )
        expect(focusSpy).toHaveBeenCalled()
        focusSpy.mockRestore()
      },
    )

    // Added test: Cover onKeyDown for ArrowRight to shift focus to next input
    it(
      'calls focus on next input when ArrowRight is pressed on an input',
      () => {
        const initialCode = ['', '', '', '', '', '']
        const props: EmailMfaProps = {
          ...defaultProps,
          values: {
            mfaCode: initialCode, rememberDevice: false,
          },
        }
        const container = setup(props)
        const firstInput = getByLabelText(
          container,
          'Code input 1',
        ) as HTMLInputElement
        const secondInput = getByLabelText(
          container,
          'Code input 2',
        ) as HTMLInputElement

        const focusSpy = vi.spyOn(
          secondInput,
          'focus',
        )
        fireEvent.keyDown(
          firstInput,
          { key: 'ArrowRight' },
        )
        expect(focusSpy).toHaveBeenCalled()
        focusSpy.mockRestore()
      },
    )

    // Added test: Cover onChange event when input value becomes empty (no value)
    it(
      'calls handleChange with empty value when input is cleared',
      () => {
        const initialCode = ['1', '', '', '', '', '']
        const props: EmailMfaProps = {
          ...defaultProps,
          values: {
            mfaCode: initialCode, rememberDevice: false,
          },
        }
        const container = setup(props)
        const firstInput = getByLabelText(
          container,
          'Code input 1',
        ) as HTMLInputElement
        fireEvent.input(
          firstInput,
          { target: { value: '' } },
        )
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'mfaCode',
          ['', '', '', '', '', ''],
        )
      },
    )

    // Added test: Cover onChange event when input value contains multiple digits
    it(
      'calls handleChange with multiple digits when input value contains multiple digits',
      () => {
        const initialCode = ['', '', '', '', '', '']
        const props: EmailMfaProps = {
          ...defaultProps,
          values: {
            mfaCode: initialCode, rememberDevice: false,
          },
        }
        const container = setup(props)
        // Get the first input element rendered by CodeInput using its aria-label
        const firstInput = getByLabelText(
          container,
          'Code input 1',
        ) as HTMLInputElement
        fireEvent.input(
          firstInput,
          { target: { value: '78' } },
        )
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'mfaCode',
          ['7', '8', '', '', '', ''],
        )
      },
    )

    // Added test: Cover onKeyDown for not allowed keys
    it(
      'prevents default behavior when disallowed key is pressed',
      () => {
        const initialCode = ['', '', '', '', '', '']
        const props: EmailMfaProps = {
          ...defaultProps,
          values: {
            mfaCode: initialCode, rememberDevice: false,
          },
        }
        const container = setup(props)
        const firstInput = getByLabelText(
          container,
          'Code input 1',
        ) as HTMLInputElement
        const event = createEvent.keyDown(
          firstInput,
          { key: 'a' },
        )
        const preventDefaultSpy = vi.spyOn(
          event,
          'preventDefault',
        )
        fireEvent(
          firstInput,
          event,
        )
        expect(preventDefaultSpy).toHaveBeenCalled()
      },
    )

    it(
      'renders rememberDevice checkbox when enableMfaRememberDevice is true',
      () => {
        const props: EmailMfaProps = {
          ...defaultProps,
          initialProps: { enableMfaRememberDevice: true } as InitialProps,
        }
        const container = setup(props)
        const rememberDeviceCheckbox = getByLabelText(
          container,
          emailMfa.rememberDevice.en,
        )
        expect(rememberDeviceCheckbox).toBeDefined()
      },
    )

    it(
      'does not render rememberDevice checkbox when enableMfaRememberDevice is false',
      () => {
        const props: EmailMfaProps = {
          ...defaultProps,
          initialProps: { enableMfaRememberDevice: false } as InitialProps,
        }
        const container = setup(props)
        const rememberDeviceCheckbox = queryByLabelText(
          container,
          emailMfa.rememberDevice.en,
        )
        expect(rememberDeviceCheckbox).toBeNull()
      },
    )

    it(
      'calls onChange with rememberDevice when checkbox is toggled',
      () => {
        const props: EmailMfaProps = {
          ...defaultProps,
          initialProps: { enableMfaRememberDevice: true } as InitialProps,
        }
        const container = setup(props)
        const rememberDeviceCheckbox = getByLabelText(
          container,
          emailMfa.rememberDevice.en,
        ) as HTMLInputElement
        fireEvent.click(rememberDeviceCheckbox)
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'rememberDevice',
          true,
        )
      },
    )
  },
)
