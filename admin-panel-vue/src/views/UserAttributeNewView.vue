<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
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
import { SaveButton, FieldError, LocaleEditor } from '@/components/shared'
import { useCreateUserAttribute } from '@/api/endpoints/userAttributes'
import { useUserAttributeForm } from '@/composables/forms/useUserAttributeForm'

const router = useRouter()
const { t } = useI18n()

const form = useUserAttributeForm()
const createMutation = useCreateUserAttribute()
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
  if (result?.userAttribute?.id) {
    router.push(`/user-attributes/${result.userAttribute.id}`)
  }
}
</script>

<template>
  <div>
    <Breadcrumb
      :page="t('userAttributes.new')"
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
            <Input v-model="form.name.value" />
            <FieldError v-if="showErrors" :error="errors.name" />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('userAttributes.locales') }}</TableCell>
          <TableCell>
            <LocaleEditor
                label="Locales"
                v-model="form.locales.value" />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('userAttributes.includeInSignUpForm') }}</TableCell>
          <TableCell>
            <Switch
              :checked="form.includeInSignUpForm.value"
              @update:checked="form.includeInSignUpForm.value = $event"
            />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('userAttributes.requiredInSignUpForm') }}</TableCell>
          <TableCell>
            <Switch
              :checked="form.requiredInSignUpForm.value"
              @update:checked="form.requiredInSignUpForm.value = $event"
            />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('userAttributes.includeInIdTokenBody') }}</TableCell>
          <TableCell>
            <Switch
              :checked="form.includeInIdTokenBody.value"
              @update:checked="form.includeInIdTokenBody.value = $event"
            />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('userAttributes.includeInUserInfo') }}</TableCell>
          <TableCell>
            <Switch
              :checked="form.includeInUserInfo.value"
              @update:checked="form.includeInUserInfo.value = $event"
            />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('userAttributes.unique') }}</TableCell>
          <TableCell>
            <Switch
              :checked="form.unique.value"
              @update:checked="form.unique.value = $event"
            />
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
