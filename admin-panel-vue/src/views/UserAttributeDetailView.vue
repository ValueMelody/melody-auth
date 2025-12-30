<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Breadcrumb } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { SaveButton, DeleteButton, FieldError, LoadingPage, LocaleEditor } from '@/components/shared'
import { useUserAttribute, useUpdateUserAttribute, useDeleteUserAttribute } from '@/api/endpoints/userAttributes'
import { useUserAttributeForm } from '@/composables/forms/useUserAttributeForm'
import { useAccess, Access } from '@/composables/useAccess'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isAllowedAccess } = useAccess()

const attrId = computed(() => Number(route.params.id))

const { data: attr, isLoading } = useUserAttribute(attrId)
const updateMutation = useUpdateUserAttribute()
const deleteMutation = useDeleteUserAttribute()

const canWrite = isAllowedAccess(Access.WriteUserAttribute)

const form = useUserAttributeForm()
const showErrors = ref(false)

watch(attr, (newAttr) => {
  if (newAttr) {
    form.name.value = newAttr.name
    form.locales.value = newAttr.locales?.map(l => ({ locale: l.locale, value: l.value })) || []
    form.includeInSignUpForm.value = newAttr.includeInSignUpForm
    form.requiredInSignUpForm.value = newAttr.requiredInSignUpForm
    form.includeInIdTokenBody.value = newAttr.includeInIdTokenBody
    form.includeInUserInfo.value = newAttr.includeInUserInfo
    form.unique.value = newAttr.unique
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
    id: attrId.value,
    data: form.toUpdatePayload()
  })
}

async function handleDelete() {
  await deleteMutation.mutateAsync(attrId.value)
  router.push('/user-attributes')
}
</script>

<template>
  <div>
    <LoadingPage v-if="isLoading" />
    <template v-else-if="attr">
      <Breadcrumb
        :page="attr.name"
        :parent="{ href: '/user-attributes', label: t('layout.userAttributes') }"
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
              <Label>{{ t('userAttributes.name') }} *</Label>
            </TableCell>
            <TableCell>
              <Input
                v-model="form.name.value"
                :disabled="!canWrite"
              />
              <FieldError v-if="showErrors" :error="errors.name" />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('userAttributes.locales') }}</TableCell>
            <TableCell>
              <LocaleEditor
                v-model="form.locales.value"
                :disabled="!canWrite"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('userAttributes.includeInSignUpForm') }}</TableCell>
            <TableCell>
              <Switch
                :checked="form.includeInSignUpForm.value"
                :disabled="!canWrite"
                @update:checked="form.includeInSignUpForm.value = $event"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('userAttributes.requiredInSignUpForm') }}</TableCell>
            <TableCell>
              <Switch
                :checked="form.requiredInSignUpForm.value"
                :disabled="!canWrite"
                @update:checked="form.requiredInSignUpForm.value = $event"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('userAttributes.includeInIdTokenBody') }}</TableCell>
            <TableCell>
              <Switch
                :checked="form.includeInIdTokenBody.value"
                :disabled="!canWrite"
                @update:checked="form.includeInIdTokenBody.value = $event"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('userAttributes.includeInUserInfo') }}</TableCell>
            <TableCell>
              <Switch
                :checked="form.includeInUserInfo.value"
                :disabled="!canWrite"
                @update:checked="form.includeInUserInfo.value = $event"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('userAttributes.unique') }}</TableCell>
            <TableCell>
              <Switch
                :checked="form.unique.value"
                :disabled="!canWrite"
                @update:checked="form.unique.value = $event"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.createdAt') }}</TableCell>
            <TableCell>{{ attr.createdAt }}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.updatedAt') }}</TableCell>
            <TableCell>{{ attr.updatedAt }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div v-if="canWrite" class="mt-6 flex gap-4">
        <SaveButton
          :loading="updateMutation.isPending.value"
          :disabled="!form.isValid.value"
          @click="handleSave"
        />
        <DeleteButton
          :loading="deleteMutation.isPending.value"
          :title="t('common.delete')"
          :description="t('common.deleteConfirm', { item: attr.name })"
          @confirm="handleDelete"
        />
      </div>
    </template>
  </div>
</template>
