import {
  getByText, getByLabelText, fireEvent, queryByText,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, vi, beforeEach,
} from 'vitest'
import OtpSetup from './OtpSetup'
import { otpMfa } from 'pages/tools/locale'

// Create a dummy ref for the canvas element
const dummyRef = { current: null } as React.RefObject<HTMLCanvasElement>

describe(
  'OtpSetup Component',
  () => {
    const defaultProps = {
      locale: 'en' as any,
      otpUri: 'dummy-uri',
      qrCodeEl: dummyRef,
      onChange: vi.fn(),
      onVerifyMfa: vi.fn(),
      submitError: null as string | null,
      values: { mfaCode: [] },
      errors: { mfaCode: undefined },
      isVerifyingMfa: false,
    }

    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <OtpSetup {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      defaultProps.onChange.mockReset()
      defaultProps.onVerifyMfa.mockReset()
    })

    it(
      'renders QR code and view title when otpUri is provided',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          otpMfa.setup.en,
        )
        expect(titleElement).toBeDefined()

        const canvasEl = container.querySelector('canvas')
        expect(canvasEl).toBeDefined()
      },
    )

    it(
      'does not render QR code and view title when otpUri is empty',
      () => {
        const props = {
          ...defaultProps, otpUri: '',
        }
        const container = setup(props)

        const titleElement = queryByText(
          container,
          otpMfa.setup.en,
        )
        expect(titleElement).toBeNull()

        const canvasEl = container.querySelector('canvas')
        expect(canvasEl).toBeNull()
      },
    )

    it(
      'renders CodeInput with correct label and calls handleChange when value changes',
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
        expect(defaultProps.onChange).toHaveBeenCalledWith(
          'mfaCode',
          ['1'],
        )
      },
    )

    it(
      'renders submit error message when submitError is provided',
      () => {
        const errorMessage = 'Test Error'
        const props = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'renders primary button with verify text and calls handleMfa when clicked',
      () => {
        const container = setup()
        const primaryButton = getByText(
          container,
          otpMfa.verify.en,
        )
        expect(primaryButton).toBeDefined()

        fireEvent.click(primaryButton)
        expect(defaultProps.onVerifyMfa).toHaveBeenCalledTimes(1)
      },
    )
  },
)
