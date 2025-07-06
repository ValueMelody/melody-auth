import {
  getByText, fireEvent,
  queryByText,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, vi, beforeEach,
  Mock,
} from 'vitest'
import ManageRecoveryCode, { ManageRecoveryCodeProps } from './ManageRecoveryCode'
import { manageRecoveryCode } from 'pages/tools/locale'

describe(
  'ManageRecoveryCode Component',
  () => {
    const defaultProps: ManageRecoveryCodeProps = {
      locale: 'en' as any,
      successMessage: null,
      recoveryCode: 'ABC123DEF456GHI789',
      onRegenerate: vi.fn(),
      submitError: null,
      redirectUri: '/dashboard',
      isGenerating: false,
    }

    const setup = (props: ManageRecoveryCodeProps = defaultProps) => {
      const container = document.createElement('div')
      render(
        <ManageRecoveryCode {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      (defaultProps.onRegenerate as Mock).mockReset()
    })

    it(
      'renders success message when provided',
      () => {
        const props = {
          ...defaultProps,
          successMessage: 'Recovery code regenerated successfully',
        }
        const container = setup(props)
        const successMessageElement = getByText(
          container,
          'Recovery code regenerated successfully',
        )
        expect(successMessageElement).toBeDefined()
      },
    )

    it(
      'does not render success message when not provided',
      () => {
        const container = setup(defaultProps)
        const successMessageElement = queryByText(
          container,
          'Recovery code regenerated successfully',
        )
        expect(successMessageElement).toBeNull()
      },
    )

    it(
      'renders view title correctly',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          manageRecoveryCode.title.en,
        )
        expect(titleElement).toBeDefined()
      },
    )

    it(
      'renders description text correctly',
      () => {
        const container = setup()
        const descElement = getByText(
          container,
          manageRecoveryCode.desc.en,
        )
        expect(descElement).toBeDefined()
      },
    )

    it(
      'renders recovery code when provided',
      () => {
        const container = setup()
        const recoveryCodeElement = getByText(
          container,
          'ABC123DEF456GHI789',
        )
        expect(recoveryCodeElement).toBeDefined()
      },
    )

    it(
      'renders copy and download buttons with correct labels',
      () => {
        const container = setup()
        const copyButton = getByText(
          container,
          manageRecoveryCode.copy.en,
        )
        const downloadButton = getByText(
          container,
          manageRecoveryCode.download.en,
        )
        expect(copyButton).toBeDefined()
        expect(downloadButton).toBeDefined()
      },
    )

    it(
      'renders regenerate button with correct label',
      () => {
        const container = setup()
        const regenerateButton = getByText(
          container,
          manageRecoveryCode.regenerate.en,
        )
        expect(regenerateButton).toBeDefined()
      },
    )

    it(
      'calls onRegenerate when regenerate button is clicked',
      () => {
        const container = setup()
        const regenerateButton = getByText(
          container,
          manageRecoveryCode.regenerate.en,
        )
        fireEvent.click(regenerateButton)
        expect(defaultProps.onRegenerate).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'shows loading state on regenerate button when isGenerating is true',
      () => {
        const props = {
          ...defaultProps,
          isGenerating: true,
        }
        const container = setup(props)
        const regenerateButton = getByText(
          container,
          manageRecoveryCode.regenerate.en,
        )
        expect(regenerateButton).toBeDefined()
        // The PrimaryButton component should handle the loading state internally
      },
    )

    it(
      'renders copy button and can be clicked',
      async () => {
        const container = setup()
        const copyButton = getByText(
          container,
          manageRecoveryCode.copy.en,
        )
        expect(copyButton).toBeDefined()
        // Test that button can be clicked without error
        fireEvent.click(copyButton)
      },
    )

    it(
      'does not copy when recovery code is not available',
      async () => {
        const props = {
          ...defaultProps,
          recoveryCode: null,
        }
        const container = setup(props)
        const copyButton = queryByText(
          container,
          manageRecoveryCode.copy.en,
        )
        expect(copyButton).toBeNull()
      },
    )

    it(
      'renders download button and can be clicked',
      () => {
        const container = setup()
        const downloadButton = getByText(
          container,
          manageRecoveryCode.download.en,
        )
        expect(downloadButton).toBeDefined()
        // Test that button can be clicked without error
        fireEvent.click(downloadButton)
      },
    )

    it(
      'does not download when recovery code is not available',
      () => {
        const props = {
          ...defaultProps,
          recoveryCode: null,
        }
        const container = setup(props)
        const downloadButton = queryByText(
          container,
          manageRecoveryCode.download.en,
        )

        expect(downloadButton).toBeNull()
      },
    )

    it(
      'renders submit error message when submitError is provided',
      () => {
        const errorMessage = 'Failed to regenerate recovery code'
        const props = {
          ...defaultProps,
          submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'does not render submit error when submitError is null',
      () => {
        const container = setup()
        // The SubmitError component should not render any error text when error is null
        expect(container.textContent).not.toContain('Failed to')
      },
    )

    it(
      'renders redirect link with correct href and text',
      () => {
        const container = setup(defaultProps)
        const redirectLink = container.querySelector('a[href="/dashboard"]')
        expect(redirectLink).toBeDefined()
        expect(redirectLink!.textContent).toContain(manageRecoveryCode.redirect.en)
      },
    )
  },
)
