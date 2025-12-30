<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View, IdentityRoute, type Locale } from '@/api/types'
import { apiRequest, parseAuthorizeFollowUpValues, handleAuthorizeStep } from '@/api/auth'
import { useSubmitError } from '@/composables/useSubmitError'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import CodeInput from '@/components/ui/CodeInput.vue'
import CheckboxInput from '@/components/ui/CheckboxInput.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { getSubmitError } = useSubmitError()

const mfaCode = ref<string[]>(['', '', '', '', '', ''])
const rememberDevice = ref(false)
const isSubmitting = ref(false)

const codeValue = computed(() => mfaCode.value.join(''))
const isCodeComplete = computed(() => codeValue.value.length === 6)
const submitError = computed(() => authStore.submitError)
const initialProps = computed(() => authStore.initialProps)

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

watch(mfaCode, () => {
  authStore.clearSubmitError()
}, { deep: true })

const handleSubmit = async (e?: Event) => {
  e?.preventDefault()

  if (!isCodeComplete.value) return

  isSubmitting.value = true
  authStore.clearSubmitError()

  try {
    if (!authStore.followUpParams) {
      throw new Error('No follow-up params available')
    }

    const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)

    const response = await apiRequest<{
      nextPage?: View
      code?: string
      state?: string
      redirectUri?: string
      org?: string
    }>(IdentityRoute.ProcessOtpMfa, {
      method: 'POST',
      body: JSON.stringify({
        ...baseValues,
        mfaCode: codeValue.value,
        rememberDevice: rememberDevice.value,
      }),
    })

    handleAuthorizeStep(response, locale.value as Locale, onSwitchView)
  } catch (error) {
    const errorMessage = getSubmitError(error as Error)
    authStore.setSubmitError(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const switchToEmail = () => {
  onSwitchView(View.EmailMfa)
}

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <p class="text-sm text-center">{{ t('otpMfa.code') }}</p>

    <form class="w-full" @submit="handleSubmit">
      <section class="flex flex-col gap-2">
        <CodeInput v-model="mfaCode" />

        <CheckboxInput
          v-if="initialProps?.enableRememberDevice"
          v-model="rememberDevice"
          :label="t('otpMfa.rememberDevice')"
        />

        <SubmitError :error="submitError" />

        <PrimaryButton
          type="submit"
          class="mt-4"
          :title="t('otpMfa.verify')"
          :is-loading="isSubmitting"
          :disabled="!isCodeComplete"
        />

        <SecondaryButton
          v-if="initialProps?.enableEmailMfaFallback"
          :title="t('otpMfa.switchToEmail')"
          @click="switchToEmail"
        />
      </section>
    </form>
  </AuthLayout>
</template>
