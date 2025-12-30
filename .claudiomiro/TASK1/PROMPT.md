## PROMPT

Create the complete `admin-panel-vue/` Vue 3 static SPA project that replaces the existing Next.js React admin panel. This is a full implementation including project setup, shadcn-vue component library, TanStack Query API layer, all 25+ admin views, form composables, stores, routing, i18n, and OAuth authentication.

**You are building a production-ready admin panel.** Every CRUD operation (users, apps, orgs, roles, scopes, user attributes, SAML, logs) must work end-to-end with the existing API server.

## COMPLEXITY

High

## CONTEXT REFERENCE

**For complete environment context, read:**
- `/home/pedro/storage/www/goauth.me/.claudiomiro/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create

New directory structure at `admin-panel-vue/`:
```
admin-panel-vue/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── components.json          # shadcn-vue config
├── .env.example
├── index.html
└── src/
    ├── main.ts
    ├── App.vue
    ├── router/index.ts
    ├── stores/
    │   ├── auth.ts
    │   ├── config.ts
    │   └── error.ts
    ├── api/
    │   ├── client.ts
    │   └── endpoints/
    │       ├── users.ts
    │       ├── apps.ts
    │       ├── orgs.ts
    │       ├── roles.ts
    │       ├── scopes.ts
    │       ├── userAttributes.ts
    │       ├── logs.ts
    │       ├── saml.ts
    │       ├── appBanners.ts
    │       └── orgGroups.ts
    ├── composables/
    │   ├── useAuth.ts
    │   ├── useAccess.ts
    │   └── forms/
    │       ├── useAppForm.ts
    │       ├── useOrgForm.ts
    │       ├── useUserForm.ts
    │       ├── useRoleForm.ts
    │       ├── useScopeForm.ts
    │       ├── useUserAttributeForm.ts
    │       └── useSamlForm.ts
    ├── components/
    │   ├── ui/               # shadcn-vue components
    │   ├── layout/           # 4 components
    │   └── shared/           # 12 components
    ├── views/                # 25+ views
    ├── i18n/
    │   ├── index.ts
    │   └── locales/
    │       ├── en.json
    │       ├── pt.json
    │       └── fr.json
    ├── lib/utils.ts          # shadcn-vue utils
    └── styles/main.css
```

### Reference Files to Study

Before implementing, read these files to understand existing patterns:

**API Layer (port RTK Query to TanStack Query):**
- `admin-panel/services/auth/api.ts` - Full API with types and cache tags

**Pages (port React to Vue):**
- `admin-panel/app/[lang]/dashboard/page.tsx`
- `admin-panel/app/[lang]/users/page.tsx`
- `admin-panel/app/[lang]/users/[authId]/page.tsx`
- `admin-panel/app/[lang]/apps/page.tsx`
- `admin-panel/app/[lang]/apps/[id]/page.tsx`
- `admin-panel/app/[lang]/orgs/page.tsx`
- `admin-panel/app/[lang]/orgs/[id]/page.tsx`

**Components (port shadcn/ui to shadcn-vue):**
- `admin-panel/components/ui/` - shadcn/ui components
- `admin-panel/components/Pagination.tsx`
- `admin-panel/components/PageTitle.tsx`
- `admin-panel/components/SaveButton.tsx`
- `admin-panel/components/DeleteButton.tsx`

**Translations:**
- `admin-panel/translations/en.json` - Full translation structure

### API Endpoints

Admin Panel calls these endpoints:
```
GET/POST/PUT/DELETE /api/v1/users/*
GET/POST/PUT/DELETE /api/v1/apps/*
GET/POST/PUT/DELETE /api/v1/orgs/*
GET/POST/PUT/DELETE /api/v1/roles/*
GET/POST/PUT/DELETE /api/v1/scopes/*
GET/POST/PUT/DELETE /api/v1/user-attributes/*
GET /api/v1/logs/*
GET/POST/PUT/DELETE /api/v1/saml/idps/*
GET/POST/PUT/DELETE /api/v1/app-banners/*
GET/POST/PUT/DELETE /api/v1/org-groups/*
```

### Dependencies to Install

```json
{
  "dependencies": {
    "vue": "^3.4",
    "vue-router": "^4.3",
    "pinia": "^2.1",
    "vue-i18n": "^9.10",
    "@tanstack/vue-query": "^5.24",
    "axios": "^1.6",
    "@vueuse/core": "^10.7",
    "radix-vue": "^1.9",
    "class-variance-authority": "^0.7",
    "clsx": "^2.1",
    "tailwind-merge": "^2.2",
    "lucide-vue-next": "^0.372"
  },
  "devDependencies": {
    "vite": "^5.4",
    "@vitejs/plugin-vue": "^5.0",
    "typescript": "^5.5",
    "tailwindcss": "^4.0",
    "@tailwindcss/vite": "^4.0",
    "vue-tsc": "^2.0"
  }
}
```

### shadcn-vue Components to Initialize

```bash
npx shadcn-vue@latest init
npx shadcn-vue@latest add button input textarea label card table \
  badge checkbox switch select alert alert-dialog dropdown-menu \
  separator skeleton tooltip sheet sidebar breadcrumb pagination \
  navigation-menu
```

## EXTRA DOCUMENTATION

### TanStack Query Pattern (porting from RTK Query)

RTK Query:
```ts
export const api = createApi({
  endpoints: (builder) => ({
    getUsers: builder.query({ query: () => '/users', providesTags: ['User'] }),
    createUser: builder.mutation({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['User']
    })
  })
})
```

TanStack Query (Vue):
```ts
// api/endpoints/users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { client } from '../client'

export const useUsers = (params: Ref<UserQueryParams>) => {
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

### Axios Client with Auth

```ts
// api/client.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

client.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      await auth.refreshToken()
      return client.request(error.config)
    }
    throw error
  }
)
```

### Vue Router with Guards

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('@/views/LoginView.vue') },
    {
      path: '/',
      component: () => import('@/components/layout/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: () => import('@/views/DashboardView.vue') },
        { path: 'users', component: () => import('@/views/UsersListView.vue') },
        { path: 'users/:authId', component: () => import('@/views/UserDetailView.vue') },
        // ... all other routes
      ]
    }
  ]
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }
})
```

### Vite Proxy Configuration

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
})
```

## LAYER

1

## PARALLELIZATION

Parallel with: TASK0

## CONSTRAINTS

- IMPORTANT: Do not perform any git commit or git push.
- Prefer CLI or script-based actions over manual edits
- Use shadcn-vue CLI for component initialization
- Use Tailwind CSS v4 with @tailwindcss/vite (NOT PostCSS config)
- Must work with existing API server at port 8787/8788
- DO NOT modify existing `admin-panel/` - this is a replacement, not refactor
- DO NOT use React patterns - pure Vue 3 Composition API
- DO NOT create mock data - use real API calls
- All admin pages must be implemented (see AI_PROMPT.md Section 3)
- All 3 locales must have translation files (en, pt, fr)
- TypeScript strict mode - no `any` types
- Mobile-responsive layouts required
- OAuth login flow must work with existing server

## VERIFICATION COMMANDS

After implementation, run these to verify:
```bash
cd admin-panel-vue
npm install
npm run dev          # Should start dev server
npm run build        # Should produce dist/
npm run type-check   # Should pass with no errors
```

## SUCCESS CRITERIA

The admin-panel-vue project is complete when:
1. All admin pages render correctly
2. OAuth login flow works
3. All CRUD operations work (users, apps, orgs, roles, scopes, attributes, SAML)
4. TanStack Query caches and invalidates correctly
5. Forms validate and show errors
6. Pagination works on list views
7. i18n works in all 3 locales
8. Role-based access control hides unauthorized features
9. Build produces valid static files for deployment
