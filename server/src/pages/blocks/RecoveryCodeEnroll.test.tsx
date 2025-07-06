import {
  getByText, fireEvent,
  queryByText,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, vi, beforeEach,
  Mock,
} from 'vitest'
import RecoveryCodeEnroll, { RecoveryCodeEnrollProps } from './RecoveryCodeEnroll'
import { recoveryCodeEnroll } from 'pages/tools/locale'

// Mock navigator.clipboard
const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
})

// Mock URL methods
const mockCreateObjectURL = vi.fn()
const mockRevokeObjectURL = vi.fn()
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
})

// Mock document.createElement
const mockClick = vi.fn()
const originalCreateElement = document.createElement
document.createElement = vi.fn().mockImplementation((tagName) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: mockClick,
    }
  }
  return originalCreateElement.call(document, tagName)
})

// Mock document.body methods
document.body.appendChild = vi.fn()
document.body.removeChild = vi.fn()

describe(
  'RecoveryCodeEnroll Component',
  () => {
    const defaultProps: RecoveryCodeEnrollProps = {
      locale: 'en' as any,
      recoveryCodeEnrollInfo: {
        recoveryCode: 'ABC123DEF456',
      },
      submitError: null,
      handleContinue: vi.fn(),
    }

    const setup = (props: RecoveryCodeEnrollProps = defaultProps) => {
      const container = document.createElement('div')
      render(
        <RecoveryCodeEnroll {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      (defaultProps.handleContinue as Mock).mockReset()
      mockWriteText.mockReset()
      mockCreateObjectURL.mockReset()
      mockRevokeObjectURL.mockReset()
      mockClick.mockReset()
      mockCreateObjectURL.mockReturnValue('mock-url')
    })

    it(
      'renders view title correctly',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          recoveryCodeEnroll.title.en,
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
          recoveryCodeEnroll.desc.en,
        )
        expect(descElement).toBeDefined()
      },
    )

    it(
      'renders recovery code when recoveryCodeEnrollInfo is provided',
      () => {
        const container = setup()
        const recoveryCodeElement = getByText(
          container,
          'ABC123DEF456',
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
          recoveryCodeEnroll.copy.en,
        )
        const downloadButton = getByText(
          container,
          recoveryCodeEnroll.download.en,
        )
        expect(copyButton).toBeDefined()
        expect(downloadButton).toBeDefined()
      },
    )

    it(
      'renders continue button with correct label',
      () => {
        const container = setup()
        const continueButton = getByText(
          container,
          recoveryCodeEnroll.continue.en,
        )
        expect(continueButton).toBeDefined()
      },
    )

    it(
      'calls handleContinue when continue button is clicked',
      () => {
        const container = setup()
        const continueButton = getByText(
          container,
          recoveryCodeEnroll.continue.en,
        )
        fireEvent.click(continueButton)
        expect(defaultProps.handleContinue).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'copies recovery code to clipboard when copy button is clicked',
      async () => {
        const container = setup()
        const copyButton = getByText(
          container,
          recoveryCodeEnroll.copy.en,
        )
        await fireEvent.click(copyButton)
        expect(mockWriteText).toHaveBeenCalledWith('ABC123DEF456')
      },
    )

    it(
      'does not copy when recovery code is not available',
      async () => {
        const props = {
          ...defaultProps,
          recoveryCodeEnrollInfo: null,
        }
        const container = setup(props)
        const copyButton = queryByText(
          container,
          recoveryCodeEnroll.copy.en,
        )
        expect(copyButton).toBeNull()
      },
    )

    it(
      'downloads recovery code file when download button is clicked',
      () => {
        const container = setup()
        const downloadButton = getByText(
          container,
          recoveryCodeEnroll.download.en,
        )
        document.createElement.mockClear()

        fireEvent.click(downloadButton)

        expect(document.createElement).toHaveBeenCalledWith('a')
        expect(mockCreateObjectURL).toHaveBeenCalledWith(
          expect.any(Blob)
        )
        expect(document.body.appendChild).toHaveBeenCalled()
        expect(mockClick).toHaveBeenCalled()
        expect(document.body.removeChild).toHaveBeenCalled()
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url')
      },
    )

    it(
      'does not download when recovery code is not available',
      () => {
        const props = {
          ...defaultProps,
          recoveryCodeEnrollInfo: null,
        }
        const container = setup(props)
        const downloadButton = queryByText(
          container,
          recoveryCodeEnroll.download.en,
        )

        expect(downloadButton).toBeNull()
      },
    )

    it(
      'renders submit error message when submitError is provided',
      () => {
        const errorMessage = 'Test Error'
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
        expect(container.textContent).not.toContain('Error')
      },
    )

    it(
      'creates blob with correct content type and filename for download',
      () => {
        const container = setup()
        const downloadButton = getByText(
          container,
          recoveryCodeEnroll.download.en,
        )
        
        // Mock Blob constructor
        const mockBlob = vi.fn()
        global.Blob = mockBlob
        
        fireEvent.click(downloadButton)
        
        const expectedContent = `${recoveryCodeEnroll.title.en}: ABC123DEF456\n\n${recoveryCodeEnroll.desc.en}`
        
        expect(mockBlob).toHaveBeenCalledWith(
          [expectedContent],
          { type: 'text/plain' }
        )
        
        // Check that createElement was called for the link
        expect(document.createElement).toHaveBeenCalledWith('a')
      },
    )
  },
) 