import {
  getByText, fireEvent,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, vi, beforeEach,
  Mock,
} from 'vitest'
import ManagePasskey, { ManagePasskeyProps } from './ManagePasskey'
import { managePasskey } from 'pages/tools/locale'

// Fake passkey record to simulate an enrolled passkey
const fakePasskey = {
  credentialId: 'abc123',
  counter: 42,
  id: 123,
  userId: 456,
  publicKey: '789',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  type: 'passkey',
  status: 'active',
}

describe(
  'ManagePasskey Component',
  () => {
    const defaultProps: ManagePasskeyProps = {
      locale: 'en' as any,
      successMessage: null,
      passkey: fakePasskey,
      onRemove: vi.fn(),
      onEnroll: vi.fn(),
      submitError: null,
      redirectUri: '/dashboard',
      isRemoving: false,
      isEnrolling: false,
    }

    const setup = (props: ManagePasskeyProps = defaultProps) => {
      const container = document.createElement('div')
      render(
        <ManagePasskey {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      (defaultProps.onRemove as Mock).mockReset();
      (defaultProps.onEnroll as Mock).mockReset()
    })

    it(
      'renders success message when provided',
      () => {
        const props = {
          ...defaultProps, successMessage: 'Operation Successful',
        }
        const container = setup(props)
        const successMessageElement = getByText(
          container,
          'Operation Successful',
        )
        expect(successMessageElement).toBeDefined()
      },
    )

    it(
      'renders passkey details and remove button when passkey is provided',
      () => {
        const container = setup(defaultProps)

        // Verify passkey credentialId and counter rendering
        const credentialIdElement = container.querySelector('#passkey-credential-id')
        expect(credentialIdElement).toBeDefined()
        expect(credentialIdElement!.textContent).toContain(fakePasskey.credentialId)

        const counterElement = container.querySelector('#passkey-counter')
        expect(counterElement).toBeDefined()
        expect(counterElement!.textContent).toContain(String(fakePasskey.counter))

        // Verify remove button using the locale text
        const removeButton = getByText(
          container,
          managePasskey.remove.en,
        )
        expect(removeButton).toBeDefined()

        fireEvent.click(removeButton)
        expect(defaultProps.onRemove).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'renders enroll view when passkey is not provided',
      () => {
        const props = {
          ...defaultProps, passkey: null,
        }
        const container = setup(props)

        // Check that no passkey text is rendered
        const noPasskeyElement = getByText(
          container,
          managePasskey.noPasskey.en,
        )
        expect(noPasskeyElement).toBeDefined()

        // Check enroll button is rendered
        const enrollButton = getByText(
          container,
          managePasskey.enroll.en,
        )
        expect(enrollButton).toBeDefined()

        fireEvent.click(enrollButton)
        expect(defaultProps.onEnroll).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'renders submit error message when submitError is provided',
      () => {
        const errorMessage = 'Error occurred'
        const props = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'renders redirect link with correct href and text',
      () => {
        const container = setup(defaultProps)
        const redirectLink = container.querySelector('a[href="/dashboard"]')
        expect(redirectLink).toBeDefined()
        expect(redirectLink!.textContent).toContain(managePasskey.redirect.en)
      },
    )
  },
)
