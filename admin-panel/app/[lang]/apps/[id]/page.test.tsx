import {
  fireEvent, screen, waitFor,
} from '@testing-library/react'
import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import Page from 'app/[lang]/apps/[id]/page'
import { scopes } from 'tests/scopeMock'
import { render } from 'vitest.setup'
import {
  useGetApiV1AppsByIdQuery,
  usePutApiV1AppsByIdMutation,
  useDeleteApiV1AppsByIdMutation,
  useGetApiV1ScopesQuery,
} from 'services/auth/api'
import { apps } from 'tests/appMock'

let mockNav = {
  id: '1',
  push: vi.fn(),
}

vi.mock(
  'next/navigation',
  () => ({ useParams: vi.fn(() => ({ id: mockNav.id })) }),
)

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn(() => ({ push: mockNav.push })) }),
)

const mockUseAuth = vi.fn().mockReturnValue({
  userInfo: {
    authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865',
    roles: ['super_admin'],
  },
})

// Mock useAuth hook
vi.mock(
  '@melody-auth/react',
  () => ({ useAuth: () => mockUseAuth() }),
)

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1AppsByIdQuery: vi.fn(),
    usePutApiV1AppsByIdMutation: vi.fn(),
    useDeleteApiV1AppsByIdMutation: vi.fn(),
    useGetApiV1ScopesQuery: vi.fn(),
  }),
)

const mockUpdate = vi.fn()
const mockDelete = vi.fn()

describe(
  'Spa app',
  () => {
    beforeEach(() => {
      (useGetApiV1AppsByIdQuery as Mock).mockReturnValue({ data: { app: apps[0] } });
      (usePutApiV1AppsByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteApiV1AppsByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }]);
      (useGetApiV1ScopesQuery as Mock).mockReturnValue({ data: { scopes } })
    })

    it(
      'render app',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const statusInput = screen.queryByTestId('statusInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const deleteBtn = screen.queryByTestId('deleteButton')
        const scopeInputs = screen.queryAllByTestId('scopeInput')
        const redirectUriInputs = screen.queryAllByTestId('redirectUriInput') as HTMLInputElement[]
        expect(nameInput?.value).toBe(apps[0].name)
        expect(statusInput?.getAttribute('aria-checked')).toBe(apps[0].isActive ? 'true' : 'false')
        expect(redirectUriInputs.length).toBe(2)
        expect(redirectUriInputs[0]?.value).toBe(apps[0].redirectUris[0])
        expect(redirectUriInputs[1]?.value).toBe(apps[0].redirectUris[1])
        expect(scopeInputs.length).toBe(2)
        expect(saveBtn?.disabled).toBeTruthy()
        expect(deleteBtn).toBeInTheDocument()
      },
    )

    it(
      'removes a scope when clicked',
      async () => {
      // Start with two scopes selected
        const appWithScopes = {
          ...apps[0],
          scopes: ['spa_scope', 'another_spa'],
        };

        (useGetApiV1AppsByIdQuery as Mock).mockReturnValue({ data: { app: appWithScopes } })

        const mixedScopes = [
          {
            id: 1, name: 'spa_scope', type: 'spa', description: 'SPA scope',
          },
          {
            id: 2, name: 'another_spa', type: 'spa', description: 'Another SPA scope',
          },
        ];

        (useGetApiV1ScopesQuery as Mock).mockReturnValue({ data: { scopes: mixedScopes } })

        render(<Page />)

        // Verify both scopes are initially selected
        const scopeInputs = screen.getAllByTestId('scopeInput') as HTMLInputElement[]
        expect(scopeInputs[0].getAttribute('aria-checked')).toBe('true')
        expect(scopeInputs[1].getAttribute('aria-checked')).toBe('true')

        // Click to remove one scope
        fireEvent.click(scopeInputs[0])

        // Try to save the changes
        const saveBtn = screen.getByTestId('saveButton')
        fireEvent.click(saveBtn)

        // Verify the update was called with only one scope
        expect(mockUpdate).toHaveBeenCalledWith({
          id: 1,
          putAppReq: { scopes: ['another_spa'] },
        })
      },
    )

    it(
      'update app',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const statusInput = screen.queryByTestId('statusInput') as HTMLInputElement
        const scopeInputs = screen.queryAllByTestId('scopeInput')
        const redirectUriInputs = screen.queryAllByTestId('redirectUriInput') as HTMLInputElement[]
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'new name' } },
        )

        fireEvent.click(statusInput)

        fireEvent.click(scopeInputs[0])

        fireEvent.change(
          redirectUriInputs[0],
          { target: { value: 'http://test.com' } },
        )

        expect(nameInput?.value).toBe('new name')
        expect(statusInput.getAttribute('aria-checked')).toBe('false')
        expect(redirectUriInputs[0]?.value).toBe('http://test.com')

        expect(saveBtn?.disabled).toBeFalsy()
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenLastCalledWith({
          id: 1,
          putAppReq: {
            name: 'new name',
            isActive: false,
            scopes: ['openid'],
            redirectUris: [
              'http://test.com',
              apps[0].redirectUris[1],
            ],
          },
        })
      },
    )

    it(
      'delete app',
      async () => {
        render(<Page />)

        const deleteBtn = screen.queryByTestId('deleteButton') as HTMLButtonElement
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

        fireEvent.click(deleteBtn)
        expect(screen.queryByRole('alertdialog')).toBeInTheDocument()

        fireEvent.click(screen.queryByTestId('confirmButton') as HTMLButtonElement)

        expect(mockDelete).toHaveBeenLastCalledWith({ id: 1 })
      },
    )

    it(
      'toggles client secret visibility',
      async () => {
        render(<Page />)

        const secretCell = screen.getByText('*****')
        const toggleButton = secretCell.parentElement?.querySelector('button')
        expect(toggleButton).toBeInTheDocument()

        // Initially secret is hidden
        expect(screen.queryByText(apps[0].secret)).not.toBeInTheDocument()

        // Show secret
        fireEvent.click(toggleButton!)
        expect(screen.getByText(apps[0].secret)).toBeInTheDocument()

        // Hide secret again
        fireEvent.click(toggleButton!)
        expect(screen.queryByText(apps[0].secret)).not.toBeInTheDocument()
      },
    )

    it(
      'prevents save when there are validation errors',
      async () => {
        render(<Page />)

        const nameInput = screen.getByTestId('nameInput')
        const saveBtn = screen.getByTestId('saveButton')

        const callCountBefore = mockUpdate.mock.calls.length

        // Trigger validation error by setting empty name
        fireEvent.change(
          nameInput,
          { target: { value: '' } },
        )

        // Try to save
        fireEvent.click(saveBtn)

        // Verify update was not called
        expect(mockUpdate.mock.calls.length).toBe(callCountBefore)
      },
    )

    it(
      'redirects to apps page after successful delete',
      async () => {
        render(<Page />)

        const deleteBtn = screen.getByTestId('deleteButton')

        // Open delete dialog
        fireEvent.click(deleteBtn)

        // Confirm delete
        const confirmBtn = screen.getByTestId('confirmButton')
        fireEvent.click(confirmBtn)

        // Verify delete was called and redirect happened
        expect(mockDelete).toHaveBeenCalledWith({ id: 1 })
        expect(mockNav.push).toHaveBeenCalledWith('/apps')
      },
    )

    it(
      'filters available scopes by app type',
      async () => {
      // Mock scopes with different types
        const mixedScopes = [
          {
            id: 1, name: 'spa_scope', type: 'spa', description: 'SPA scope',
          },
          {
            id: 2, name: 's2s_scope', type: 's2s', description: 'S2S scope',
          },
          {
            id: 3, name: 'another_spa', type: 'spa', description: 'Another SPA scope',
          },
        ];

        (useGetApiV1ScopesQuery as Mock).mockReturnValue({ data: { scopes: mixedScopes } })

        render(<Page />)

        // Should only show SPA scopes since apps[0] is a SPA app
        const scopeInputs = screen.queryAllByTestId('scopeInput')
        expect(scopeInputs).toHaveLength(2)

        // Verify the scope labels are only for SPA scopes
        const scopeLabels = screen.getAllByTestId('scopeLabel')
          .map((label) => label.innerHTML)
        expect(scopeLabels).toContain('spa_scope')
        expect(scopeLabels).toContain('another_spa')
        expect(scopeLabels).not.toContain('s2s_scope')
      },
    )

    it(
      'handles undefined scopes data gracefully',
      async () => {
      // Mock scopesData as undefined
        (useGetApiV1ScopesQuery as Mock).mockReturnValue({ data: undefined })

        render(<Page />)

        // Should render without crashing and show no scope inputs
        const scopeInputs = screen.queryAllByTestId('scopeInput')
        expect(scopeInputs).toHaveLength(0)
      },
    )

    it(
      'returns null when app data is not available',
      async () => {
      // Mock app data as undefined
        (useGetApiV1AppsByIdQuery as Mock).mockReturnValue({ data: { app: null } })

        const { container } = render(<Page />)

        // Should render nothing
        expect(container.firstChild).toBeNull()

        // Verify none of the main elements are present
        expect(screen.queryByTestId('nameInput')).not.toBeInTheDocument()
        expect(screen.queryByTestId('statusInput')).not.toBeInTheDocument()
        expect(screen.queryByTestId('saveButton')).not.toBeInTheDocument()
        expect(screen.queryByTestId('deleteButton')).not.toBeInTheDocument()
      },
    )

    it(
      'toggles MFA configuration fields',
      async () => {
        render(<Page />)
        // Query the system MFA switch by its id
        const systemSwitch = document.getElementById('mfa-useSystem')
        expect(systemSwitch).toBeInTheDocument()

        // Initially, additional MFA fields should not be rendered when useSystemMfaConfig is true
        expect(screen.queryByLabelText('apps.requireEmailMfa')).toBeNull()
        expect(screen.queryByLabelText('apps.requireOtpMfa')).toBeNull()
        expect(screen.queryByLabelText('apps.requireSmsMfa')).toBeNull()
        expect(screen.queryByLabelText('apps.allowEmailMfaAsBackup')).toBeNull()

        // Toggle the system MFA switch to false
        fireEvent.click(systemSwitch)

        expect(screen.getByLabelText('apps.requireEmailMfa')).not.toBeNull()
        expect(screen.getByLabelText('apps.requireOtpMfa')).not.toBeNull()
        expect(screen.getByLabelText('apps.requireSmsMfa')).not.toBeNull()
        expect(screen.getByLabelText('apps.allowEmailMfaAsBackup')).not.toBeNull()
      },
    )
  },
)

describe(
  'S2S app',
  () => {
    beforeEach(() => {
      (useGetApiV1AppsByIdQuery as Mock).mockReturnValue({ data: { app: apps[1] } });
      (usePutApiV1AppsByIdMutation as Mock).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteApiV1AppsByIdMutation as Mock).mockReturnValue([mockDelete, { isLoading: false }]);
      (useGetApiV1ScopesQuery as Mock).mockReturnValue({ data: { scopes } })
      mockNav = {
        id: '2',
        push: vi.fn(),
      }
    })

    it(
      'render app',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const statusInput = screen.queryByTestId('statusInput') as HTMLInputElement
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement
        const deleteBtn = screen.queryByTestId('deleteButton')
        const scopeInputs = screen.queryAllByTestId('scopeInput')
        const redirectUriInputs = screen.queryAllByTestId('redirectUriInput') as HTMLInputElement[]
        expect(nameInput?.value).toBe(apps[1].name)
        expect(statusInput?.getAttribute('aria-checked')).toBe(apps[1].isActive ? 'true' : 'false')
        expect(redirectUriInputs.length).toBe(0)
        expect(scopeInputs.length).toBe(2)
        expect(saveBtn?.disabled).toBeTruthy()
        expect(deleteBtn).toBeInTheDocument()
      },
    )

    it(
      'update app',
      async () => {
        render(<Page />)

        const nameInput = screen.queryByTestId('nameInput') as HTMLInputElement
        const statusInput = screen.queryByTestId('statusInput') as HTMLInputElement
        const scopeInputs = screen.queryAllByTestId('scopeInput')
        const saveBtn = screen.queryByTestId('saveButton') as HTMLButtonElement

        fireEvent.change(
          nameInput,
          { target: { value: 'new name' } },
        )

        fireEvent.click(statusInput)

        fireEvent.click(scopeInputs[0])

        fireEvent.click(scopeInputs[1])

        expect(nameInput?.value).toBe('new name')
        expect(statusInput.getAttribute('aria-checked')).toBe('false')

        expect(saveBtn?.disabled).toBeFalsy()
        fireEvent.click(saveBtn)

        expect(mockUpdate).toHaveBeenLastCalledWith({
          id: 2,
          putAppReq: {
            name: 'new name',
            isActive: false,
            scopes: ['root', 'test s2s'],
          },
        })
      },
    )

    it(
      'delete app',
      async () => {
        render(<Page />)

        const deleteBtn = screen.queryByTestId('deleteButton') as HTMLButtonElement
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

        fireEvent.click(deleteBtn)
        expect(screen.queryByRole('alertdialog')).toBeInTheDocument()

        fireEvent.click(screen.queryByTestId('confirmButton') as HTMLButtonElement)

        expect(mockDelete).toHaveBeenLastCalledWith({ id: 2 })
      },
    )
  },
)
