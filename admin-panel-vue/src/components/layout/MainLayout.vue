<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAccess, Access } from '@/composables/useAccess'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Users,
  AppWindow,
  Building2,
  Shield,
  Key,
  FileText,
  LogOut,
  User,
  Tags,
  FileKey2
} from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()
const { isAllowedAccess } = useAccess()

const menuItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'layout.dashboard', access: null },
  { to: '/users', icon: Users, label: 'layout.users', access: Access.ReadUser },
  { to: '/apps', icon: AppWindow, label: 'layout.apps', access: Access.ReadApp },
  { to: '/orgs', icon: Building2, label: 'layout.orgs', access: Access.ReadOrg },
  { to: '/roles', icon: Shield, label: 'layout.roles', access: Access.ReadRole },
  { to: '/scopes', icon: Key, label: 'layout.scopes', access: Access.ReadScope },
  { to: '/user-attributes', icon: Tags, label: 'layout.userAttributes', access: Access.ReadUserAttribute },
  { to: '/logs', icon: FileText, label: 'layout.logs', access: Access.ReadLog },
  { to: '/saml', icon: FileKey2, label: 'layout.samlSso', access: Access.ManageSamlSso }
]

function handleLogout() {
  authStore.logout()
}
</script>

<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader class="p-4">
        <h1 class="text-xl font-bold">{{ t('layout.brand') }}</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in menuItems" :key="item.to">
                <template v-if="!item.access || isAllowedAccess(item.access)">
                  <SidebarMenuButton as-child>
                    <router-link :to="item.to" class="flex items-center gap-2">
                      <component :is="item.icon" class="h-4 w-4" />
                      <span>{{ t(item.label) }}</span>
                    </router-link>
                  </SidebarMenuButton>
                </template>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter class="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton as-child>
              <router-link to="/account" class="flex items-center gap-2">
                <User class="h-4 w-4" />
                <span>{{ t('layout.account') }}</span>
              </router-link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton @click="handleLogout" class="flex items-center gap-2 text-destructive">
              <LogOut class="h-4 w-4" />
              <span>{{ t('layout.logout') }}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    <SidebarInset>
      <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
        <div class="flex items-center gap-2">
          <span v-if="authStore.userInfo" class="text-sm text-muted-foreground">
            {{ authStore.userInfo.email }}
          </span>
        </div>
      </header>
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
