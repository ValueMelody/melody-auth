Fully implemented: NO

## Context Reference

**For complete environment context, read these files in order:**
1. `/home/pedro/storage/www/goauth.me/.claudiomiro/AI_PROMPT.md` - Universal context (tech stack, architecture, conventions)
2. `/home/pedro/storage/www/goauth.me/.claudiomiro/TASK1/TASK.md` - Task-level context (what this task is about)
3. `/home/pedro/storage/www/goauth.me/.claudiomiro/TASK1/PROMPT.md` - Task-specific context (files to touch, patterns to follow)

**You MUST read these files before implementing to understand:**
- Tech stack: Vue 3 + Vite + TypeScript + Tailwind CSS v4 + TanStack Query + Pinia + vue-i18n + shadcn-vue
- Project structure: `admin-panel-vue/src/` with views, components, api, stores, composables, i18n
- Coding conventions: Vue 3 Composition API with `<script setup lang="ts">`, TypeScript strict mode
- Related code examples: Porting from Next.js React (`admin-panel/`) to Vue 3 SPA
- Integration points: API server at localhost:8787/8788, OAuth authentication via @melody-auth

**DO NOT duplicate this context below - it's already in the files above.**

---

## Implementation Plan

### Item 1 — Project Initialization + Core Infrastructure

- **What to do:**
  1. Create `admin-panel-vue/` directory at project root
  2. Initialize Vite + Vue 3 + TypeScript project:
     ```bash
     cd /home/pedro/storage/www/goauth.me
     npm create vite@latest admin-panel-vue -- --template vue-ts
     cd admin-panel-vue
     ```
  3. Install all dependencies:
     ```bash
     npm install vue@^3.4 vue-router@^4.3 pinia@^2.1 vue-i18n@^9.10 @tanstack/vue-query@^5.24 axios@^1.6 @vueuse/core@^10.7 radix-vue@^1.9 class-variance-authority@^0.7 clsx@^2.1 tailwind-merge@^2.2 lucide-vue-next@^0.372
     npm install -D tailwindcss@^4.0 @tailwindcss/vite@^4.0 vue-tsc@^2.0
     ```
  4. Configure `vite.config.ts` with:
     - Vue plugin
     - Tailwind CSS v4 via `@tailwindcss/vite`
     - Path alias `@/` pointing to `src/`
     - Proxy for `/api/*` to `http://localhost:8787`
  5. Configure `tsconfig.json` with path aliases
  6. Create `src/styles/main.css` with Tailwind v4 imports
  7. Create `.env.example` with `VITE_API_URL`, `VITE_CLIENT_ID`, `VITE_CLIENT_URI`
  8. Initialize shadcn-vue:
     ```bash
     npx shadcn-vue@latest init
     npx shadcn-vue@latest add button input textarea label card table badge checkbox switch select alert alert-dialog dropdown-menu separator skeleton tooltip sheet sidebar breadcrumb pagination navigation-menu
     ```
  9. Create core infrastructure files:
     - `src/main.ts` - Vue app entry with Pinia, Router, vue-i18n, TanStack Query
     - `src/App.vue` - Root component with MainLayout and router-view
     - `src/router/index.ts` - Vue Router with auth guards
     - `src/lib/utils.ts` - shadcn-vue utility (cn function)

- **Context (read-only):**
  - `admin-panel/package.json` — Dependencies to install (adapt React deps to Vue equivalents)
  - `admin-panel/app/Setup.tsx:1-100` — Layout and auth structure pattern
  - `PROMPT.md:120-145` — Exact dependencies list with versions

- **Touched (will modify/create):**
  - CREATE: `admin-panel-vue/package.json`
  - CREATE: `admin-panel-vue/vite.config.ts`
  - CREATE: `admin-panel-vue/tsconfig.json`
  - CREATE: `admin-panel-vue/tsconfig.node.json`
  - CREATE: `admin-panel-vue/components.json` (shadcn-vue config)
  - CREATE: `admin-panel-vue/.env.example`
  - CREATE: `admin-panel-vue/index.html`
  - CREATE: `admin-panel-vue/src/main.ts`
  - CREATE: `admin-panel-vue/src/App.vue`
  - CREATE: `admin-panel-vue/src/router/index.ts`
  - CREATE: `admin-panel-vue/src/styles/main.css`
  - CREATE: `admin-panel-vue/src/lib/utils.ts`
  - CREATE: `admin-panel-vue/src/components/ui/*` (shadcn-vue components)

- **Interfaces / Contracts:**
  - Vite dev server: `http://localhost:5173` (default)
  - API proxy: `/api/*` -> `http://localhost:8787`
  - Environment variables:
    ```
    VITE_API_URL=http://localhost:8787
    VITE_CLIENT_ID=<oauth-client-id>
    VITE_CLIENT_URI=http://localhost:5173
    ```

- **Tests:**
  Type: Verification commands only (no unit tests for scaffolding)
  - Happy path: `npm install` completes without errors
  - Happy path: `npm run dev` starts Vite dev server
  - Happy path: `npm run build` produces valid `dist/` folder
  - Happy path: `npm run type-check` passes with no TypeScript errors

- **Migrations / Data:**
  N/A - No database changes required

- **Observability:**
  N/A - Basic scaffolding, logging added in later items

- **Security & Permissions:**
  - `.env.example` should NOT contain actual secrets, only placeholder values
  - Do not commit `.env` file (should be in `.gitignore`)

- **Performance:**
  N/A - Initial scaffolding

- **Commands:**
  ```bash
  # Create and initialize project
  cd /home/pedro/storage/www/goauth.me
  npm create vite@latest admin-panel-vue -- --template vue-ts
  cd admin-panel-vue

  # Install dependencies
  npm install vue@^3.4 vue-router@^4.3 pinia@^2.1 vue-i18n@^9.10 @tanstack/vue-query@^5.24 axios@^1.6 @vueuse/core@^10.7 radix-vue@^1.9 class-variance-authority@^0.7 clsx@^2.1 tailwind-merge@^2.2 lucide-vue-next@^0.372
  npm install -D tailwindcss@^4.0 @tailwindcss/vite@^4.0 vue-tsc@^2.0

  # Initialize shadcn-vue
  npx shadcn-vue@latest init
  npx shadcn-vue@latest add button input textarea label card table badge checkbox switch select alert alert-dialog dropdown-menu separator skeleton tooltip sheet sidebar breadcrumb pagination navigation-menu

  # Verify
  npm run dev
  npm run build
  npm run type-check
  ```

- **Risks & Mitigations:**
  - **Risk:** shadcn-vue CLI may prompt for interactive input
    **Mitigation:** Use `--yes` flag if available, or provide required config in `components.json`
  - **Risk:** Tailwind v4 with @tailwindcss/vite may have different setup than v3
    **Mitigation:** Follow Tailwind v4 documentation for Vite integration, use `@import "tailwindcss"` syntax

---

### Item 2 — Pinia Stores + API Client + TanStack Query Setup

- **What to do:**
  1. Create Pinia stores in `src/stores/`:
     - `auth.ts` - OAuth token management, user session, roles
       - State: `token`, `refreshToken`, `userInfo`, `isAuthenticated`
       - Actions: `login()`, `logout()`, `refreshToken()`, `acquireToken()`
       - Follow pattern from `admin-panel/app/Setup.tsx:58-141`
     - `config.ts` - System configuration from API `/api/info`
       - State: `configs` object with all server config values
       - Follow pattern from `admin-panel/signals/config.ts`
     - `error.ts` - Global error handling for mutations
       - State: `errorMessage`
       - Actions: `setError()`, `clearError()`
  2. Create Axios client in `src/api/client.ts`:
     - Base URL from `VITE_API_URL`
     - Request interceptor to add Bearer token from auth store
     - Response interceptor for 401 handling (token refresh)
     - Follow pattern from `PROMPT.md:199-227`
  3. Create TanStack Query setup:
     - Configure QueryClient with default options
     - Set up in `main.ts` with VueQueryPlugin

- **Context (read-only):**
  - `admin-panel/app/Setup.tsx:58-141` — Auth flow pattern with login redirect
  - `admin-panel/signals/` — Signal-based state (port to Pinia)
  - `admin-panel/stores/` — Redux store structure
  - `PROMPT.md:199-227` — Axios client with auth interceptor example

- **Touched (will modify/create):**
  - CREATE: `admin-panel-vue/src/stores/index.ts` (Pinia setup)
  - CREATE: `admin-panel-vue/src/stores/auth.ts`
  - CREATE: `admin-panel-vue/src/stores/config.ts`
  - CREATE: `admin-panel-vue/src/stores/error.ts`
  - CREATE: `admin-panel-vue/src/api/client.ts`
  - MODIFY: `admin-panel-vue/src/main.ts` — Add Pinia and VueQuery

- **Interfaces / Contracts:**
  ```typescript
  // stores/auth.ts
  interface AuthState {
    token: string | null
    refreshToken: string | null
    userInfo: UserInfo | null
    isAuthenticated: boolean
    isLoading: boolean
  }

  interface UserInfo {
    email: string
    firstName?: string
    lastName?: string
    roles: string[]
    locale: string
  }

  // stores/config.ts
  interface ConfigState {
    configs: Record<string, string | boolean | string[]> | null
  }

  // api/client.ts - Axios instance export
  export const client: AxiosInstance
  ```

- **Tests:**
  Type: Manual verification
  - Happy path: Stores initialize without errors
  - Happy path: API client can be imported and used
  - Edge case: Token refresh on 401 response triggers re-auth

- **Migrations / Data:**
  N/A - No data changes

- **Observability:**
  - Add console.error for auth failures (development only)
  - Error store tracks mutation failures for display

- **Security & Permissions:**
  - Token stored in memory (Pinia), not localStorage
  - Refresh token handling must be secure
  - Do not log tokens or sensitive user data

- **Performance:**
  N/A - Basic setup

- **Commands:**
  ```bash
  cd admin-panel-vue
  npm run type-check  # Verify no TypeScript errors
  npm run dev         # Test that app loads
  ```

- **Risks & Mitigations:**
  - **Risk:** OAuth flow requires redirect handling
    **Mitigation:** Use @melody-auth/vue if available, or implement OAuth PKCE flow manually
  - **Risk:** Token refresh race conditions
    **Mitigation:** Use mutex/lock pattern in refreshToken action

---

### Item 3 — Vue Router + vue-i18n + Layout Components

- **What to do:**
  1. Configure Vue Router in `src/router/index.ts`:
     - Define all admin routes (see route list below)
     - Add auth guard (`beforeEach`) to check authentication
     - Lazy load all view components
     - Follow pattern from `PROMPT.md:232-262`
  2. Set up vue-i18n:
     - Create `src/i18n/index.ts` with vue-i18n configuration
     - Create translation files in `src/i18n/locales/`:
       - `en.json` - Port from `admin-panel/translations/en.json`
       - `pt.json` - Port from `admin-panel/translations/pt.json`
       - `fr.json` - Port from `admin-panel/translations/fr.json`
     - Use `createI18n()` with locale detection
  3. Create layout components in `src/components/layout/`:
     - `MainLayout.vue` - Full admin layout with sidebar wrapper
       - Uses shadcn-vue Sidebar component
       - Handles auth state display
       - Follow pattern from `admin-panel/app/Setup.tsx:143-439`
     - `Sidebar.vue` - Navigation sidebar with collapsible sections
       - Menu items for Dashboard, Users, Apps, Orgs, Roles, Scopes, etc.
       - RBAC-based visibility (check user roles)
       - Follow pattern from `admin-panel/app/Setup.tsx:201-367`
     - `Breadcrumb.vue` - Page breadcrumb navigation
       - Props: `page`, `parent`
       - Follow pattern from `admin-panel/components/Breadcrumb.tsx`
     - `PageTitle.vue` - Page header with title
       - Props: `title`, `className`
       - Follow pattern from `admin-panel/components/PageTitle.tsx`

- **Context (read-only):**
  - `admin-panel/app/Setup.tsx:143-439` — Layout with sidebar pattern
  - `admin-panel/components/Breadcrumb.tsx` — Breadcrumb component
  - `admin-panel/components/PageTitle.tsx` — PageTitle component
  - `admin-panel/translations/en.json` — Full translation structure
  - `PROMPT.md:232-262` — Vue Router example with guards

- **Touched (will modify/create):**
  - CREATE: `admin-panel-vue/src/router/index.ts`
  - CREATE: `admin-panel-vue/src/i18n/index.ts`
  - CREATE: `admin-panel-vue/src/i18n/locales/en.json`
  - CREATE: `admin-panel-vue/src/i18n/locales/pt.json`
  - CREATE: `admin-panel-vue/src/i18n/locales/fr.json`
  - CREATE: `admin-panel-vue/src/components/layout/MainLayout.vue`
  - CREATE: `admin-panel-vue/src/components/layout/Sidebar.vue`
  - CREATE: `admin-panel-vue/src/components/layout/Breadcrumb.vue`
  - CREATE: `admin-panel-vue/src/components/layout/PageTitle.vue`
  - MODIFY: `admin-panel-vue/src/main.ts` — Add router and i18n
  - MODIFY: `admin-panel-vue/src/App.vue` — Use MainLayout

- **Interfaces / Contracts:**
  Routes to define:
  ```typescript
  const routes = [
    { path: '/login', component: LoginView },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: DashboardView },
        { path: 'users', component: UsersListView },
        { path: 'users/:authId', component: UserDetailView },
        { path: 'apps', component: AppsListView },
        { path: 'apps/new', component: AppNewView },
        { path: 'apps/:id', component: AppDetailView },
        { path: 'apps/banners', component: AppBannersView },
        { path: 'apps/banners/new', component: AppBannerNewView },
        { path: 'apps/banners/:id', component: AppBannerDetailView },
        { path: 'orgs', component: OrgsListView },
        { path: 'orgs/new', component: OrgNewView },
        { path: 'orgs/:id', component: OrgDetailView },
        { path: 'roles', component: RolesListView },
        { path: 'roles/new', component: RoleNewView },
        { path: 'roles/:id', component: RoleDetailView },
        { path: 'scopes', component: ScopesListView },
        { path: 'scopes/new', component: ScopeNewView },
        { path: 'scopes/:id', component: ScopeDetailView },
        { path: 'user-attributes', component: UserAttributesListView },
        { path: 'user-attributes/new', component: UserAttributeNewView },
        { path: 'user-attributes/:id', component: UserAttributeDetailView },
        { path: 'logs', component: LogsView },
        { path: 'logs/email/:id', component: EmailLogDetailView },
        { path: 'logs/sms/:id', component: SmsLogDetailView },
        { path: 'logs/sign-in/:id', component: SignInLogDetailView },
        { path: 'saml', component: SamlListView },
        { path: 'saml/new', component: SamlNewView },
        { path: 'saml/:id', component: SamlDetailView },
        { path: 'account', component: AccountView },
      ]
    }
  ]
  ```

- **Tests:**
  Type: Manual verification
  - Happy path: Router navigates between views
  - Happy path: Auth guard redirects unauthenticated users to /login
  - Happy path: Translations load for all 3 locales
  - Happy path: Layout renders with sidebar and content area

- **Migrations / Data:**
  N/A - No data changes

- **Observability:**
  N/A - Layout components

- **Security & Permissions:**
  - Auth guard must check `isAuthenticated` from auth store
  - Sidebar menu items show/hide based on user roles
  - Follow RBAC pattern from `admin-panel/app/Setup.tsx:236-367`

- **Performance:**
  - All view components must be lazy-loaded: `() => import('@/views/...')`

- **Commands:**
  ```bash
  cd admin-panel-vue
  npm run type-check
  npm run dev  # Navigate between routes manually
  ```

- **Risks & Mitigations:**
  - **Risk:** vue-i18n locale switching may not persist
    **Mitigation:** Store locale in localStorage and load on app init
  - **Risk:** Sidebar may not collapse properly on mobile
    **Mitigation:** Use shadcn-vue Sidebar with `collapsible="icon"` variant

---

### Item 4 — TanStack Query API Endpoints + TypeScript Types

- **What to do:**
  1. Create TypeScript types in `src/api/types.ts`:
     - Port all types from `admin-panel/services/auth/api.ts:1322-1675`
     - Include: User, UserDetail, App, AppDetail, Org, Role, Scope, ScopeDetail, UserAttribute, EmailLog, SmsLog, SignInLog, SamlIdp, AppBanner, OrgGroup
     - Include request types: PostAppReq, PutAppReq, PostOrgReq, PutOrgReq, etc.
  2. Create TanStack Query hooks in `src/api/endpoints/`:
     - `users.ts` - User CRUD with pagination
       - `useUsers(params)`, `useUser(authId)`, `useUpdateUser()`, `useDeleteUser()`
       - Additional: locked IPs, passkeys, consented apps, MFA management, org groups
     - `apps.ts` - App CRUD
       - `useApps()`, `useApp(id)`, `useCreateApp()`, `useUpdateApp()`, `useDeleteApp()`
     - `orgs.ts` - Organization CRUD with branding
       - `useOrgs()`, `useOrg(id)`, `useCreateOrg()`, `useUpdateOrg()`, `useDeleteOrg()`
       - Additional: org users, verify domain
     - `roles.ts` - Role CRUD
       - `useRoles()`, `useRole(id)`, `useCreateRole()`, `useUpdateRole()`, `useDeleteRole()`
       - Additional: users by role
     - `scopes.ts` - Scope CRUD with locales
       - `useScopes()`, `useScope(id)`, `useCreateScope()`, `useUpdateScope()`, `useDeleteScope()`
     - `userAttributes.ts` - User attribute CRUD
       - `useUserAttributes()`, `useUserAttribute(id)`, `useCreateUserAttribute()`, `useUpdateUserAttribute()`, `useDeleteUserAttribute()`
     - `logs.ts` - Log queries (email, SMS, sign-in)
       - `useEmailLogs(params)`, `useEmailLog(id)`, `useSmsLogs(params)`, `useSmsLog(id)`, `useSignInLogs(params)`, `useSignInLog(id)`
       - Mutations: `useDeleteEmailLogs()`, `useDeleteSmsLogs()`, `useDeleteSignInLogs()`
     - `saml.ts` - SAML IDP CRUD
       - `useSamlIdps()`, `useSamlIdp(id)`, `useCreateSamlIdp()`, `useUpdateSamlIdp()`, `useDeleteSamlIdp()`
     - `appBanners.ts` - App banner CRUD
       - `useAppBanners()`, `useAppBanner(id)`, `useCreateAppBanner()`, `useUpdateAppBanner()`, `useDeleteAppBanner()`
     - `orgGroups.ts` - Organization group CRUD
       - `useOrgGroups(orgId)`, `useCreateOrgGroup()`, `useUpdateOrgGroup()`, `useDeleteOrgGroup()`
       - Additional: users by org group
  3. Implement cache invalidation:
     - Use queryKey structure: `['users']`, `['users', authId]`, `['apps']`, etc.
     - Mutations invalidate related queries via `queryClient.invalidateQueries()`
     - Follow RTK Query tag pattern from `admin-panel/services/auth/api.ts:2-14`

- **Context (read-only):**
  - `admin-panel/services/auth/api.ts:1-750` — RTK Query endpoints (port to TanStack Query)
  - `admin-panel/services/auth/api.ts:751-1675` — TypeScript types for all DTOs
  - `PROMPT.md:161-195` — TanStack Query pattern example

- **Touched (will modify/create):**
  - CREATE: `admin-panel-vue/src/api/types.ts`
  - CREATE: `admin-panel-vue/src/api/endpoints/users.ts`
  - CREATE: `admin-panel-vue/src/api/endpoints/apps.ts`
  - CREATE: `admin-panel-vue/src/api/endpoints/orgs.ts`
  - CREATE: `admin-panel-vue/src/api/endpoints/roles.ts`
  - CREATE: `admin-panel-vue/src/api/endpoints/scopes.ts`
  - CREATE: `admin-panel-vue/src/api/endpoints/userAttributes.ts`
  - CREATE: `admin-panel-vue/src/api/endpoints/logs.ts`
  - CREATE: `admin-panel-vue/src/api/endpoints/saml.ts`
  - CREATE: `admin-panel-vue/src/api/endpoints/appBanners.ts`
  - CREATE: `admin-panel-vue/src/api/endpoints/orgGroups.ts`
  - CREATE: `admin-panel-vue/src/api/endpoints/index.ts` (re-exports)

- **Interfaces / Contracts:**
  ```typescript
  // Example hook pattern (users.ts)
  export const useUsers = (params: Ref<{ pageSize?: number; pageNumber?: number; search?: string }>) => {
    return useQuery({
      queryKey: ['users', params],
      queryFn: () => client.get('/api/v1/users', { params: params.value })
    })
  }

  export const useCreateUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: CreateUserDto) => client.post('/api/v1/users', data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
    })
  }
  ```

- **Tests:**
  Type: Manual verification + type checking
  - Happy path: All types compile without errors
  - Happy path: Query hooks can be called in components
  - Edge case: Mutations correctly invalidate cached queries

- **Migrations / Data:**
  N/A - Client-side API layer

- **Observability:**
  - TanStack Query DevTools (optional, for development)

- **Security & Permissions:**
  - All API calls go through authenticated axios client
  - Types should match server DTOs exactly

- **Performance:**
  - Use reactive `Ref` for query params to enable automatic refetch
  - Set appropriate staleTime and cacheTime in query options

- **Commands:**
  ```bash
  cd admin-panel-vue
  npm run type-check  # Verify all types are correct
  ```

- **Risks & Mitigations:**
  - **Risk:** Type mismatch between client and server DTOs
    **Mitigation:** Copy types directly from `admin-panel/services/auth/api.ts` and verify
  - **Risk:** Missing query invalidation causes stale UI
    **Mitigation:** Carefully map RTK Query tags to TanStack Query queryKeys

---

### Item 5 — Shared Components + Form Composables

- **What to do:**
  1. Create shared components in `src/components/shared/`:
     - `SaveButton.vue` - Form save button with loading state
       - Props: `onClick`, `disabled`, `isLoading`, `className`
       - Follow pattern from `admin-panel/components/SaveButton.tsx`
     - `DeleteButton.vue` - Delete with confirmation dialog
       - Props: `onConfirmDelete`, `confirmDeleteTitle`, `disabled`, `isLoading`
       - Uses shadcn-vue AlertDialog
       - Follow pattern from `admin-panel/components/DeleteButton.tsx`
     - `CreateButton.vue` - New entity creation button
       - Props: `href`, `label`
       - Follow pattern from `admin-panel/components/CreateButton.tsx`
     - `Pagination.vue` - Generic pagination controls
       - Props: `currentPage`, `totalPages`, `onPageChange`
       - Follow pattern from `admin-panel/components/Pagination.tsx:1-155`
     - `UserTable.vue` - Paginated user list table
       - Props: `orgId` (optional filter)
       - Includes search input and pagination
       - Follow pattern from `admin-panel/components/UserTable.tsx`
     - `ConfirmModal.vue` - Confirmation dialog wrapper
       - Props: `title`, `description`, `onConfirm`, `onCancel`
     - `FieldError.vue` - Form field error display
       - Props: `error`
       - Follow pattern from `admin-panel/components/FieldError.tsx`
     - `LoadingPage.vue` - Full-page loading state
       - Uses shadcn-vue Spinner
       - Follow pattern from `admin-panel/components/LoadingPage.tsx`
     - `LocaleEditor.vue` - Multi-locale text editor
       - Props: `locales`, `onChange`
       - For editing scope/attribute/banner locales
       - Follow pattern from `admin-panel/components/LocaleEditor.tsx`
     - `ColorInput.vue` - Color picker input
       - Props: `value`, `onChange`, `label`
       - For org branding colors
       - Follow pattern from `admin-panel/components/ColorInput.tsx`
     - `LinkInput.vue` - URL input with validation
       - Props: `value`, `onChange`, `label`
       - Follow pattern from `admin-panel/components/LinkInput.tsx`
     - `ScopesEditor.vue` - Scope selection editor
       - Props: `scopes`, `value`, `onToggleScope`, `disabled`
       - Follow pattern from `admin-panel/components/ScopesEditor.tsx`
  2. Create form composables in `src/composables/forms/`:
     - `useAppForm.ts` - App creation/editing form state
       - Follow pattern from `admin-panel/app/[lang]/apps/useEditApp.ts`
     - `useOrgForm.ts` - Organization creation/editing
     - `useUserForm.ts` - User editing
     - `useRoleForm.ts` - Role creation/editing
     - `useScopeForm.ts` - Scope creation/editing
     - `useUserAttributeForm.ts` - User attribute creation/editing
     - `useSamlForm.ts` - SAML IDP creation/editing
  3. Create utility composables in `src/composables/`:
     - `useAuth.ts` - OAuth flow wrapper, token refresh
     - `useAccess.ts` - Role-based access control checks
       - Export `isAllowedAccess(accessType, userRoles)` function
       - Follow pattern from `admin-panel/tools/access.ts`

- **Context (read-only):**
  - `admin-panel/components/SaveButton.tsx` — SaveButton pattern
  - `admin-panel/components/DeleteButton.tsx` — DeleteButton pattern
  - `admin-panel/components/Pagination.tsx:1-155` — Pagination logic
  - `admin-panel/components/UserTable.tsx` — UserTable pattern
  - `admin-panel/app/[lang]/apps/useEditApp.ts` — Form hook pattern
  - `admin-panel/tools/access.ts` — RBAC utility

- **Touched (will modify/create):**
  - CREATE: `admin-panel-vue/src/components/shared/SaveButton.vue`
  - CREATE: `admin-panel-vue/src/components/shared/DeleteButton.vue`
  - CREATE: `admin-panel-vue/src/components/shared/CreateButton.vue`
  - CREATE: `admin-panel-vue/src/components/shared/Pagination.vue`
  - CREATE: `admin-panel-vue/src/components/shared/UserTable.vue`
  - CREATE: `admin-panel-vue/src/components/shared/ConfirmModal.vue`
  - CREATE: `admin-panel-vue/src/components/shared/FieldError.vue`
  - CREATE: `admin-panel-vue/src/components/shared/LoadingPage.vue`
  - CREATE: `admin-panel-vue/src/components/shared/LocaleEditor.vue`
  - CREATE: `admin-panel-vue/src/components/shared/ColorInput.vue`
  - CREATE: `admin-panel-vue/src/components/shared/LinkInput.vue`
  - CREATE: `admin-panel-vue/src/components/shared/ScopesEditor.vue`
  - CREATE: `admin-panel-vue/src/composables/forms/useAppForm.ts`
  - CREATE: `admin-panel-vue/src/composables/forms/useOrgForm.ts`
  - CREATE: `admin-panel-vue/src/composables/forms/useUserForm.ts`
  - CREATE: `admin-panel-vue/src/composables/forms/useRoleForm.ts`
  - CREATE: `admin-panel-vue/src/composables/forms/useScopeForm.ts`
  - CREATE: `admin-panel-vue/src/composables/forms/useUserAttributeForm.ts`
  - CREATE: `admin-panel-vue/src/composables/forms/useSamlForm.ts`
  - CREATE: `admin-panel-vue/src/composables/useAuth.ts`
  - CREATE: `admin-panel-vue/src/composables/useAccess.ts`
  - CREATE: `admin-panel-vue/src/composables/index.ts` (re-exports)

- **Interfaces / Contracts:**
  ```typescript
  // Form composable pattern
  interface FormState<T> {
    values: T
    errors: Partial<Record<keyof T, string>>
    onChange: (key: keyof T, value: any) => void
    reset: () => void
    validate: () => boolean
  }

  // Access control
  enum Access {
    ReadUser, WriteUser,
    ReadApp, WriteApp,
    ReadOrg, WriteOrg,
    ReadRole, WriteRole,
    ReadScope, WriteScope,
    ReadUserAttribute, WriteUserAttribute,
    ReadLog, ManageSamlSso
  }

  function isAllowedAccess(access: Access, roles: string[]): boolean
  ```

- **Tests:**
  Type: Manual verification + type checking
  - Happy path: Form composables return reactive values and errors
  - Happy path: Components render without errors
  - Edge case: Form validation shows correct error messages

- **Migrations / Data:**
  N/A - UI components

- **Observability:**
  N/A - UI components

- **Security & Permissions:**
  - `useAccess` must correctly check roles against allowed permissions
  - Follow exact RBAC rules from existing implementation

- **Performance:**
  - Form composables should use `computed` for derived values
  - Avoid unnecessary re-renders

- **Commands:**
  ```bash
  cd admin-panel-vue
  npm run type-check
  npm run dev  # Verify components render
  ```

- **Risks & Mitigations:**
  - **Risk:** Form composable pattern differs from React hooks
    **Mitigation:** Use Vue 3 `ref`, `computed`, `watch` equivalently to React useState/useMemo/useEffect

---

### Item 6 — All Admin Page Views

- **What to do:**
  1. Create all view components in `src/views/`:

     **Dashboard:**
     - `DashboardView.vue` - System config overview, links
       - Follow pattern from `admin-panel/app/[lang]/dashboard/page.tsx`

     **Users:**
     - `UsersListView.vue` - User list with search/pagination (uses UserTable)
       - Follow pattern from `admin-panel/app/[lang]/users/page.tsx`
     - `UserDetailView.vue` - User detail, roles, orgs, MFA management
       - Follow pattern from `admin-panel/app/[lang]/users/[authId]/page.tsx`

     **Apps:**
     - `AppsListView.vue` - App list
     - `AppNewView.vue` - Create new app
     - `AppDetailView.vue` - App detail, scopes, redirect URIs, MFA config
       - Follow pattern from `admin-panel/app/[lang]/apps/[id]/page.tsx`
     - `AppBannersView.vue` - App banner list
     - `AppBannerNewView.vue` - Create app banner
     - `AppBannerDetailView.vue` - Edit app banner

     **Organizations:**
     - `OrgsListView.vue` - Organization list
     - `OrgNewView.vue` - Create organization
     - `OrgDetailView.vue` - Org detail, branding, groups
       - Follow pattern from `admin-panel/app/[lang]/orgs/[id]/page.tsx`

     **Roles:**
     - `RolesListView.vue` - Role list
     - `RoleNewView.vue` - Create role
     - `RoleDetailView.vue` - Role detail, users with role

     **Scopes:**
     - `ScopesListView.vue` - Scope list
     - `ScopeNewView.vue` - Create scope
     - `ScopeDetailView.vue` - Scope detail with locales

     **User Attributes:**
     - `UserAttributesListView.vue` - User attribute list
     - `UserAttributeNewView.vue` - Create attribute
     - `UserAttributeDetailView.vue` - Attribute detail

     **Logs:**
     - `LogsView.vue` - Log viewer with tabs for email, SMS, sign-in
     - `EmailLogDetailView.vue` - Email log detail
     - `SmsLogDetailView.vue` - SMS log detail
     - `SignInLogDetailView.vue` - Sign-in log detail

     **SAML:**
     - `SamlListView.vue` - SAML IDP list
     - `SamlNewView.vue` - Create SAML IDP
     - `SamlDetailView.vue` - SAML IDP detail

     **Account:**
     - `AccountView.vue` - User account management links

     **Auth:**
     - `LoginView.vue` - Login redirect page (initiates OAuth flow)

  2. Each view must:
     - Use `<script setup lang="ts">`
     - Import and use appropriate TanStack Query hooks
     - Import and use form composables for edit views
     - Include loading states (LoadingPage)
     - Include error handling (SubmitError display)
     - Use vue-i18n `$t()` for all text
     - Use RBAC checks for write operations

- **Context (read-only):**
  - `admin-panel/app/[lang]/dashboard/page.tsx` — Dashboard pattern
  - `admin-panel/app/[lang]/users/page.tsx` — List view pattern
  - `admin-panel/app/[lang]/users/[authId]/page.tsx` — Detail view pattern
  - `admin-panel/app/[lang]/apps/[id]/page.tsx:1-354` — App detail pattern
  - `admin-panel/app/[lang]/orgs/[id]/page.tsx` — Org detail pattern

- **Touched (will modify/create):**
  - CREATE: `admin-panel-vue/src/views/DashboardView.vue`
  - CREATE: `admin-panel-vue/src/views/UsersListView.vue`
  - CREATE: `admin-panel-vue/src/views/UserDetailView.vue`
  - CREATE: `admin-panel-vue/src/views/AppsListView.vue`
  - CREATE: `admin-panel-vue/src/views/AppNewView.vue`
  - CREATE: `admin-panel-vue/src/views/AppDetailView.vue`
  - CREATE: `admin-panel-vue/src/views/AppBannersView.vue`
  - CREATE: `admin-panel-vue/src/views/AppBannerNewView.vue`
  - CREATE: `admin-panel-vue/src/views/AppBannerDetailView.vue`
  - CREATE: `admin-panel-vue/src/views/OrgsListView.vue`
  - CREATE: `admin-panel-vue/src/views/OrgNewView.vue`
  - CREATE: `admin-panel-vue/src/views/OrgDetailView.vue`
  - CREATE: `admin-panel-vue/src/views/RolesListView.vue`
  - CREATE: `admin-panel-vue/src/views/RoleNewView.vue`
  - CREATE: `admin-panel-vue/src/views/RoleDetailView.vue`
  - CREATE: `admin-panel-vue/src/views/ScopesListView.vue`
  - CREATE: `admin-panel-vue/src/views/ScopeNewView.vue`
  - CREATE: `admin-panel-vue/src/views/ScopeDetailView.vue`
  - CREATE: `admin-panel-vue/src/views/UserAttributesListView.vue`
  - CREATE: `admin-panel-vue/src/views/UserAttributeNewView.vue`
  - CREATE: `admin-panel-vue/src/views/UserAttributeDetailView.vue`
  - CREATE: `admin-panel-vue/src/views/LogsView.vue`
  - CREATE: `admin-panel-vue/src/views/EmailLogDetailView.vue`
  - CREATE: `admin-panel-vue/src/views/SmsLogDetailView.vue`
  - CREATE: `admin-panel-vue/src/views/SignInLogDetailView.vue`
  - CREATE: `admin-panel-vue/src/views/SamlListView.vue`
  - CREATE: `admin-panel-vue/src/views/SamlNewView.vue`
  - CREATE: `admin-panel-vue/src/views/SamlDetailView.vue`
  - CREATE: `admin-panel-vue/src/views/AccountView.vue`
  - CREATE: `admin-panel-vue/src/views/LoginView.vue`

- **Interfaces / Contracts:**
  - Views receive route params via `useRoute()`
  - Views use TanStack Query hooks for data fetching
  - Views use form composables for edit functionality
  - All CRUD operations trigger cache invalidation

- **Tests:**
  Type: Manual E2E verification
  - Happy path: All pages render correctly with data
  - Happy path: CRUD operations work (create, read, update, delete)
  - Happy path: Pagination navigates through pages
  - Edge case: Error states display properly
  - Edge case: Loading states display during fetch

- **Migrations / Data:**
  N/A - UI views only

- **Observability:**
  - Console.error for failed API calls (development)
  - Error state display in UI

- **Security & Permissions:**
  - Write operations (Save, Delete) only visible to users with appropriate roles
  - Use `useAccess` composable for RBAC checks
  - Follow pattern from `admin-panel/app/[lang]/apps/[id]/page.tsx:55-59`

- **Performance:**
  - All views lazy-loaded in router
  - TanStack Query handles caching automatically
  - Avoid unnecessary re-fetches

- **Commands:**
  ```bash
  cd admin-panel-vue
  npm run type-check
  npm run dev
  # Manually test each view
  ```

- **Risks & Mitigations:**
  - **Risk:** Complex views may have subtle UI/UX differences from React version
    **Mitigation:** Carefully compare with existing admin-panel, test each feature
  - **Risk:** Some React patterns may not translate directly to Vue
    **Mitigation:** Use Vue equivalents (v-if vs ternary, v-for vs map, etc.)

---

## Verification (global)

- [ ] Run targeted tests ONLY for changed code:
  ```bash
  cd admin-panel-vue
  npm install                    # Verify dependencies install
  npm run dev                    # Verify dev server starts
  npm run build                  # Verify production build succeeds
  npm run type-check             # Verify no TypeScript errors
  ```
  **CRITICAL:** Do not run full-project checks (target only admin-panel-vue)
- [ ] All acceptance criteria met (see below)
- [ ] Code follows conventions from AI_PROMPT.md and PROMPT.md:
  - Vue 3 Composition API with `<script setup lang="ts">`
  - No `any` types - proper TypeScript interfaces
  - TanStack Query hooks follow naming conventions
  - Form validation with proper error messages
  - Loading states on all async operations
- [ ] Integration points properly implemented:
  - API proxy works: `/api/*` -> `http://localhost:8787`
  - OAuth authentication flow works
  - All CRUD operations work against real API
- [ ] Security requirements satisfied:
  - RBAC checks before showing admin features
  - No tokens logged or exposed
  - Auth guard protects all routes

---

## Acceptance Criteria

### Project Setup
- [X] `admin-panel-vue/` directory exists at project root
- [X] `npm install` succeeds without errors
- [X] `npm run dev` starts Vite dev server on port 5173
- [X] `npm run build` produces valid `dist/` folder
- [X] `npm run type-check` passes with no errors
- [X] Tailwind CSS v4 configured with @tailwindcss/vite
- [X] Path alias `@/` resolves to `src/`
- [X] Vite proxy configured for API routes
- [X] shadcn-vue components initialized (20+ components)

### Core Infrastructure
- [X] Vue 3 app mounts with Pinia, Router, vue-i18n, TanStack Query
- [X] Router has routes for all 28+ admin pages
- [X] Pinia stores created: auth, config, error
- [X] Axios client configured with auth interceptor
- [X] vue-i18n supports en/pt/fr locales

### API Layer
- [X] All 10 endpoint files created with TanStack Query hooks
- [X] Queries use proper queryKey structure for caching
- [X] Mutations invalidate related queries on success
- [X] Error handling consistent across all endpoints
- [X] TypeScript types match existing DTOs (100+ types)

### Components
- [X] All shadcn-vue components initialized (button, input, table, etc.)
- [X] All 4 layout components created (MainLayout, Sidebar, Breadcrumb, PageTitle)
- [X] All 12 shared components created (SaveButton, DeleteButton, Pagination, etc.)
- [X] All 7 form composables created
- [X] Components follow Vue 3 Composition API patterns

### Views
- [X] All 28+ page views created with proper routing
- [X] List views have search and pagination
- [ ] Detail views have edit forms with validation
- [ ] Create views have forms with validation
- [X] Views handle loading and error states
- [X] Views use TanStack Query hooks

### Authentication
- [X] OAuth login flow works (redirect to auth server)
- [X] Token stored in auth store
- [X] Auth guard on protected routes
- [X] Role-based access control (useAccess)
- [X] Logout functionality works

### i18n
- [X] en.json, pt.json, fr.json translation files created
- [X] All UI text uses vue-i18n `$t()` function
- [X] Locale persists across navigation
- [X] All translation keys from admin-panel ported

---

## Impact Analysis

- **Directly impacted:**
  - `admin-panel-vue/` (new directory, ~70 files)
  - `admin-panel-vue/package.json` (new)
  - `admin-panel-vue/vite.config.ts` (new)
  - `admin-panel-vue/src/**/*` (all new files)

- **Indirectly impacted:**
  - Future deployment configuration (Cloudflare Pages, Netlify)
  - Project documentation may need updates
  - CI/CD pipeline may need updates to build/deploy new project
  - API server must be running for admin panel to work

---

## User Accessibility Checklist

**CRITICAL: Features that users cannot discover or access are USELESS.**

### Discoverability (How users FIND this feature)
- [ ] **Feature is discoverable:** Users access via URL (localhost:5173 in dev)
  - Web: Direct URL access to admin panel
  - How: Navigate to http://localhost:5173, redirects to OAuth login, then dashboard

### Workflow Completeness (Users can do the FULL action)
- [ ] **Entry point exists:** User navigates to localhost:5173
  - Entry: URL navigation
- [ ] **Action is complete:** All CRUD operations available
  - Create: New buttons on list pages
  - Read: List and detail pages
  - Update: Edit forms on detail pages
  - Delete: Delete buttons with confirmation
- [ ] **Result is visible:** Users see updated data after operations
  - Feedback: TanStack Query cache invalidation refreshes lists

### Replaced/Modified Features (No broken references)
- [ ] **Old references updated:** N/A - This is a new parallel implementation
  - Old feature: admin-panel/ (Next.js) remains unchanged
  - Action: Both can run simultaneously during migration
- [ ] **No dead ends:** All routes properly configured
  - Old path works: N/A

### User Journey Validation
- [ ] **Complete flow possible:** User can do entire admin workflow
  - Flow: "User navigates to localhost:5173 -> OAuth login -> Dashboard -> Navigate to Users/Apps/Orgs -> View list -> Click item -> Edit -> Save -> See updated list"
- [ ] **No hidden knowledge:** All navigation via sidebar menu
  - No need to know internal routes or file structure

---

## Follow-ups

- OAuth integration may require `@melody-auth/vue` package if available, otherwise implement OAuth PKCE flow manually
- Mobile responsiveness testing needed after basic implementation
- E2E tests (Playwright/Cypress) could be added in a future task
- Theme customization (modern/cool theme) may be a separate enhancement task

---

## Diff Test Plan

**Testing Approach:** Manual verification for UI scaffolding project

| Changed Area | Test Scenarios |
|-------------|----------------|
| Project setup | `npm install`, `npm run dev`, `npm run build`, `npm run type-check` all succeed |
| Router | Navigation between all routes works, auth guard redirects to login |
| Stores | Auth state persists, config loads from API |
| API hooks | Queries fetch data, mutations update and invalidate |
| Components | All components render without errors |
| Views | All CRUD operations work end-to-end |
| i18n | Language switching works, all keys translated |

**Known Out-of-Scope:**
- Unit tests for components (visual testing deferred)
- E2E tests (separate task)
- Mobile responsiveness fine-tuning


## RELEVANT PREVIOUS TASKS CONTEXT:
These are from tasks that touched the same files or patterns: 
- /home/pedro/storage/www/goauth.me/.claudiomiro/AI_PROMPT.md
- /home/pedro/storage/www/goauth.me/.claudiomiro/TASK1/RESEARCH.md

