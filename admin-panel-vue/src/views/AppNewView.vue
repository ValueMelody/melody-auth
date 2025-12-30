<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus, Trash2, Copy } from 'lucide-vue-next'
import { Breadcrumb } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { SaveButton, FieldError, ScopesEditor } from '@/components/shared'
import { useCreateApp } from '@/api/endpoints/apps'
import { useScopes } from '@/api/endpoints/scopes'
import { useAppForm } from '@/composables/forms/useAppForm'

const router = useRouter()
const { t } = useI18n()

const form = useAppForm()
const { data: scopes } = useScopes()
const createMutation = useCreateApp()
const showErrors = ref(false)
const createdSecret = ref<string | null>(null)
const showSecretDialog = ref(false)

const errors = computed(() => ({
  name: form.name.value.trim() ? undefined : t('common.fieldIsRequired'),
  redirectUris: form.redirectUris.value.filter(u => u.trim()).length > 0 ? undefined : t('common.fieldIsRequired')
}))

async function handleCreate() {
  if (Object.values(errors.value).some(val => !!val)) {
    showErrors.value = true
    return
  }

  const result = await createMutation.mutateAsync(form.toCreatePayload())
  if (result?.app?.secret) {
    createdSecret.value = result.app.secret
    showSecretDialog.value = true
  }
}

function copySecret() {
  if (createdSecret.value) {
    navigator.clipboard.writeText(createdSecret.value)
  }
}

function handleSecretDialogClose() {
  showSecretDialog.value = false
  router.push('/apps')
}

</script>

<template>
  <div>
    <Breadcrumb
      :page="t('apps.new')"
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
            <Input v-model="form.name.value" />
            <FieldError v-if="showErrors" :error="errors.name" />
          </TableCell>
        </TableRow>

        <!-- Type -->
        <TableRow>
          <TableCell>
            <Label>{{ t('apps.type') }} *</Label>
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
                  @update:model-value="form.redirectUris.value[index] = String($event)"
                />
                <Button
                  v-if="form.redirectUris.value.length > 1"
                  variant="ghost"
                  size="icon"
                  @click="form.removeRedirectUri(index)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
              <Button
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
              @update:selected-scopes="form.scopes.value = $event"
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

    <!-- Secret Dialog -->
    <AlertDialog v-model:open="showSecretDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('apps.clientSecret') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('apps.secretNote') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div class="flex items-center gap-2 p-4 bg-muted rounded">
          <code class="flex-1 break-all text-sm">{{ createdSecret }}</code>
          <Button variant="ghost" size="icon" @click="copySecret">
            <Copy class="size-4" />
          </Button>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction @click="handleSecretDialogClose">
            {{ t('common.close') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
