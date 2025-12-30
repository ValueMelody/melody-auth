# Research for TASK1

## Context Reference
**For tech stack and conventions, see:**
- `/home/pedro/storage/www/goauth.me/.claudiomiro/AI_PROMPT.md` - Universal context (Vue 3 + Vite + TanStack Query + shadcn-vue + Pinia + vue-i18n)
- `/home/pedro/storage/www/goauth.me/.claudiomiro/TASK1/TASK.md` - Task-level context (Admin Panel Vue SPA)
- `/home/pedro/storage/www/goauth.me/.claudiomiro/TASK1/PROMPT.md` - Task-specific context (dependencies, patterns)

**This file contains ONLY new information discovered during research.**

## Task Understanding Summary
Create complete `admin-panel-vue/` Vue 3 SPA replacing the Next.js React admin panel with all CRUD views, TanStack Query API layer, shadcn-vue components, Pinia stores, vue-i18n, and OAuth authentication.

## Files Discovered to Read/Modify

### Reference Implementation Files (Read-Only)
These files provide patterns to port but should not be modified:

| File | Lines | Purpose |
|------|-------|---------|
| `admin-panel/services/auth/api.ts` | 1-1699 | RTK Query endpoints, tag types, ALL TypeScript types (DTOs) |
| `admin-panel/tools/access.ts` | 1-57 | RBAC implementation - directly portable |
| `admin-panel/tools/type.ts` | 1-33 | Enum definitions (Scope, Role, ClientType, BannerType) |
| `admin-panel/app/Setup.tsx` | 58-480 | Layout, sidebar structure, auth setup, RBAC guards |
| `admin-panel/app/[lang]/orgs/useEditOrg.tsx` | 1-188 | Form hook pattern reference |
| `admin-panel/app/[lang]/orgs/[id]/page.tsx` | 1-604 | Detail view pattern with all CRUD operations |
| `admin-panel/components/SaveButton.tsx` | 1-32 | Simple button component pattern |
| `admin-panel/components/DeleteButton.tsx` | 1-60 | Button with confirmation modal pattern |
| `admin-panel/translations/en.json` | 1-277 | Full translation structure to port |
| `admin-panel/translations/pt.json` | - | Portuguese translations |
| `admin-panel/translations/fr.json` | - | French translations |
| `admin-panel/components.json` | 1-21 | shadcn config pattern (style: new-york) |

### Existing Vue Pattern Reference
| File | Purpose |
|------|---------|
| `sdks/vue-sdk/src/useAuth.ts:1-180` | Vue 3 composable pattern with inject(), computed(), proper typing |
| `sdks/vue-sdk/src/plugin.ts` | Vue plugin pattern using App.provide() |
| `sdks/vue-sdk/src/context.ts` | InjectionKey definition for provide/inject |

## Code Patterns Found

### 1. RTK Query to TanStack Query Migration Pattern
**Source:** `admin-panel/services/auth/api.ts:1-200`

RTK Query pattern:
```typescript
build.query<Response, Args>({
  query: () => ({ url: '/api/v1/orgs' }),
  providesTags: ['Orgs'],
})
build.mutation<Response, Args>({
  query: (queryArg) => ({ url: `/api/v1/orgs/${queryArg.id}`, method: 'PUT', body: queryArg.putOrgReq }),
  invalidatesTags: ['Orgs'],
})
```

**Vue TanStack Query equivalent:**
```typescript
// queries
export const useOrgs = () => useQuery({ queryKey: ['orgs'], queryFn: () => client.get('/api/v1/orgs') })
export const useOrg = (id: Ref<number>) => useQuery({ queryKey: ['orgs', id], queryFn: () => client.get(`/api/v1/orgs/${id.value}`) })

// mutations
export const useUpdateOrg = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PutOrgReq }) => client.put(`/api/v1/orgs/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orgs'] })
  })
}
```

### 2. Form Hook to Composable Migration Pattern
**Source:** `admin-panel/app/[lang]/orgs/useEditOrg.tsx:1-188`

React pattern uses:
- Individual `useState` for each field (lines 11-30)
- `useEffect` to initialize from prop (lines 32-56)
- `useMemo` for values object (lines 58-103)
- `useMemo` for errors object with validation (lines 105-111)
- `onChange` switch handler (lines 113-177)

**Vue composable equivalent:**
```typescript
export function useOrgForm(org: Ref<Org | undefined>) {
  const { t } = useI18n()

  // Reactive form state
  const form = reactive({
    name: '',
    slug: '',
    allowPublicRegistration: true,
    // ... all fields
  })

  // Watch org changes and reset form
  watch(org, (newOrg) => {
    if (newOrg) Object.assign(form, newOrg)
  }, { immediate: true })

  // Computed errors
  const errors = computed(() => ({
    name: form.name.trim() ? undefined : t('common.fieldIsRequired'),
    slug: form.slug.trim() ? undefined : t('common.fieldIsRequired'),
  }))

  return { form, errors }
}
```

### 3. RBAC Pattern (Directly Portable)
**Source:** `admin-panel/tools/access.ts:1-57`

```typescript
export enum Access {
  ReadUser = 'ReadUser', WriteUser = 'WriteUser',
  ReadApp = 'ReadApp', WriteApp = 'WriteApp',
  ReadOrg = 'ReadOrg', WriteOrg = 'WriteOrg',
  // ... etc
}

export const isAllowedAccess = (access: Access, roles?: string[]): boolean => {
  const allowedRoles = getAllowedRoles(roles ?? [])
  return allowedRoles.some((role) => RoleAccesses[role].includes(access))
}
```

This is pure TypeScript - copy directly to `src/composables/useAccess.ts`

### 4. Component Props Pattern
**Source:** `admin-panel/components/SaveButton.tsx:5-15`

```typescript
// React
const SaveButton = ({
  onClick, className, disabled = false, isLoading = false,
}: { onClick: () => void; className?: string; disabled?: boolean; isLoading?: boolean }) => {}
```

**Vue equivalent:**
```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{
  disabled?: boolean
  loading?: boolean
  class?: string
}>(), { disabled: false, loading: false })

const emit = defineEmits<{ click: [] }>()
</script>
```

### 5. Page View Pattern
**Source:** `admin-panel/app/[lang]/orgs/[id]/page.tsx:1-604`

Key patterns:
- Route params via `useParams()` (line 50) → Vue: `useRoute().params`
- RTK Query hooks (lines 60-65) → TanStack Query hooks
- Form hook (lines 98-100) → Form composable
- RBAC check (lines 89-96) → `useAccess()` composable
- Error display with `showErrors` state (line 101, 173)
- Loading state check (line 137)
- Conditional rendering based on permissions (lines 492-508, 510-598)

### 6. shadcn-vue Configuration
**Source:** `admin-panel/components.json:1-21`

Key settings to preserve:
- `"style": "new-york"` - Component variant style
- `"tailwind.cssVariables": true` - Use CSS variables for theming
- `"aliases.components": "@/components"` - Path aliases
- `"iconLibrary": "lucide"` - Use lucide-vue-next icons

## Integration & Impact Analysis

### API Endpoints (No Changes Needed)
All endpoints are already implemented in the server. Vue app just consumes them:
- `GET/POST /api/v1/scopes`, `GET/PUT/DELETE /api/v1/scopes/:id`
- `GET/POST /api/v1/roles`, `GET/PUT/DELETE /api/v1/roles/:id`
- `GET/POST /api/v1/orgs`, `GET/PUT/DELETE /api/v1/orgs/:id`
- `GET/POST /api/v1/apps`, `GET/PUT/DELETE /api/v1/apps/:id`
- `GET/POST /api/v1/users`, `GET/PUT/DELETE /api/v1/users/:authId`
- `GET/POST /api/v1/user-attributes`, `GET/PUT/DELETE /api/v1/user-attributes/:id`
- `GET /api/v1/logs/*`
- `GET/POST /api/v1/saml/idps`, `GET/PUT/DELETE /api/v1/saml/idps/:id`
- `GET/POST /api/v1/app-banners`, `GET/PUT/DELETE /api/v1/app-banners/:id`
- `GET/POST /api/v1/org-groups`, `GET/PUT/DELETE /api/v1/org-groups/:id`

### TypeScript Types to Port
**Source:** `admin-panel/services/auth/api.ts:1322-1675`

Entity types (copy directly):
- `Scope`, `ScopeDetail`, `PostScopeReq`, `PutScopeReq` (lines 1322-1358)
- `Role`, `PostRoleReq`, `PutRoleReq` (lines 1359-1374)
- `User`, `UserDetail`, `PutUserReq` (lines 1375-1394, 1541-1568)
- `Org`, `PostOrgReq`, `PutOrgReq` (lines 1395-1452)
- `OrgGroup`, `PostOrgGroupReq`, `PutOrgGroupReq` (lines 1453-1467)
- `App`, `AppDetail`, `CreatedAppDetail`, `PostAppReq`, `PutAppReq` (lines 1468-1506)
- `Banner`, `AppBanner`, `PostAppBannerReq`, `PutAppBannerReq` (lines 1507-1540)
- `UserAttribute`, `PostUserAttributeReq`, `PutUserAttributeReq` (lines 1578-1617)
- `EmailLog`, `SmsLog`, `SignInLog` (lines 1618-1646)
- `SamlIdp`, `PostSamlIdpReq`, `PutSamlIdpReq` (lines 1647-1675)
- `UserConsentedApp`, `UserPasskey` (lines 1569-1577)

### Authentication Integration
**Source:** `sdks/vue-sdk/src/useAuth.ts:1-180`

The existing `@melody-auth/vue` SDK provides:
- `useAuth()` composable with `isAuthenticated`, `isAuthenticating`
- `loginRedirect()`, `loginPopup()`, `logoutRedirect()`
- `acquireToken()`, `acquireUserInfo()`
- `userInfo` computed with roles

**Integration:** Install `@melody-auth/vue` and wrap app in `AuthProvider`

### Cache Tags to Query Keys Mapping
**Source:** `admin-panel/services/auth/api.ts:2-14`

```
RTK Tag      → TanStack QueryKey
'Scopes'     → ['scopes']
'Roles'      → ['roles']
'Orgs'       → ['orgs']
'Org Groups' → ['org-groups']
'Apps'       → ['apps']
'App Banners'→ ['app-banners']
'Users'      → ['users']
'User Org Groups' → ['user-org-groups']
'User Attributes' → ['user-attributes']
'Logs'       → ['logs']
'SAML'       → ['saml']
```

## Test Strategy Discovered

### No Automated Tests Required for Initial Scaffold
Per TODO.md verification section:
- `npm install` - verify dependencies install
- `npm run dev` - verify dev server starts
- `npm run build` - verify production build succeeds
- `npm run type-check` - verify no TypeScript errors

### Manual E2E Verification
Test each CRUD operation:
1. Navigate to list view → verify data loads
2. Click create → fill form → save → verify appears in list
3. Click item → edit form → save → verify updates
4. Delete with confirmation → verify removes from list
5. Verify pagination on list views
6. Verify search filters work
7. Verify RBAC hides unauthorized actions

## Risks & Challenges Identified

### 1. shadcn-vue CLI Interactive Prompts
**Risk:** CLI may prompt for input during `npx shadcn-vue@latest init`
**Mitigation:** Pre-create `components.json` with all settings before running init

### 2. Tailwind CSS v4 Setup Differences
**Risk:** v4 uses `@import "tailwindcss"` not `@tailwind` directives
**Mitigation:** Follow Tailwind v4 + Vite docs, use `@tailwindcss/vite` plugin

### 3. @melody-auth/vue Package Availability
**Risk:** May need to check if package is published to npm
**Mitigation:** Check `sdks/vue-sdk/package.json` for publish status; may need to use local path or build from source

### 4. OAuth PKCE Flow
**Risk:** Token refresh and auth state management complexity
**Mitigation:** Use existing `@melody-auth/vue` SDK patterns from `sdks/vue-sdk/`

### 5. Large Number of Files (~70 files)
**Risk:** Many files to create may lead to inconsistencies
**Mitigation:** Follow patterns strictly, verify type-check after each major section

## Execution Strategy Recommendation

### Phase 1: Project Scaffolding (Item 1)
1. Create directory: `mkdir admin-panel-vue && cd admin-panel-vue`
2. Initialize Vite+Vue: `npm create vite@latest . -- --template vue-ts`
3. Install dependencies per PROMPT.md:120-145
4. Configure vite.config.ts with @tailwindcss/vite and proxy
5. Configure tsconfig.json with path aliases
6. Create src/styles/main.css with Tailwind v4 imports
7. Create .env.example
8. Initialize shadcn-vue: `npx shadcn-vue@latest init` then add all components
9. Verify: `npm run dev` and `npm run type-check`

### Phase 2: Core Infrastructure (Item 2)
1. Create Pinia stores: `src/stores/auth.ts`, `src/stores/config.ts`, `src/stores/error.ts`
2. Create axios client: `src/api/client.ts` with auth interceptor
3. Set up TanStack Query in `src/main.ts`
4. Verify stores load without errors

### Phase 3: Router + i18n + Layout (Item 3)
1. Create `src/router/index.ts` with all routes (lazy-loaded)
2. Set up vue-i18n in `src/i18n/index.ts`
3. Copy and adapt translation files from `admin-panel/translations/`
4. Create layout components: MainLayout, Sidebar, Breadcrumb, PageTitle
5. Verify navigation works

### Phase 4: API Layer (Item 4)
1. Port types from `admin-panel/services/auth/api.ts:1322-1675` to `src/api/types.ts`
2. Create TanStack Query hooks in `src/api/endpoints/`:
   - users.ts, apps.ts, orgs.ts, roles.ts, scopes.ts
   - userAttributes.ts, logs.ts, saml.ts, appBanners.ts, orgGroups.ts
3. Verify type-check passes

### Phase 5: Shared Components (Item 5)
1. Create shared components: SaveButton, DeleteButton, Pagination, etc.
2. Create form composables: useAppForm, useOrgForm, useUserForm, etc.
3. Create utility composables: useAuth wrapper, useAccess (port from tools/access.ts)

### Phase 6: All Views (Item 6)
1. Create each view following the pattern from `admin-panel/app/[lang]/orgs/[id]/page.tsx`
2. Use TanStack Query hooks for data
3. Use form composables for forms
4. Use RBAC checks for permissions
5. Test each CRUD operation manually

## Reusable Components Identified

### Directly Portable (Pure TypeScript)
- `admin-panel/tools/access.ts` → `src/composables/useAccess.ts`
- `admin-panel/tools/type.ts` → `src/utils/types.ts`
- `admin-panel/services/auth/api.ts:1322-1675` (types only) → `src/api/types.ts`

### Translation Files (JSON - Direct Copy)
- `admin-panel/translations/en.json` → `src/i18n/locales/en.json`
- `admin-panel/translations/pt.json` → `src/i18n/locales/pt.json`
- `admin-panel/translations/fr.json` → `src/i18n/locales/fr.json`

### Pattern References (Adapt to Vue)
- Component structure from `admin-panel/components/ui/`
- Page layout from `admin-panel/app/Setup.tsx:143-440`
- Form hooks from `admin-panel/app/[lang]/*/useEdit*.ts`
