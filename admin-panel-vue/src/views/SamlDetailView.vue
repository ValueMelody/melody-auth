<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Breadcrumb } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { SaveButton, DeleteButton, FieldError, LoadingPage } from '@/components/shared'
import { useSamlIdp, useUpdateSamlIdp, useDeleteSamlIdp } from '@/api/endpoints/saml'
import { useSamlForm } from '@/composables/forms/useSamlForm'
import { useAccess, Access } from '@/composables/useAccess'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isAllowedAccess } = useAccess()

const idpId = computed(() => Number(route.params.id))

const { data: idp, isLoading } = useSamlIdp(idpId)
const updateMutation = useUpdateSamlIdp()
const deleteMutation = useDeleteSamlIdp()

const canWrite = isAllowedAccess(Access.ManageSamlSso)

const form = useSamlForm()
const showErrors = ref(false)

watch(idp, (newIdp) => {
  if (newIdp) {
    form.name.value = newIdp.name
    form.isActive.value = newIdp.isActive
    form.userIdAttribute.value = newIdp.userIdAttribute || ''
    form.emailAttribute.value = newIdp.emailAttribute || ''
    form.firstNameAttribute.value = newIdp.firstNameAttribute || ''
    form.lastNameAttribute.value = newIdp.lastNameAttribute || ''
    form.metadata.value = newIdp.metadata || ''
  }
}, { immediate: true })

const errors = computed(() => ({
  userIdAttribute: form.userIdAttribute.value.trim() ? undefined : t('common.fieldIsRequired'),
  metadata: form.metadata.value.trim() ? undefined : t('common.fieldIsRequired')
}))

async function handleSave() {
  if (Object.values(errors.value).some(val => !!val)) {
    showErrors.value = true
    return
  }

  await updateMutation.mutateAsync({
    id: idpId.value,
    data: form.toUpdatePayload()
  })
}

async function handleDelete() {
  await deleteMutation.mutateAsync(idpId.value)
  router.push('/saml')
}
</script>

<template>
  <div>
    <LoadingPage v-if="isLoading" />
    <template v-else-if="idp">
      <Breadcrumb
        :page="idp.name"
        :parent="{ href: '/saml', label: t('layout.samlSso') }"
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
            <TableCell>{{ t('saml.name') }}</TableCell>
            <TableCell>{{ idp.name }}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.status') }}</TableCell>
            <TableCell>
              <Switch
                :checked="form.isActive.value"
                :disabled="!canWrite"
                @update:checked="form.isActive.value = $event"
              />
              <span class="ml-2">{{ form.isActive.value ? t('common.active') : t('common.disabled') }}</span>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Label>{{ t('saml.userIdAttribute') }} *</Label>
            </TableCell>
            <TableCell>
              <Input
                v-model="form.userIdAttribute.value"
                :disabled="!canWrite"
              />
              <FieldError v-if="showErrors" :error="errors.userIdAttribute" />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('saml.emailAttribute') }}</TableCell>
            <TableCell>
              <Input
                v-model="form.emailAttribute.value"
                :disabled="!canWrite"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('saml.firstNameAttribute') }}</TableCell>
            <TableCell>
              <Input
                v-model="form.firstNameAttribute.value"
                :disabled="!canWrite"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('saml.lastNameAttribute') }}</TableCell>
            <TableCell>
              <Input
                v-model="form.lastNameAttribute.value"
                :disabled="!canWrite"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Label>{{ t('saml.metadata') }} *</Label>
            </TableCell>
            <TableCell>
              <Textarea
                v-model="form.metadata.value"
                :disabled="!canWrite"
                rows="10"
                class="font-mono text-sm"
              />
              <FieldError v-if="showErrors" :error="errors.metadata" />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.createdAt') }}</TableCell>
            <TableCell>{{ idp.createdAt }}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.updatedAt') }}</TableCell>
            <TableCell>{{ idp.updatedAt }}</TableCell>
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
          :description="t('common.deleteConfirm', { item: idp.name })"
          @confirm="handleDelete"
        />
      </div>
    </template>
  </div>
</template>
