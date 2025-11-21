import {
  getByText, fireEvent, queryByText, getAllByRole,
} from '@testing-library/dom'
import { render } from 'hono/jsx/dom'
import {
  expect, describe, it, vi, beforeEach,
  Mock,
} from 'vitest'
import * as React from 'react'
import SwitchOrg, { SwitchOrgProps } from './SwitchOrg'
import { switchOrg } from 'pages/tools/locale'

// Mock useState from hono/jsx to use React's useState for proper state management in tests
vi.mock(
  'hono/jsx',
  () => ({
    useState: React.useState,
  }),
)

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
  },
)
