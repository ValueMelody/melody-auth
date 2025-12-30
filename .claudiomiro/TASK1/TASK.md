@dependencies []
# Task: Admin Panel Vue.js SPA Implementation

## Summary

Create the complete `admin-panel-vue/` Vue 3 static SPA that replaces the existing Next.js React admin panel in `admin-panel/`. This includes all 15+ admin views, TanStack Query API layer, shadcn-vue component library, Pinia stores, Vue Router configuration, vue-i18n setup, and OAuth-based authentication.

This project provides the administrative interface for managing users, apps, organizations, roles, scopes, user attributes, SAML IDPs, and viewing logs.

## Context Reference

**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**

### Files This Task Will Create
- `admin-panel-vue/` - New directory at project root
- All files under `admin-panel-vue/src/` as specified in acceptance criteria (~70 files)

### Reference Implementations to Port
- `admin-panel/app/[lang]/*` - All admin pages with i18n routing
- `admin-panel/services/auth/api.ts` - RTK Query API layer with full types
- `admin-panel/components/` - React components with shadcn/ui
- `admin-panel/translations/*.json` - Translation files (en.json, fr.json, pt.json)

### Key Patterns to Follow
- API layer in `admin-panel/services/auth/api.ts` uses RTK Query with tag-based cache invalidation
- Port to TanStack Query with similar patterns (queryKey, mutations, invalidateQueries)
- shadcn/ui React components map to shadcn-vue equivalents
- OAuth token management in services layer

## Complexity

High

## Dependencies

Depends on: None
Blocks: None
Parallel with: TASK0

## Detailed Steps

### 1. Project Initialization
1. Create `admin-panel-vue/` directory at project root
2. Initialize Vite + Vue 3 + TypeScript project
3. Install all dependencies (vue, vue-router, pinia, vue-i18n, @tanstack/vue-query, axios, radix-vue, etc.)
4. Configure Tailwind CSS v4 with @tailwindcss/vite
5. Set up `tsconfig.json` with path aliases (`@/`)
6. Configure `vite.config.ts` with proxy for `/api/*`
7. Create `.env.example` with `VITE_API_URL`, `VITE_CLIENT_ID`, etc.
8. Initialize shadcn-vue with CLI (all listed components)

### 2. Core Infrastructure
1. Create `src/main.ts` with Vue app, Pinia, Router, vue-i18n, TanStack Query
2. Create `src/App.vue` root component with MainLayout and router-view
3. Set up `src/router/index.ts` with routes for all admin pages
4. Create Pinia stores:
   - `src/stores/auth.ts` - OAuth token management, user session
   - `src/stores/config.ts` - System configuration
   - `src/stores/error.ts` - Global error handling
5. Set up vue-i18n in `src/i18n/index.ts` with locale detection
6. Create axios client in `src/api/client.ts` with auth interceptor

### 3. TanStack Query API Layer
Create in `src/api/endpoints/`:
- `users.ts` - User CRUD (list, get, create, update, delete, manage roles/orgs)
- `apps.ts` - App CRUD with scopes, redirect URIs, MFA config
- `orgs.ts` - Organization CRUD with branding, groups
- `roles.ts` - Role CRUD
- `scopes.ts` - Scope CRUD with locale descriptions
- `userAttributes.ts` - User attribute CRUD
- `logs.ts` - Email, SMS, sign-in log queries
- `saml.ts` - SAML IDP CRUD
- `appBanners.ts` - App banner CRUD
- `orgGroups.ts` - Organization group CRUD

### 4. shadcn-vue Components
Initialize with CLI:
- button, input, textarea, label, card, table
- badge, checkbox, switch, select
- alert, alert-dialog, dropdown-menu
- separator, skeleton, tooltip, sheet
- sidebar, breadcrumb, pagination, navigation-menu

Create custom wrapper components if needed.

### 5. Layout Components
Create in `src/components/layout/`:
- MainLayout.vue - Full admin layout with sidebar
- Sidebar.vue - Navigation sidebar with collapsible sections
- Breadcrumb.vue - Page breadcrumb navigation
- PageTitle.vue - Page header with title and actions

### 6. Shared Components
Create in `src/components/shared/`:
- SaveButton.vue - Form save with loading state
- DeleteButton.vue - Delete with confirmation
- CreateButton.vue - New entity creation
- UserTable.vue - Paginated user list table
- Pagination.vue - Generic pagination controls
- ConfirmModal.vue - Confirmation dialog wrapper
- FieldError.vue - Form field error display
- LoadingPage.vue - Full-page loading state
- LocaleEditor.vue - Multi-locale text editor
- ColorInput.vue - Color picker input
- LinkInput.vue - URL input with validation
- ScopesEditor.vue - Scope selection editor

### 7. Form Composables
Create in `src/composables/forms/`:
- useAppForm.ts - App creation/editing
- useOrgForm.ts - Organization creation/editing
- useUserForm.ts - User editing
- useRoleForm.ts - Role creation/editing
- useScopeForm.ts - Scope creation/editing
- useUserAttributeForm.ts - User attribute creation/editing
- useSamlForm.ts - SAML IDP creation/editing

Create in `src/composables/`:
- useAuth.ts - OAuth flow, token refresh
- useAccess.ts - Role-based access control

### 8. Page Views
Create in `src/views/`:

**Dashboard:**
- DashboardView.vue

**Users:**
- UsersListView.vue
- UserDetailView.vue

**Apps:**
- AppsListView.vue
- AppNewView.vue
- AppDetailView.vue
- AppBannersView.vue (nested routes for banner management)

**Organizations:**
- OrgsListView.vue
- OrgNewView.vue
- OrgDetailView.vue

**Roles:**
- RolesListView.vue
- RoleNewView.vue
- RoleDetailView.vue

**Scopes:**
- ScopesListView.vue
- ScopeNewView.vue
- ScopeDetailView.vue

**User Attributes:**
- UserAttributesListView.vue
- UserAttributeNewView.vue
- UserAttributeDetailView.vue

**Logs:**
- LogsView.vue (with tabs for email, SMS, sign-in)
- EmailLogDetailView.vue
- SmsLogDetailView.vue
- SignInLogDetailView.vue

**SAML:**
- SamlListView.vue
- SamlNewView.vue
- SamlDetailView.vue

**Account:**
- AccountView.vue

### 9. i18n Setup
1. Create translation files in `src/i18n/locales/`:
   - en.json, pt.json, fr.json
2. Port translations from `admin-panel/translations/*.json`
3. Maintain same namespace structure (layout, common, dashboard, apps, users, etc.)

### 10. Verification
1. Run `npm install` - verify success
2. Run `npm run dev` - verify dev server starts
3. Run `npm run build` - verify production build
4. Run `npm run type-check` - verify no TypeScript errors
5. Verify OAuth login flow works
6. Verify CRUD operations for all entities

## Acceptance Criteria

### Project Setup
- [ ] `admin-panel-vue/` directory exists at project root
- [ ] `npm install` succeeds without errors
- [ ] `npm run dev` starts Vite dev server
- [ ] `npm run build` produces valid `dist/` folder
- [ ] `npm run type-check` passes with no errors
- [ ] Tailwind CSS v4 configured with @tailwindcss/vite
- [ ] Path alias `@/` resolves to `src/`
- [ ] Vite proxy configured for API routes
- [ ] shadcn-vue components initialized

### Core Infrastructure
- [ ] Vue 3 app mounts with Pinia, Router, vue-i18n, TanStack Query
- [ ] Router has routes for all admin pages
- [ ] Pinia stores created: auth, config, error
- [ ] Axios client configured with auth interceptor
- [ ] vue-i18n supports en/pt/fr locales

### API Layer
- [ ] All 10 endpoint files created with TanStack Query hooks
- [ ] Queries use proper queryKey structure for caching
- [ ] Mutations invalidate related queries on success
- [ ] Error handling consistent across all endpoints
- [ ] TypeScript types match existing DTOs

### Components
- [ ] All shadcn-vue components initialized
- [ ] All 4 layout components created
- [ ] All 12 shared components created
- [ ] Components follow Vue 3 Composition API patterns

### Views
- [ ] All 25+ page views created with proper routing
- [ ] List views have search, pagination
- [ ] Detail views have edit forms with validation
- [ ] Create views have forms with validation
- [ ] Views handle loading and error states
- [ ] Views use TanStack Query hooks

### Authentication
- [ ] OAuth login flow works
- [ ] Token refresh on expiry
- [ ] Auth guard on protected routes
- [ ] Role-based access control (useAccess)

### i18n
- [ ] en.json, pt.json, fr.json translation files created
- [ ] All UI text uses vue-i18n `$t()` function
- [ ] Locale persists across navigation

## Code Review Checklist

- [ ] Uses Vue 3 Composition API with `<script setup lang="ts">`
- [ ] No `any` types - proper TypeScript interfaces
- [ ] TanStack Query hooks follow naming conventions (useQuery, useMutation)
- [ ] Form validation with proper error messages
- [ ] Loading states on all async operations
- [ ] Error handling with user-friendly messages
- [ ] RBAC checked before showing admin features
- [ ] Follows patterns from existing Next.js implementation

## Reasoning Trace

**Why single task for Admin Panel?**
All admin views share:
- Same TanStack Query patterns
- Same shadcn-vue components
- Same layout (sidebar, breadcrumb, page title)
- Same form patterns
- Same CRUD operations pattern

Splitting by entity (users, apps, orgs) would:
- Repeat TanStack Query setup overhead
- Repeat shadcn-vue initialization
- Create coordination issues for shared components

**Why TanStack Query over RTK Query?**
TanStack Query is the Vue ecosystem standard for server state. It provides:
- First-class Vue 3 support
- Similar concepts to RTK Query (invalidation, caching)
- Smaller bundle size
- Better Vue integration than trying to use RTK with Vue

**Why shadcn-vue?**
The existing admin panel uses shadcn/ui (React). shadcn-vue is the official Vue port with:
- Same API and component structure
- Same Radix primitives (radix-vue)
- Same Tailwind styling approach
- Easy migration path
