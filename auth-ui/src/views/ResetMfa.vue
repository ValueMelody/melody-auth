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
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'
import SuccessMessage from '@/components/ui/SuccessMessage.vue'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { getSubmitError } = useSubmitError()

const isSubmitting = ref(false)
const isSuccess = ref(false)

const submitError = computed(() => authStore.submitError)

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

const handleReset = async () => {
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
    }>(IdentityRoute.ResetMfa, {
      method: 'POST',
      body: JSON.stringify(baseValues),
    })

    if (response.nextPage) {
      handleAuthorizeStep(response, locale.value as Locale, onSwitchView)
    } else {
      isSuccess.value = true
    }
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
    <ViewTitle :title="t('resetMfa.title')" />

    <p class="text-sm text-center">{{ t('resetMfa.desc') }}</p>

    <SuccessMessage v-if="isSuccess" :message="t('resetMfa.success')" />

    <SubmitError :error="submitError" />

    <PrimaryButton
      v-if="!isSuccess"
      :title="t('resetMfa.confirm')"
      :is-loading="isSubmitting"
      @click="handleReset"
    />

    <SecondaryButton
      :title="t('resetMfa.redirect')"
      @click="handleRedirectBack"
    />
  </AuthLayout>
</template>
