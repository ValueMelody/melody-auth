import {
  getByText, getByLabelText, fireEvent,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, beforeEach, vi, beforeAll,
} from 'vitest'
import VerifyEmail from './VerifyEmail'
import { verifyEmail } from 'pages/tools/locale'

beforeAll(() => {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault()
    },
  )
})

describe(
  'VerifyEmail Component',
  () => {
    const defaultProps = {
      success: false,
      locale: 'en' as any,
      onSubmit: vi.fn(),
      onChange: vi.fn(),
      values: { mfaCode: [''] },
      errors: { mfaCode: undefined },
      submitError: null as string | null,
      isSubmitting: false,
    }

    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <VerifyEmail {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      defaultProps.onSubmit.mockReset()
      defaultProps.onChange.mockReset()
    })

    it(
      'renders success message when success is true',
      () => {
        const props = {
          ...defaultProps, success: true,
        }
        const container = setup(props)
        const successMessage = getByText(
          container,
          verifyEmail.success.en,
        )
        expect(successMessage).toBeDefined()
      },
    )

    it(
      'renders title, description, CodeInput and verify button when not successful',
      () => {
        const container = setup()
        const title = getByText(
          container,
          verifyEmail.title.en,
        )
        expect(title).toBeDefined()

        const description = getByText(
          container,
          verifyEmail.desc.en,
        )
        expect(description).toBeDefined()

        // Assume CodeInput renders an input with aria-label 'Code input 1'
        const codeInput = getByLabelText(
          container,
          'Code input 1',
        ) as HTMLInputElement
        expect(codeInput).toBeDefined()

        const verifyButton = getByText(
          container,
          verifyEmail.verify.en,
        )
        expect(verifyButton).toBeDefined()
      },
    )

    it(
      'calls handleSubmit when verify button is clicked',
      () => {
        const container = setup()
        const verifyButton = getByText(
          container,
          verifyEmail.verify.en,
        )
        fireEvent.click(verifyButton)
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
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
        const errorMessage = 'Submission failed'
        const container = setup({
          ...defaultProps, submitError: errorMessage,
        })
        expect(container.textContent).toContain(errorMessage)
      },
    )
  },
)
