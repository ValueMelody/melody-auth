import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/',
      component: () => import('@/components/layout/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
        { path: 'users', name: 'users', component: () => import('@/views/UsersListView.vue') },
        { path: 'users/:authId', name: 'user-detail', component: () => import('@/views/UserDetailView.vue') },
        { path: 'apps', name: 'apps', component: () => import('@/views/AppsListView.vue') },
        { path: 'apps/new', name: 'app-new', component: () => import('@/views/AppNewView.vue') },
        { path: 'apps/:id', name: 'app-detail', component: () => import('@/views/AppDetailView.vue') },
        { path: 'apps/banners', name: 'app-banners', component: () => import('@/views/AppBannersView.vue') },
        { path: 'apps/banners/new', name: 'app-banner-new', component: () => import('@/views/AppBannerNewView.vue') },
        { path: 'apps/banners/:id', name: 'app-banner-detail', component: () => import('@/views/AppBannerDetailView.vue') },
        { path: 'orgs', name: 'orgs', component: () => import('@/views/OrgsListView.vue') },
        { path: 'orgs/new', name: 'org-new', component: () => import('@/views/OrgNewView.vue') },
        { path: 'orgs/:id', name: 'org-detail', component: () => import('@/views/OrgDetailView.vue') },
        { path: 'roles', name: 'roles', component: () => import('@/views/RolesListView.vue') },
        { path: 'roles/new', name: 'role-new', component: () => import('@/views/RoleNewView.vue') },
        { path: 'roles/:id', name: 'role-detail', component: () => import('@/views/RoleDetailView.vue') },
        { path: 'scopes', name: 'scopes', component: () => import('@/views/ScopesListView.vue') },
        { path: 'scopes/new', name: 'scope-new', component: () => import('@/views/ScopeNewView.vue') },
        { path: 'scopes/:id', name: 'scope-detail', component: () => import('@/views/ScopeDetailView.vue') },
        { path: 'user-attributes', name: 'user-attributes', component: () => import('@/views/UserAttributesListView.vue') },
        { path: 'user-attributes/new', name: 'user-attribute-new', component: () => import('@/views/UserAttributeNewView.vue') },
        { path: 'user-attributes/:id', name: 'user-attribute-detail', component: () => import('@/views/UserAttributeDetailView.vue') },
        { path: 'logs', name: 'logs', component: () => import('@/views/LogsView.vue') },
        { path: 'logs/email/:id', name: 'email-log-detail', component: () => import('@/views/EmailLogDetailView.vue') },
        { path: 'logs/sms/:id', name: 'sms-log-detail', component: () => import('@/views/SmsLogDetailView.vue') },
        { path: 'logs/sign-in/:id', name: 'sign-in-log-detail', component: () => import('@/views/SignInLogDetailView.vue') },
        { path: 'saml', name: 'saml', component: () => import('@/views/SamlListView.vue') },
        { path: 'saml/new', name: 'saml-new', component: () => import('@/views/SamlNewView.vue') },
        { path: 'saml/:id', name: 'saml-detail', component: () => import('@/views/SamlDetailView.vue') },
        { path: 'account', name: 'account', component: () => import('@/views/AccountView.vue') }
      ]
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
