<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Breadcrumb } from '@/components/layout'
import { Input } from '@/components/ui/input'
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
import { useCreateAppBanner } from '@/api/endpoints/appBanners'
import { useAppBannerForm } from '@/composables/forms/useAppBannerForm'

const router = useRouter()
const { t } = useI18n()

const form = useAppBannerForm()
const createMutation = useCreateAppBanner()
const showErrors = ref(false)

const errors = computed(() => ({
  type: form.type.value.trim() ? undefined : t('common.fieldIsRequired')
}))

async function handleCreate() {
  if (Object.values(errors.value).some(val => !!val)) {
    showErrors.value = true
    return
  }

  const result = await createMutation.mutateAsync(form.toCreatePayload())
  if (result?.appBanner?.id) {
    router.push('/app-banners/' + result.appBanner.id)
  }
}
</script>

<template>
  <div>
    <Breadcrumb
      :page="t('apps.newBanner')"
      :parent="{ href: '/app-banners', label: t('apps.appBanners') }"
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
            <Label>{{ t('apps.bannerType') }} *</Label>
          </TableCell>
          <TableCell>
            <Select v-model="form.type.value">
              <SelectTrigger class="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">{{ t('apps.info') }}</SelectItem>
                <SelectItem value="warning">{{ t('apps.warning') }}</SelectItem>
                <SelectItem value="error">{{ t('apps.error') }}</SelectItem>
                <SelectItem value="success">{{ t('apps.success') }}</SelectItem>
              </SelectContent>
            </Select>
            <FieldError v-if="showErrors" :error="errors.type" />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('apps.bannerText') }}</TableCell>
          <TableCell>
            <Input v-model="form.text.value" />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>{{ t('apps.bannerLocales') }}</TableCell>
          <TableCell>
            <LocaleEditor
                label="Locales"
                v-model="form.locales.value" />
            <p class="text-sm text-muted-foreground mt-1">{{ t('apps.bannerLocalesNote') }}</p>
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
