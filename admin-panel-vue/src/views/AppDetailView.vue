<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus, Trash2 } from 'lucide-vue-next'
import { Breadcrumb } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { SaveButton, DeleteButton, FieldError, LoadingPage, ScopesEditor } from '@/components/shared'
import { useApp, useUpdateApp, useDeleteApp } from '@/api/endpoints/apps'
import { useScopes } from '@/api/endpoints/scopes'
import { useAppForm } from '@/composables/forms/useAppForm'
import { useAccess, Access } from '@/composables/useAccess'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isAllowedAccess } = useAccess()

const appId = computed(() => Number(route.params.id))

const { data: app, isLoading } = useApp(appId)
const { data: scopes } = useScopes()
const updateMutation = useUpdateApp()
const deleteMutation = useDeleteApp()

const canWriteApp = isAllowedAccess(Access.WriteApp)

const form = useAppForm()
const showErrors = ref(false)

// Watch app data and update form
watch(app, (newApp) => {
  if (newApp) {
    form.name.value = newApp.name
    form.type.value = newApp.type
    form.scopes.value = newApp.scopes || []
    form.redirectUris.value = newApp.redirectUris?.length ? [...newApp.redirectUris] : ['']
    form.isActive.value = newApp.isActive
    form.useSystemMfaConfig.value = newApp.useSystemMfaConfig
    form.requireEmailMfa.value = newApp.requireEmailMfa
    form.requireOtpMfa.value = newApp.requireOtpMfa
    form.requireSmsMfa.value = newApp.requireSmsMfa
    form.allowEmailMfaAsBackup.value = newApp.allowEmailMfaAsBackup
  }
}, { immediate: true })

const errors = computed(() => ({
  name: form.name.value.trim() ? undefined : t('common.fieldIsRequired'),
  redirectUris: form.redirectUris.value.filter(u => u.trim()).length > 0 ? undefined : t('common.fieldIsRequired')
}))

async function handleSave() {
  if (Object.values(errors.value).some(val => !!val)) {
    showErrors.value = true
    return
  }

  await updateMutation.mutateAsync({
    id: appId.value,
    data: form.toUpdatePayload()
  })
}

async function handleDelete() {
  await deleteMutation.mutateAsync(appId.value)
  router.push('/apps')
}

</script>

<template>
  <div>
    <LoadingPage v-if="isLoading" />
    <template v-else-if="app">
      <Breadcrumb
        :page="app.name"
        :parent="{ href: '/apps', label: t('layout.apps') }"
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
              <Label>{{ t('apps.name') }} *</Label>
            </TableCell>
            <TableCell>
              <Input
                v-model="form.name.value"
                :disabled="!canWriteApp"
              />
              <FieldError v-if="showErrors" :error="errors.name" />
            </TableCell>
          </TableRow>

          <!-- Client ID -->
          <TableRow>
            <TableCell>{{ t('apps.clientId') }}</TableCell>
            <TableCell>
              <code class="bg-muted px-2 py-1 rounded text-sm">{{ app.clientId }}</code>
            </TableCell>
          </TableRow>

          <!-- Type -->
          <TableRow>
            <TableCell>{{ t('apps.type') }}</TableCell>
            <TableCell>
              <Badge>{{ app.type.toUpperCase() }}</Badge>
            </TableCell>
          </TableRow>

          <!-- Status -->
          <TableRow>
            <TableCell>{{ t('apps.status') }}</TableCell>
            <TableCell>
              <Switch
                :checked="form.isActive.value"
                :disabled="!canWriteApp"
                @update:checked="form.isActive.value = $event"
              />
              <span class="ml-2">{{ form.isActive.value ? t('common.active') : t('common.disabled') }}</span>
            </TableCell>
          </TableRow>

          <!-- Redirect URIs -->
          <TableRow>
            <TableCell>
              <Label>{{ t('apps.redirectUris') }} *</Label>
            </TableCell>
            <TableCell>
              <div class="space-y-2">
                <div v-for="(uri, index) in form.redirectUris.value" :key="index" class="flex gap-2">
                  <Input
                    :model-value="uri"
                    :disabled="!canWriteApp"
                    @update:model-value="form.redirectUris.value[index] = String($event)"
                  />
                  <Button
                    v-if="form.redirectUris.value.length > 1"
                    variant="ghost"
                    size="icon"
                    :disabled="!canWriteApp"
                    @click="form.removeRedirectUri(index)"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
                <Button
                  v-if="canWriteApp"
                  variant="outline"
                  size="sm"
                  @click="form.addRedirectUri"
                >
                  <Plus class="size-4 mr-1" />
                  {{ t('common.create') }}
                </Button>
              </div>
              <FieldError v-if="showErrors" :error="errors.redirectUris" />
              <p class="text-sm text-muted-foreground mt-1">{{ t('apps.urlFormat') }}</p>
            </TableCell>
          </TableRow>

          <!-- Scopes -->
          <TableRow>
            <TableCell>{{ t('apps.scopes') }}</TableCell>
            <TableCell>
              <ScopesEditor
                :scopes="scopes || []"
                :selected-scopes="form.scopes.value"
                :disabled="!canWriteApp"
                @update:selected-scopes="form.scopes.value = $event"
              />
            </TableCell>
          </TableRow>

          <!-- MFA Config Section -->
          <TableRow>
            <TableCell colspan="2" class="bg-muted/50 font-medium">
              {{ t('apps.appLevelMfa') }}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colspan="2" class="text-sm text-muted-foreground">
              {{ t('apps.appLevelMfaDescription') }}
            </TableCell>
          </TableRow>

          <!-- Use System MFA Config -->
          <TableRow>
            <TableCell>{{ t('apps.useSystemMfaConfig') }}</TableCell>
            <TableCell>
              <Switch
                :checked="form.useSystemMfaConfig.value"
                :disabled="!canWriteApp"
                @update:checked="form.useSystemMfaConfig.value = $event"
              />
            </TableCell>
          </TableRow>

          <template v-if="!form.useSystemMfaConfig.value">
            <!-- Require Email MFA -->
            <TableRow>
              <TableCell>{{ t('apps.requireEmailMfa') }}</TableCell>
              <TableCell>
                <Switch
                  :checked="form.requireEmailMfa.value"
                  :disabled="!canWriteApp"
                  @update:checked="form.requireEmailMfa.value = $event"
                />
              </TableCell>
            </TableRow>

            <!-- Require OTP MFA -->
            <TableRow>
              <TableCell>{{ t('apps.requireOtpMfa') }}</TableCell>
              <TableCell>
                <Switch
                  :checked="form.requireOtpMfa.value"
                  :disabled="!canWriteApp"
                  @update:checked="form.requireOtpMfa.value = $event"
                />
              </TableCell>
            </TableRow>

            <!-- Require SMS MFA -->
            <TableRow>
              <TableCell>{{ t('apps.requireSmsMfa') }}</TableCell>
              <TableCell>
                <Switch
                  :checked="form.requireSmsMfa.value"
                  :disabled="!canWriteApp"
                  @update:checked="form.requireSmsMfa.value = $event"
                />
              </TableCell>
            </TableRow>

            <!-- Allow Email MFA as Backup -->
            <TableRow>
              <TableCell>{{ t('apps.allowEmailMfaAsBackup') }}</TableCell>
              <TableCell>
                <Switch
                  :checked="form.allowEmailMfaAsBackup.value"
                  :disabled="!canWriteApp"
                  @update:checked="form.allowEmailMfaAsBackup.value = $event"
                />
              </TableCell>
            </TableRow>
          </template>

          <!-- Created At -->
          <TableRow>
            <TableCell>{{ t('common.createdAt') }}</TableCell>
            <TableCell>{{ app.createdAt }}</TableCell>
          </TableRow>

          <!-- Updated At -->
          <TableRow>
            <TableCell>{{ t('common.updatedAt') }}</TableCell>
            <TableCell>{{ app.updatedAt }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Actions -->
      <div v-if="canWriteApp" class="mt-6 flex gap-4">
        <SaveButton
          :loading="updateMutation.isPending.value"
          :disabled="!form.isValid.value"
          @click="handleSave"
        />
        <DeleteButton
          :loading="deleteMutation.isPending.value"
          :title="t('common.delete')"
          :description="t('common.deleteConfirm', { item: app.name })"
          @confirm="handleDelete"
        />
      </div>
    </template>
  </div>
</template>
