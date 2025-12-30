<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { IdentityRoute, type Locale } from '@/api/types'
import { apiRequest, parseAuthorizeFollowUpValues } from '@/api/auth'
import { useSubmitError } from '@/composables/useSubmitError'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import RecoveryCodeContainer from '@/components/ui/RecoveryCodeContainer.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'
import SuccessMessage from '@/components/ui/SuccessMessage.vue'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const { getSubmitError } = useSubmitError()

const recoveryCode = ref<string | null>(null)
const isSubmitting = ref(false)
const isSuccess = ref(false)

const submitError = computed(() => authStore.submitError)


const regenerateCode = async () => {
  isSubmitting.value = true
  authStore.clearSubmitError()
  isSuccess.value = false

  try {
    if (!authStore.followUpParams) {
      throw new Error('No follow-up params available')
    }

    const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)

    const response = await apiRequest<{ recoveryCode: string }>(IdentityRoute.ManageRecoveryCode, {
      method: 'POST',
      body: JSON.stringify(baseValues),
    })

    recoveryCode.value = response.recoveryCode
    isSuccess.value = true
  } catch (error) {
    const errorMessage = getSubmitError(error as Error)
    authStore.setSubmitError(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const handleRedirectBack = () => {
  if (!authStore.followUpParams) return

  const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)
  const redirectUri = authStore.authorizeParams?.redirectUri || ''

  if (redirectUri) {
    const queryString = `?state=${authStore.authorizeParams?.state || ''}&code=${baseValues.code}&locale=${locale.value}&org=${baseValues.org || ''}`
    window.location.href = `${redirectUri}${queryString}`
  }
}

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('manageRecoveryCode.title')" />

    <p class="text-sm text-center">{{ t('manageRecoveryCode.desc') }}</p>

    <SuccessMessage v-if="isSuccess" :message="t('manageRecoveryCode.success')" />

    <RecoveryCodeContainer v-if="recoveryCode" :recovery-code="recoveryCode" />

    <SubmitError :error="submitError" />

    <PrimaryButton
      :title="t('manageRecoveryCode.regenerate')"
      :is-loading="isSubmitting"
      @click="regenerateCode"
    />

    <SecondaryButton
      :title="t('manageRecoveryCode.redirect')"
      @click="handleRedirectBack"
    />
  </AuthLayout>
</template>
