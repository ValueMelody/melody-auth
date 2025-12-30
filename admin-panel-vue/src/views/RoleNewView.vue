<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
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
import { SaveButton, FieldError } from '@/components/shared'
import { useCreateRole } from '@/api/endpoints/roles'
import { useRoleForm } from '@/composables/forms/useRoleForm'

const router = useRouter()
const { t } = useI18n()

const form = useRoleForm()
const createMutation = useCreateRole()
const showErrors = ref(false)

const errors = computed(() => ({
  name: form.name.value.trim() ? undefined : t('common.fieldIsRequired')
}))

async function handleCreate() {
  if (Object.values(errors.value).some(val => !!val)) {
    showErrors.value = true
    return
  }

  const result = await createMutation.mutateAsync(form.toCreatePayload())
  if (result?.role?.id) {
    router.push(`/roles/${result.role.id}`)
  }
}
</script>

<template>
  <div>
    <Breadcrumb
      :page="t('roles.new')"
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
            <Input v-model="form.name.value" />
            <FieldError v-if="showErrors" :error="errors.name" />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('common.note') }}</TableCell>
          <TableCell>
            <Textarea v-model="form.note.value" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <div class="mt-6">
      <SaveButton
        :loading="createMutation.isPending.value"
        :disabled="!form.isValid.value"
        @click="handleCreate"
      />
    </div>
  </div>
</template>
