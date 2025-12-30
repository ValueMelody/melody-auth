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
import { SaveButton, FieldError } from '@/components/shared'
import { useCreateOrg } from '@/api/endpoints/orgs'
import { useOrgForm } from '@/composables/forms/useOrgForm'

const router = useRouter()
const { t } = useI18n()

const form = useOrgForm()
const createMutation = useCreateOrg()
const showErrors = ref(false)

const errors = computed(() => ({
  name: form.name.value.trim() ? undefined : t('common.fieldIsRequired'),
  slug: form.slug.value.trim() ? undefined : t('common.fieldIsRequired')
}))

async function handleCreate() {
  if (Object.values(errors.value).some(val => !!val)) {
    showErrors.value = true
    return
  }

  const result = await createMutation.mutateAsync(form.toCreatePayload())
  if (result?.org?.id) {
    router.push(`/orgs/${result.org.id}`)
  }
}
</script>

<template>
  <div>
    <Breadcrumb
      :page="t('orgs.new')"
      :parent="{ href: '/orgs', label: t('layout.orgs') }"
    />

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-48">{{ t('common.property') }}</TableHead>
          <TableHead>{{ t('common.value') }}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <!-- Name -->
        <TableRow>
          <TableCell>
            <Label>{{ t('orgs.name') }} *</Label>
          </TableCell>
          <TableCell>
            <Input v-model="form.name.value" />
            <FieldError v-if="showErrors" :error="errors.name" />
          </TableCell>
        </TableRow>

        <!-- Slug -->
        <TableRow>
          <TableCell>
            <Label>{{ t('orgs.slug') }} *</Label>
          </TableCell>
          <TableCell>
            <Input v-model="form.slug.value" />
            <FieldError v-if="showErrors" :error="errors.slug" />
          </TableCell>
        </TableRow>

        <!-- Allow Public Registration -->
        <TableRow>
          <TableCell>{{ t('orgs.allowPublicRegistration') }}</TableCell>
          <TableCell>
            <Switch
              :checked="form.allowPublicRegistration.value"
              @update:checked="form.allowPublicRegistration.value = $event"
            />
          </TableCell>
        </TableRow>

        <!-- Only Use For Branding Override -->
        <TableRow>
          <TableCell>{{ t('orgs.onlyUseForBrandingOverride') }}</TableCell>
          <TableCell>
            <Switch
              :checked="form.onlyUseForBrandingOverride.value"
              @update:checked="form.onlyUseForBrandingOverride.value = $event"
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
