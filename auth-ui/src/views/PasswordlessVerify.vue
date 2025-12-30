<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View, IdentityRoute, type Locale } from '@/api/types'
import { apiRequest, parseAuthorizeFollowUpValues, handleAuthorizeStep } from '@/api/auth'
import { useSubmitError } from '@/composables/useSubmitError'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import CodeInput from '@/components/ui/CodeInput.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'
import SuccessMessage from '@/components/ui/SuccessMessage.vue'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { getSubmitError } = useSubmitError()

const mfaCode = ref<string[]>(['', '', '', '', '', ''])
const isSubmitting = ref(false)
const isResending = ref(false)
const codeResent = ref(false)

const codeValue = computed(() => mfaCode.value.join(''))
const isCodeComplete = computed(() => codeValue.value.length === 6)
const submitError = computed(() => authStore.submitError)

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

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
    }>(IdentityRoute.ProcessPasswordlessCode, {
      method: 'POST',
      body: JSON.stringify({
        ...baseValues,
        code: codeValue.value,
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

const resendCode = async () => {
  isResending.value = true
  authStore.clearSubmitError()
  codeResent.value = false

  try {
    if (!authStore.followUpParams) {
      throw new Error('No follow-up params available')
    }

    const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)

    await apiRequest(IdentityRoute.SendPasswordlessCode, {
      method: 'POST',
      body: JSON.stringify(baseValues),
    })

    codeResent.value = true
  } catch (error) {
    const errorMessage = getSubmitError(error as Error)
    authStore.setSubmitError(errorMessage)
  } finally {
    isResending.value = false
  }
}

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('passwordlessCode.title')" />

    <form class="w-full" @submit="handleSubmit">
      <section class="flex flex-col gap-2">
        <p class="text-sm text-center">{{ t('passwordlessCode.code') }}</p>

        <CodeInput v-model="mfaCode" />

        <SubmitError :error="submitError" />

        <SuccessMessage v-if="codeResent" :message="t('passwordlessCode.resent')" />

        <PrimaryButton
          type="submit"
          class="mt-4"
          :title="t('passwordlessCode.verify')"
          :is-loading="isSubmitting"
          :disabled="!isCodeComplete"
        />

        <button
          type="button"
          class="text-sm text-center underline cursor-pointer mt-2"
          :disabled="isResending"
          @click="resendCode"
        >
          {{ t('passwordlessCode.resend') }}
        </button>
      </section>
    </form>
  </AuthLayout>
</template>
