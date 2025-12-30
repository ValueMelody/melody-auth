<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Breadcrumb } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SaveButton, DeleteButton, LoadingPage } from '@/components/shared'
import { useUser, useUpdateUser, useDeleteUser } from '@/api/endpoints/users'
import { useRoles } from '@/api/endpoints/roles'
import { useUserForm } from '@/composables/forms/useUserForm'
import { useAccess, Access } from '@/composables/useAccess'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isAllowedAccess } = useAccess()

const authId = computed(() => String(route.params.authId))

const { data: user, isLoading } = useUser(authId)
const { data: roles } = useRoles()
const updateMutation = useUpdateUser()
const deleteMutation = useDeleteUser()

const canWriteUser = isAllowedAccess(Access.WriteUser)

const form = useUserForm()

watch(user, (newUser) => {
  if (newUser) {
    form.firstName.value = newUser.firstName || ''
    form.lastName.value = newUser.lastName || ''
    form.isActive.value = newUser.isActive
    form.locale.value = newUser.locale || 'en'
    form.roles.value = newUser.roles || []
    form.attributes.value = newUser.attributes || {}
  }
}, { immediate: true })

async function handleSave() {
  await updateMutation.mutateAsync({
    authId: authId.value,
    data: form.toUpdatePayload()
  })
}

async function handleDelete() {
  await deleteMutation.mutateAsync(authId.value)
  router.push('/users')
}

function toggleRole(roleName: string) {
  const index = form.roles.value.indexOf(roleName)
  if (index === -1) {
    form.roles.value.push(roleName)
  } else {
    form.roles.value.splice(index, 1)
  }
}
</script>

<template>
  <div>
    <LoadingPage v-if="isLoading" />
    <template v-else-if="user">
      <Breadcrumb
        :page="user.email || user.authId"
        :parent="{ href: '/users', label: t('layout.users') }"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-48">{{ t('common.property') }}</TableHead>
            <TableHead>{{ t('common.value') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Auth ID -->
          <TableRow>
            <TableCell>{{ t('users.authId') }}</TableCell>
            <TableCell>
              <code class="bg-muted px-2 py-1 rounded text-sm">{{ user.authId }}</code>
            </TableCell>
          </TableRow>

          <!-- Email -->
          <TableRow>
            <TableCell>{{ t('users.email') }}</TableCell>
            <TableCell>
              {{ user.email || '-' }}
              <Badge v-if="user.emailVerified" class="ml-2" variant="default">
                {{ t('users.verified') }}
              </Badge>
            </TableCell>
          </TableRow>

          <!-- First Name -->
          <TableRow>
            <TableCell>{{ t('users.firstName') }}</TableCell>
            <TableCell>
              <Input
                v-model="form.firstName.value"
                :disabled="!canWriteUser"
              />
            </TableCell>
          </TableRow>

          <!-- Last Name -->
          <TableRow>
            <TableCell>{{ t('users.lastName') }}</TableCell>
            <TableCell>
              <Input
                v-model="form.lastName.value"
                :disabled="!canWriteUser"
              />
            </TableCell>
          </TableRow>

          <!-- Status -->
          <TableRow>
            <TableCell>{{ t('common.status') }}</TableCell>
            <TableCell>
              <Switch
                :checked="form.isActive.value"
                :disabled="!canWriteUser"
                @update:checked="form.isActive.value = $event"
              />
              <span class="ml-2">{{ form.isActive.value ? t('common.active') : t('common.disabled') }}</span>
            </TableCell>
          </TableRow>

          <!-- Locale -->
          <TableRow>
            <TableCell>{{ t('users.locale') }}</TableCell>
            <TableCell>
              <Select v-model="form.locale.value" :disabled="!canWriteUser">
                <SelectTrigger class="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>

          <!-- Login Count -->
          <TableRow>
            <TableCell>{{ t('users.loginCount') }}</TableCell>
            <TableCell>{{ user.loginCount }}</TableCell>
          </TableRow>

          <!-- MFA Types -->
          <TableRow>
            <TableCell>{{ t('users.mfaTypes') }}</TableCell>
            <TableCell>
              <div class="flex gap-2">
                <Badge v-for="mfa in user.mfaTypes" :key="mfa" variant="secondary">
                  {{ mfa }}
                </Badge>
                <span v-if="!user.mfaTypes?.length">-</span>
              </div>
            </TableCell>
          </TableRow>

          <!-- Roles -->
          <TableRow>
            <TableCell>{{ t('users.roles') }}</TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-2">
                <Button
                  v-for="role in roles"
                  :key="role.id"
                  variant="outline"
                  size="sm"
                  :class="{ 'bg-primary text-primary-foreground': form.roles.value.includes(role.name) }"
                  :disabled="!canWriteUser"
                  @click="toggleRole(role.name)"
                >
                  {{ role.name }}
                </Button>
              </div>
            </TableCell>
          </TableRow>

          <!-- Organization -->
          <TableRow v-if="user.org">
            <TableCell>{{ t('users.org') }}</TableCell>
            <TableCell>
              {{ user.org.name }}
            </TableCell>
          </TableRow>

          <!-- Created At -->
          <TableRow>
            <TableCell>{{ t('common.createdAt') }}</TableCell>
            <TableCell>{{ user.createdAt }}</TableCell>
          </TableRow>

          <!-- Updated At -->
          <TableRow>
            <TableCell>{{ t('common.updatedAt') }}</TableCell>
            <TableCell>{{ user.updatedAt }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div v-if="canWriteUser" class="mt-6 flex gap-4">
        <SaveButton
          :loading="updateMutation.isPending.value"
          @click="handleSave"
        />
        <DeleteButton
          :loading="deleteMutation.isPending.value"
          :title="t('common.delete')"
          :description="t('common.deleteConfirm', { item: user.email || user.authId })"
          @confirm="handleDelete"
        />
      </div>
    </template>
  </div>
</template>
