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
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { getSubmitError } = useSubmitError()

const isSubmitting = ref(false)

const submitError = computed(() => authStore.submitError)
const initialProps = computed(() => authStore.initialProps)

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

const selectMfaType = async (mfaType: 'email' | 'otp' | 'sms') => {
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
    }>(IdentityRoute.ProcessMfaEnroll, {
      method: 'POST',
      body: JSON.stringify({
        ...baseValues,
        type: mfaType,
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

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('mfaEnroll.title')" />

    <section class="flex flex-col gap-4 w-full">
      <SecondaryButton
        :title="t('mfaEnroll.email')"
        :disabled="isSubmitting"
        @click="selectMfaType('email')"
      />

      <SecondaryButton
        :title="t('mfaEnroll.otp')"
        :disabled="isSubmitting"
        @click="selectMfaType('otp')"
      />

      <SecondaryButton
        v-if="initialProps?.enableSms"
        :title="t('mfaEnroll.sms')"
        :disabled="isSubmitting"
        @click="selectMfaType('sms')"
      />
    </section>

    <SubmitError :error="submitError" />
  </AuthLayout>
</template>
