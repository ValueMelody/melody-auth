import {
  getByText, fireEvent,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, beforeEach, vi, beforeAll,
} from 'vitest'
import UpdateInfo from './UpdateInfo'
import { updateInfo } from 'pages/tools/locale'

beforeAll(() => {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault()
    },
  )
})

describe(
  'UpdateInfo Component',
  () => {
    const defaultProps = {
      success: false,
      locale: 'en' as any,
      handleSubmit: vi.fn((e: Event) => e.preventDefault()),
      handleChange: vi.fn(),
      values: {
        firstName: '',
        lastName: '',
      },
      errors: {
        firstName: undefined,
        lastName: undefined,
      },
      submitError: null as string | null,
      redirectUri: 'https://example.com',
    }

    const setup = (props = defaultProps) => {
      const container = document.createElement('div')
      render(
        <UpdateInfo {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      defaultProps.handleSubmit.mockReset()
      defaultProps.handleChange.mockReset()
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
          updateInfo.success.en,
        )
        expect(successMessage).toBeDefined()
      },
    )

    it(
      'renders title, form fields and redirect link',
      () => {
        const container = setup()
        const title = getByText(
          container,
          updateInfo.title.en,
        )
        expect(title).toBeDefined()

        const firstNameInput = container.querySelector('input[name="firstName"]') as HTMLInputElement
        expect(firstNameInput).toBeDefined()

        const lastNameInput = container.querySelector('input[name="lastName"]') as HTMLInputElement
        expect(lastNameInput).toBeDefined()

        const confirmButton = getByText(
          container,
          updateInfo.confirm.en,
        )
        expect(confirmButton).toBeDefined()

        const redirectLink = getByText(
          container,
          updateInfo.redirect.en,
        )
        expect(redirectLink).toBeDefined()
        expect(redirectLink.closest('a')?.getAttribute('href')).toBe(defaultProps.redirectUri)
      },
    )

    it(
      'calls handleSubmit when PrimaryButton is clicked',
      () => {
        const container = setup()
        const confirmButton = getByText(
          container,
          updateInfo.confirm.en,
        )
        fireEvent.click(confirmButton)
        expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'calls handleChange when firstName and lastName fields change',
      () => {
        const container = setup()
        const firstNameInput = container.querySelector('input[name="firstName"]') as HTMLInputElement
        const lastNameInput = container.querySelector('input[name="lastName"]') as HTMLInputElement

        fireEvent.input(
          firstNameInput,
          { target: { value: 'John' } },
        )
        expect(defaultProps.handleChange).toHaveBeenCalledWith(
          'firstName',
          'John',
        )

        fireEvent.input(
          lastNameInput,
          { target: { value: 'Doe' } },
        )
        expect(defaultProps.handleChange).toHaveBeenCalledWith(
          'lastName',
          'Doe',
        )
      },
    )

    it(
      'renders submit error message when submitError is provided',
      () => {
        const errorMessage = 'Error occurred'
        const container = setup({
          ...defaultProps, submitError: errorMessage,
        })
        expect(container.textContent).toContain(errorMessage)
      },
    )
  },
)
