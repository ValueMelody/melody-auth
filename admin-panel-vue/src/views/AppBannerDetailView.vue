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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SaveButton, DeleteButton, FieldError, LoadingPage, LocaleEditor } from '@/components/shared'
import { useAppBanner, useUpdateAppBanner, useDeleteAppBanner } from '@/api/endpoints/appBanners'
import { useAppBannerForm } from '@/composables/forms/useAppBannerForm'
import { useAccess, Access } from '@/composables/useAccess'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isAllowedAccess } = useAccess()

const bannerId = computed(() => Number(route.params.id))

const { data: banner, isLoading } = useAppBanner(bannerId)
const updateMutation = useUpdateAppBanner()
const deleteMutation = useDeleteAppBanner()

const canWrite = isAllowedAccess(Access.WriteApp)

const form = useAppBannerForm()
const showErrors = ref(false)

watch(banner, (newBanner) => {
  if (newBanner) {
    form.type.value = newBanner.type
    form.text.value = newBanner.text || ''
    form.isActive.value = newBanner.isActive
    form.appIds.value = newBanner.appIds || []
    form.locales.value = newBanner.locales?.map(l => ({ locale: l.locale, value: l.value })) || []
  }
}, { immediate: true })

const errors = computed(() => ({
  type: form.type.value.trim() ? undefined : t('common.fieldIsRequired')
}))

async function handleSave() {
  if (Object.values(errors.value).some(val => !!val)) {
    showErrors.value = true
    return
  }

  await updateMutation.mutateAsync({
    id: bannerId.value,
    data: form.toUpdatePayload()
  })
}

async function handleDelete() {
  await deleteMutation.mutateAsync(bannerId.value)
  router.push('/app-banners')
}
</script>

<template>
  <div>
    <LoadingPage v-if="isLoading" />
    <template v-else-if="banner">
      <Breadcrumb
        :page="banner.text || 'Banner #' + banner.id"
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
              <Select v-model="form.type.value" :disabled="!canWrite">
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
              <Input
                v-model="form.text.value"
                :disabled="!canWrite"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('apps.bannerStatus') }}</TableCell>
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
            <TableCell>{{ t('apps.bannerLocales') }}</TableCell>
            <TableCell>
              <LocaleEditor
                v-model="form.locales.value"
                :disabled="!canWrite"
              />
              <p class="text-sm text-muted-foreground mt-1">{{ t('apps.bannerLocalesNote') }}</p>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.createdAt') }}</TableCell>
            <TableCell>{{ banner.createdAt }}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.updatedAt') }}</TableCell>
            <TableCell>{{ banner.updatedAt }}</TableCell>
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
          :description="t('common.deleteConfirm', { item: 'Banner' })"
          @confirm="handleDelete"
        />
      </div>
    </template>
  </div>
</template>
