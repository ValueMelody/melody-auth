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
import { SaveButton, DeleteButton, FieldError, LoadingPage, ColorInput } from '@/components/shared'
import { useOrg, useUpdateOrg, useDeleteOrg, useVerifyOrgDomain } from '@/api/endpoints/orgs'
import { useOrgForm } from '@/composables/forms/useOrgForm'
import { useAccess, Access } from '@/composables/useAccess'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isAllowedAccess } = useAccess()

const orgId = computed(() => Number(route.params.id))

const { data: org, isLoading } = useOrg(orgId)
const updateMutation = useUpdateOrg()
const deleteMutation = useDeleteOrg()
const verifyDomainMutation = useVerifyOrgDomain()

const canWriteOrg = isAllowedAccess(Access.WriteOrg)

const form = useOrgForm()
const showErrors = ref(false)

// Watch org data and update form
watch(org, (newOrg) => {
  if (newOrg) {
    form.name.value = newOrg.name
    form.slug.value = newOrg.slug
    form.allowPublicRegistration.value = newOrg.allowPublicRegistration
    form.onlyUseForBrandingOverride.value = newOrg.onlyUseForBrandingOverride
    form.companyLogoUrl.value = newOrg.companyLogoUrl || ''
    form.companyEmailLogoUrl.value = newOrg.companyEmailLogoUrl || ''
    form.fontFamily.value = newOrg.fontFamily || ''
    form.fontUrl.value = newOrg.fontUrl || ''
    form.layoutColor.value = newOrg.layoutColor || ''
    form.labelColor.value = newOrg.labelColor || ''
    form.primaryButtonColor.value = newOrg.primaryButtonColor || ''
    form.primaryButtonLabelColor.value = newOrg.primaryButtonLabelColor || ''
    form.primaryButtonBorderColor.value = newOrg.primaryButtonBorderColor || ''
    form.secondaryButtonColor.value = newOrg.secondaryButtonColor || ''
    form.secondaryButtonLabelColor.value = newOrg.secondaryButtonLabelColor || ''
    form.secondaryButtonBorderColor.value = newOrg.secondaryButtonBorderColor || ''
    form.criticalIndicatorColor.value = newOrg.criticalIndicatorColor || ''
    form.termsLink.value = newOrg.termsLink || ''
    form.privacyPolicyLink.value = newOrg.privacyPolicyLink || ''
    form.customDomain.value = newOrg.customDomain || ''
  }
}, { immediate: true })

const errors = computed(() => ({
  name: form.name.value.trim() ? undefined : t('common.fieldIsRequired'),
  slug: form.slug.value.trim() ? undefined : t('common.fieldIsRequired')
}))

async function handleSave() {
  if (Object.values(errors.value).some(val => !!val)) {
    showErrors.value = true
    return
  }

  await updateMutation.mutateAsync({
    id: orgId.value,
    data: form.toUpdatePayload()
  })
}

async function handleDelete() {
  await deleteMutation.mutateAsync(orgId.value)
  router.push('/orgs')
}

async function handleVerifyDomain() {
  await verifyDomainMutation.mutateAsync(orgId.value)
}
</script>

<template>
  <div>
    <LoadingPage v-if="isLoading" />
    <template v-else-if="org">
      <Breadcrumb
        :page="org.name"
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
              <Input
                v-model="form.name.value"
                :disabled="!canWriteOrg"
              />
              <FieldError v-if="showErrors" :error="errors.name" />
            </TableCell>
          </TableRow>

          <!-- Slug -->
          <TableRow>
            <TableCell>
              <Label>{{ t('orgs.slug') }} *</Label>
            </TableCell>
            <TableCell>
              <Input
                v-model="form.slug.value"
                :disabled="!canWriteOrg"
              />
              <FieldError v-if="showErrors" :error="errors.slug" />
            </TableCell>
          </TableRow>

          <!-- Allow Public Registration -->
          <TableRow>
            <TableCell>{{ t('orgs.allowPublicRegistration') }}</TableCell>
            <TableCell>
              <Switch
                :checked="form.allowPublicRegistration.value"
                :disabled="!canWriteOrg"
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
                :disabled="!canWriteOrg"
                @update:checked="form.onlyUseForBrandingOverride.value = $event"
              />
            </TableCell>
          </TableRow>

          <!-- Company Logo URL -->
          <TableRow>
            <TableCell>{{ t('orgs.companyLogoUrl') }}</TableCell>
            <TableCell>
              <Input
                v-model="form.companyLogoUrl.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Company Email Logo URL -->
          <TableRow>
            <TableCell>{{ t('orgs.companyEmailLogoUrl') }}</TableCell>
            <TableCell>
              <Input
                v-model="form.companyEmailLogoUrl.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Font Family -->
          <TableRow>
            <TableCell>{{ t('orgs.fontFamily') }}</TableCell>
            <TableCell>
              <Input
                v-model="form.fontFamily.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Font URL -->
          <TableRow>
            <TableCell>{{ t('orgs.fontUrl') }}</TableCell>
            <TableCell>
              <Input
                v-model="form.fontUrl.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Layout Color -->
          <TableRow>
            <TableCell>{{ t('orgs.layoutColor') }}</TableCell>
            <TableCell>
              <ColorInput
                v-model="form.layoutColor.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Label Color -->
          <TableRow>
            <TableCell>{{ t('orgs.labelColor') }}</TableCell>
            <TableCell>
              <ColorInput
                v-model="form.labelColor.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Primary Button Color -->
          <TableRow>
            <TableCell>{{ t('orgs.primaryButtonColor') }}</TableCell>
            <TableCell>
              <ColorInput
                v-model="form.primaryButtonColor.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Primary Button Label Color -->
          <TableRow>
            <TableCell>{{ t('orgs.primaryButtonLabelColor') }}</TableCell>
            <TableCell>
              <ColorInput
                v-model="form.primaryButtonLabelColor.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Primary Button Border Color -->
          <TableRow>
            <TableCell>{{ t('orgs.primaryButtonBorderColor') }}</TableCell>
            <TableCell>
              <ColorInput
                v-model="form.primaryButtonBorderColor.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Secondary Button Color -->
          <TableRow>
            <TableCell>{{ t('orgs.secondaryButtonColor') }}</TableCell>
            <TableCell>
              <ColorInput
                v-model="form.secondaryButtonColor.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Secondary Button Label Color -->
          <TableRow>
            <TableCell>{{ t('orgs.secondaryButtonLabelColor') }}</TableCell>
            <TableCell>
              <ColorInput
                v-model="form.secondaryButtonLabelColor.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Secondary Button Border Color -->
          <TableRow>
            <TableCell>{{ t('orgs.secondaryButtonBorderColor') }}</TableCell>
            <TableCell>
              <ColorInput
                v-model="form.secondaryButtonBorderColor.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Critical Indicator Color -->
          <TableRow>
            <TableCell>{{ t('orgs.criticalIndicatorColor') }}</TableCell>
            <TableCell>
              <ColorInput
                v-model="form.criticalIndicatorColor.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Terms Link -->
          <TableRow>
            <TableCell>{{ t('orgs.termsLink') }}</TableCell>
            <TableCell>
              <Input
                v-model="form.termsLink.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Privacy Policy Link -->
          <TableRow>
            <TableCell>{{ t('orgs.privacyPolicyLink') }}</TableCell>
            <TableCell>
              <Input
                v-model="form.privacyPolicyLink.value"
                :disabled="!canWriteOrg"
              />
            </TableCell>
          </TableRow>

          <!-- Custom Domain -->
          <TableRow>
            <TableCell>{{ t('orgs.customDomain') }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <Input
                  v-model="form.customDomain.value"
                  :disabled="!canWriteOrg"
                />
                <Badge v-if="org.customDomainVerified" variant="default">
                  {{ t('orgs.customDomainVerified') }}
                </Badge>
                <Badge v-else-if="org.customDomain" variant="secondary">
                  {{ t('orgs.customDomainNotVerified') }}
                </Badge>
              </div>
              <div v-if="org.customDomain && !org.customDomainVerified" class="mt-2">
                <p class="text-sm text-muted-foreground mb-2">
                  {{ t('orgs.customDomainHelp') }}
                </p>
                <p class="text-sm font-mono bg-muted p-2 rounded">
                  TXT: {{ org.customDomainVerificationToken }}
                </p>
                <Button
                  class="mt-2"
                  size="sm"
                  :loading="verifyDomainMutation.isPending.value"
                  @click="handleVerifyDomain"
                >
                  {{ t('orgs.verifyDomain') }}
                </Button>
              </div>
            </TableCell>
          </TableRow>

          <!-- Created At -->
          <TableRow>
            <TableCell>{{ t('common.createdAt') }}</TableCell>
            <TableCell>{{ org.createdAt }}</TableCell>
          </TableRow>

          <!-- Updated At -->
          <TableRow>
            <TableCell>{{ t('common.updatedAt') }}</TableCell>
            <TableCell>{{ org.updatedAt }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Actions -->
      <div v-if="canWriteOrg" class="mt-6 flex gap-4">
        <SaveButton
          :loading="updateMutation.isPending.value"
          :disabled="!form.isValid.value"
          @click="handleSave"
        />
        <DeleteButton
          :loading="deleteMutation.isPending.value"
          :title="t('common.delete')"
          :description="t('common.deleteConfirm', { item: org.name })"
          @confirm="handleDelete"
        />
      </div>
    </template>
  </div>
</template>
