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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SaveButton, FieldError, LocaleEditor } from '@/components/shared'
import { useCreateScope } from '@/api/endpoints/scopes'
import { useScopeForm } from '@/composables/forms/useScopeForm'

const router = useRouter()
const { t } = useI18n()

const form = useScopeForm()
const createMutation = useCreateScope()
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
  if (result?.scope?.id) {
    router.push(`/scopes/${result.scope.id}`)
  }
}
</script>

<template>
  <div>
    <Breadcrumb
      :page="t('scopes.new')"
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
            <Input v-model="form.name.value" />
            <FieldError v-if="showErrors" :error="errors.name" />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>
            <Label>{{ t('scopes.type') }} *</Label>
          </TableCell>
          <TableCell>
            <Select v-model="form.type.value">
              <SelectTrigger class="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spa">SPA</SelectItem>
                <SelectItem value="s2s">S2S</SelectItem>
              </SelectContent>
            </Select>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('common.note') }}</TableCell>
          <TableCell>
            <Textarea v-model="form.note.value" />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('scopes.locales') }}</TableCell>
          <TableCell>
            <LocaleEditor
                label="Locales"
                v-model="form.locales.value" />
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
