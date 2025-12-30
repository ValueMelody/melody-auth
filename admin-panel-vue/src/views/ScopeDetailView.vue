<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Breadcrumb } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { SaveButton, DeleteButton, FieldError, LoadingPage, LocaleEditor } from '@/components/shared'
import { useScope, useUpdateScope, useDeleteScope } from '@/api/endpoints/scopes'
import { useScopeForm } from '@/composables/forms/useScopeForm'
import { useAccess, Access } from '@/composables/useAccess'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isAllowedAccess } = useAccess()

const scopeId = computed(() => Number(route.params.id))

const { data: scope, isLoading } = useScope(scopeId)
const updateMutation = useUpdateScope()
const deleteMutation = useDeleteScope()

const canWriteScope = isAllowedAccess(Access.WriteScope)

const form = useScopeForm()
const showErrors = ref(false)

watch(scope, (newScope) => {
  if (newScope) {
    form.name.value = newScope.name
    form.type.value = newScope.type
    form.note.value = newScope.note || ''
    form.locales.value = newScope.locales?.map(l => ({ locale: l.locale, value: l.value })) || []
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
    id: scopeId.value,
    data: form.toUpdatePayload()
  })
}

async function handleDelete() {
  await deleteMutation.mutateAsync(scopeId.value)
  router.push('/scopes')
}
</script>

<template>
  <div>
    <LoadingPage v-if="isLoading" />
    <template v-else-if="scope">
      <Breadcrumb
        :page="scope.name"
        :parent="{ href: '/scopes', label: t('layout.scopes') }"
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
              <Label>{{ t('scopes.name') }} *</Label>
            </TableCell>
            <TableCell>
              <Input
                v-model="form.name.value"
                :disabled="!canWriteScope"
              />
              <FieldError v-if="showErrors" :error="errors.name" />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('scopes.type') }}</TableCell>
            <TableCell>
              <Badge>{{ scope.type.toUpperCase() }}</Badge>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.note') }}</TableCell>
            <TableCell>
              <Textarea
                v-model="form.note.value"
                :disabled="!canWriteScope"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('scopes.locales') }}</TableCell>
            <TableCell>
              <LocaleEditor
                v-model="form.locales.value"
                :disabled="!canWriteScope"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.createdAt') }}</TableCell>
            <TableCell>{{ scope.createdAt }}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.updatedAt') }}</TableCell>
            <TableCell>{{ scope.updatedAt }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div v-if="canWriteScope" class="mt-6 flex gap-4">
        <SaveButton
          :loading="updateMutation.isPending.value"
          :disabled="!form.isValid.value"
          @click="handleSave"
        />
        <DeleteButton
          :loading="deleteMutation.isPending.value"
          :title="t('common.delete')"
          :description="t('common.deleteConfirm', { item: scope.name })"
          @confirm="handleDelete"
        />
      </div>
    </template>
  </div>
</template>
