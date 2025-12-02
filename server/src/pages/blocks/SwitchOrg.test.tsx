import {
  getByText, fireEvent, queryByText, getAllByRole,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, vi, beforeEach,
  Mock,
} from 'vitest'
import SwitchOrg, { SwitchOrgProps } from './SwitchOrg'
import { switchOrg } from 'pages/tools/locale'

// Fake orgs for testing
const fakeOrgs = [
  {
    id: 1, slug: 'org1', name: 'Organization 1', companyLogoUrl: '',
  },
  {
    id: 2, slug: 'org2', name: 'Organization 2', companyLogoUrl: '',
  },
  {
    id: 3, slug: 'org3', name: 'Organization 3', companyLogoUrl: '',
  },
]

describe(
  'SwitchOrg Component',
  () => {
    const defaultProps: SwitchOrgProps = {
      locale: 'en' as any,
      orgs: fakeOrgs,
      activeOrgSlug: 'org1',
      onSwitchOrg: vi.fn(),
      submitError: null,
      isSwitching: false,
    }

    const setup = (props: SwitchOrgProps = defaultProps) => {
      const container = document.createElement('div')
      render(
        <SwitchOrg {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      (defaultProps.onSwitchOrg as Mock).mockReset()
    })

    it(
      'renders view title correctly',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          switchOrg.title.en,
        )
        expect(titleElement).toBeDefined()
      },
    )

    it(
      'renders primary buttons for each organization when orgs are provided',
      () => {
        const container = setup()
        const org1Button = getByText(
          container,
          'Organization 1',
        )
        const org2Button = getByText(
          container,
          'Organization 2',
        )
        const org3Button = getByText(
          container,
          'Organization 3',
        )
        expect(org1Button).toBeDefined()
        expect(org2Button).toBeDefined()
        expect(org3Button).toBeDefined()
      },
    )

    it(
      'displays check icon for the active organization',
      () => {
        const container = setup()
        const org1Button = getByText(
          container,
          'Organization 1',
        )
        // Check that the active org button contains an SVG (CheckIcon)
        const svgElement = org1Button.closest('button')?.querySelector('svg')
        expect(svgElement).toBeDefined()
      },
    )

    it(
      'updates active slug when an organization button is clicked',
      () => {
        const container = setup()
        const org2Button = getByText(
          container,
          'Organization 2',
        )
        fireEvent.click(org2Button)

        // After clicking, the check icon should appear on org2
        const svgElement = org2Button.closest('button')?.querySelector('svg')
        expect(svgElement).toBeDefined()
      },
    )

    it(
      'renders confirm button when an organization is selected',
      () => {
        const container = setup()
        const confirmButton = getByText(
          container,
          switchOrg.confirm.en,
        )
        expect(confirmButton).toBeDefined()
      },
    )

    it(
      'calls onSwitchOrg with initial activeOrgSlug when confirm is clicked without changing selection',
      () => {
        const container = setup()
        const confirmButton = getByText(
          container,
          switchOrg.confirm.en,
        )
        fireEvent.click(confirmButton)

        expect(defaultProps.onSwitchOrg).toHaveBeenCalledWith('org1')
      },
    )

    it(
      'renders no organization buttons when orgs array is empty',
      () => {
        const props = {
          ...defaultProps, orgs: [],
        }
        const container = setup(props)
        const org1Button = queryByText(
          container,
          'Organization 1',
        )
        const org2Button = queryByText(
          container,
          'Organization 2',
        )
        expect(org1Button).toBeNull()
        expect(org2Button).toBeNull()
      },
    )

    it(
      'disables all buttons when isSwitching is true',
      () => {
        const props = {
          ...defaultProps, isSwitching: true,
        }
        const container = setup(props)
        const buttons = getAllByRole(
          container,
          'button',
        )

        buttons.forEach((button) => {
          expect(button.hasAttribute('disabled')).toBe(true)
        })
      },
    )

    it(
      'enables all buttons when isSwitching is false',
      () => {
        const container = setup()
        const buttons = getAllByRole(
          container,
          'button',
        )

        buttons.forEach((button) => {
          expect(button.hasAttribute('disabled')).toBe(false)
        })
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
      'does not render confirm button when activeOrgSlug is empty',
      () => {
        const props = {
          ...defaultProps, activeOrgSlug: '',
        }
        const container = setup(props)
        const confirmButton = queryByText(
          container,
          switchOrg.confirm.en,
        )
        expect(confirmButton).toBeNull()
      },
    )

    it(
      'renders success message when success prop is true',
      () => {
        const props = {
          ...defaultProps, success: true,
        }
        const container = setup(props)
        const successMessage = getByText(
          container,
          switchOrg.success.en,
        )
        expect(successMessage).toBeDefined()
      },
    )

    it(
      'does not render success message when success prop is false',
      () => {
        const props = {
          ...defaultProps, success: false,
        }
        const container = setup(props)
        const successMessage = queryByText(
          container,
          switchOrg.success.en,
        )
        expect(successMessage).toBeNull()
      },
    )

    it(
      'does not render success message when success prop is undefined',
      () => {
        const container = setup()
        const successMessage = queryByText(
          container,
          switchOrg.success.en,
        )
        expect(successMessage).toBeNull()
      },
    )

    it(
      'calls resetSuccess when clicking on a different org while success is true',
      () => {
        const resetSuccessMock = vi.fn()
        const props = {
          ...defaultProps,
          success: true,
          resetSuccess: resetSuccessMock,
        }
        const container = setup(props)
        const org2Button = getByText(
          container,
          'Organization 2',
        )
        fireEvent.click(org2Button)

        expect(resetSuccessMock).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'does not call resetSuccess when clicking on the same org',
      () => {
        const resetSuccessMock = vi.fn()
        const props = {
          ...defaultProps,
          success: true,
          resetSuccess: resetSuccessMock,
        }
        const container = setup(props)
        const org1Button = getByText(
          container,
          'Organization 1',
        )
        fireEvent.click(org1Button)

        expect(resetSuccessMock).not.toHaveBeenCalled()
      },
    )

    it(
      'does not call resetSuccess when clicking on a different org while success is false',
      () => {
        const resetSuccessMock = vi.fn()
        const props = {
          ...defaultProps,
          success: false,
          resetSuccess: resetSuccessMock,
        }
        const container = setup(props)
        const org2Button = getByText(
          container,
          'Organization 2',
        )
        fireEvent.click(org2Button)

        expect(resetSuccessMock).not.toHaveBeenCalled()
      },
    )

    it(
      'does not throw error when resetSuccess is not provided',
      () => {
        const props = {
          ...defaultProps,
          success: true,
        }
        const container = setup(props)
        const org2Button = getByText(
          container,
          'Organization 2',
        )

        expect(() => fireEvent.click(org2Button)).not.toThrow()
      },
    )

    it(
      'renders redirect link when redirectUri is provided',
      () => {
        const redirectUri = 'https://example.com/redirect'
        const props = {
          ...defaultProps, redirectUri,
        }
        const container = setup(props)
        const redirectLink = getByText(
          container,
          switchOrg.redirect.en,
        )
        expect(redirectLink).toBeDefined()
        expect(redirectLink.tagName).toBe('A')
        expect(redirectLink.getAttribute('href')).toBe(redirectUri)
      },
    )

    it(
      'does not render redirect link when redirectUri is not provided',
      () => {
        const container = setup()
        const redirectLink = queryByText(
          container,
          switchOrg.redirect.en,
        )
        expect(redirectLink).toBeNull()
      },
    )

    it(
      'does not render redirect link when redirectUri is empty string',
      () => {
        const props = {
          ...defaultProps, redirectUri: '',
        }
        const container = setup(props)
        const redirectLink = queryByText(
          container,
          switchOrg.redirect.en,
        )
        expect(redirectLink).toBeNull()
      },
    )

    it(
      'renders redirect link with correct CSS class',
      () => {
        const redirectUri = 'https://example.com/redirect'
        const props = {
          ...defaultProps, redirectUri,
        }
        const container = setup(props)
        const redirectLink = getByText(
          container,
          switchOrg.redirect.en,
        )
        expect(redirectLink.classList.contains('button-secondary')).toBe(true)
        expect(redirectLink.classList.contains('mt-6')).toBe(true)
      },
    )

    it(
      'renders all elements correctly when all optional props are provided',
      () => {
        const props = {
          ...defaultProps,
          success: true,
          resetSuccess: vi.fn(),
          redirectUri: 'https://example.com/redirect',
          submitError: 'Test error message',
        }
        const container = setup(props)

        // Check success message
        expect(getByText(
          container,
          switchOrg.success.en,
        )).toBeDefined()

        // Check redirect link
        expect(getByText(
          container,
          switchOrg.redirect.en,
        )).toBeDefined()

        // Check error message
        expect(container.textContent).toContain('Test error message')

        // Check title
        expect(getByText(
          container,
          switchOrg.title.en,
        )).toBeDefined()
      },
    )
  },
)
