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
import { useCreateSamlIdp } from '@/api/endpoints/saml'
import { useSamlForm } from '@/composables/forms/useSamlForm'

const router = useRouter()
const { t } = useI18n()

const form = useSamlForm()
const createMutation = useCreateSamlIdp()
const showErrors = ref(false)

const errors = computed(() => ({
  name: form.name.value.trim() ? undefined : t('common.fieldIsRequired'),
  userIdAttribute: form.userIdAttribute.value.trim() ? undefined : t('common.fieldIsRequired'),
  metadata: form.metadata.value.trim() ? undefined : t('common.fieldIsRequired')
}))

async function handleCreate() {
  if (Object.values(errors.value).some(val => !!val)) {
    showErrors.value = true
    return
  }

  const result = await createMutation.mutateAsync(form.toCreatePayload())
  if (result?.idp?.id) {
    router.push('/saml/' + result.idp.id)
  }
}
</script>

<template>
  <div>
    <Breadcrumb
      :page="t('saml.new')"
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
          <TableCell>
            <Label>{{ t('saml.name') }} *</Label>
          </TableCell>
          <TableCell>
            <Input v-model="form.name.value" />
            <FieldError v-if="showErrors" :error="errors.name" />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>
            <Label>{{ t('saml.userIdAttribute') }} *</Label>
          </TableCell>
          <TableCell>
            <Input v-model="form.userIdAttribute.value" />
            <FieldError v-if="showErrors" :error="errors.userIdAttribute" />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('saml.emailAttribute') }}</TableCell>
          <TableCell>
            <Input v-model="form.emailAttribute.value" />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('saml.firstNameAttribute') }}</TableCell>
          <TableCell>
            <Input v-model="form.firstNameAttribute.value" />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('saml.lastNameAttribute') }}</TableCell>
          <TableCell>
            <Input v-model="form.lastNameAttribute.value" />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>
            <Label>{{ t('saml.metadata') }} *</Label>
          </TableCell>
          <TableCell>
            <Textarea
              v-model="form.metadata.value"
              rows="10"
              class="font-mono text-sm"
            />
            <FieldError v-if="showErrors" :error="errors.metadata" />
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
