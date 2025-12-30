<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Breadcrumb } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { SaveButton, DeleteButton, FieldError, LoadingPage } from '@/components/shared'
import { useRole, useUpdateRole, useDeleteRole } from '@/api/endpoints/roles'
import { useRoleForm } from '@/composables/forms/useRoleForm'
import { useAccess, Access } from '@/composables/useAccess'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isAllowedAccess } = useAccess()

const roleId = computed(() => Number(route.params.id))

const { data: role, isLoading } = useRole(roleId)
const updateMutation = useUpdateRole()
const deleteMutation = useDeleteRole()

const canWriteRole = isAllowedAccess(Access.WriteRole)

const form = useRoleForm()
const showErrors = ref(false)

watch(role, (newRole) => {
  if (newRole) {
    form.name.value = newRole.name
    form.note.value = newRole.note || ''
  }
}, { immediate: true })

const errors = computed(() => ({
  name: form.name.value.trim() ? undefined : t('common.fieldIsRequired')
}))

async function handleSave() {
  if (Object.values(errors.value).some(val => !!val)) {
    showErrors.value = true
    return
  }

  await updateMutation.mutateAsync({
    id: roleId.value,
    data: form.toUpdatePayload()
  })
}

async function handleDelete() {
  await deleteMutation.mutateAsync(roleId.value)
  router.push('/roles')
}
</script>

<template>
  <div>
    <LoadingPage v-if="isLoading" />
    <template v-else-if="role">
      <Breadcrumb
        :page="role.name"
        :parent="{ href: '/roles', label: t('layout.roles') }"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-48">{{ t('common.property') }}</TableHead>
            <TableHead>{{ t('common.value') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <Label>{{ t('roles.name') }} *</Label>
            </TableCell>
            <TableCell>
              <Input
                v-model="form.name.value"
                :disabled="!canWriteRole"
              />
              <FieldError v-if="showErrors" :error="errors.name" />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.note') }}</TableCell>
            <TableCell>
              <Textarea
                v-model="form.note.value"
                :disabled="!canWriteRole"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.createdAt') }}</TableCell>
            <TableCell>{{ role.createdAt }}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.updatedAt') }}</TableCell>
            <TableCell>{{ role.updatedAt }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div v-if="canWriteRole" class="mt-6 flex gap-4">
        <SaveButton
          :loading="updateMutation.isPending.value"
          :disabled="!form.isValid.value"
          @click="handleSave"
        />
        <DeleteButton
          :loading="deleteMutation.isPending.value"
          :title="t('common.delete')"
          :description="t('common.deleteConfirm', { item: role.name })"
          @confirm="handleDelete"
        />
      </div>
    </template>
  </div>
</template>
