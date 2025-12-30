<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View, IdentityRoute, type Locale } from '@/api/types'
import { apiRequest, parseAuthorizeFollowUpValues, handleAuthorizeStep } from '@/api/auth'
import { useSubmitError } from '@/composables/useSubmitError'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import FieldInput from '@/components/ui/FieldInput.vue'
import FieldLabel from '@/components/ui/FieldLabel.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'
import SuccessMessage from '@/components/ui/SuccessMessage.vue'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { getSubmitError } = useSubmitError()

const firstName = ref('')
const lastName = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)

const submitError = computed(() => authStore.submitError)

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

watch([firstName, lastName], () => {
  authStore.clearSubmitError()
  isSuccess.value = false
})

const handleSubmit = async (e: Event) => {
  e.preventDefault()

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
    }>(IdentityRoute.UpdateInfo, {
      method: 'POST',
      body: JSON.stringify({
        ...baseValues,
        firstName: firstName.value || undefined,
        lastName: lastName.value || undefined,
      }),
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
    <ViewTitle :title="t('updateInfo.title')" />

    <form autocomplete="on" class="w-full" @submit="handleSubmit">
      <section class="flex flex-col gap-2">
        <section class="flex flex-col gap-2">
          <FieldLabel :label="t('updateInfo.firstName')" field-name="firstName" />
          <FieldInput
            v-model="firstName"
            type="text"
            name="firstName"
            auto-complete="given-name"
          />
        </section>

        <section class="flex flex-col gap-2">
          <FieldLabel :label="t('updateInfo.lastName')" field-name="lastName" />
          <FieldInput
            v-model="lastName"
            type="text"
            name="lastName"
            auto-complete="family-name"
          />
        </section>

        <SuccessMessage v-if="isSuccess" :message="t('updateInfo.success')" />

        <SubmitError :error="submitError" />

        <PrimaryButton
          type="submit"
          class="mt-4"
          :title="t('updateInfo.confirm')"
          :is-loading="isSubmitting"
        />
      </section>
    </form>

    <SecondaryButton
      :title="t('updateInfo.redirect')"
      @click="handleRedirectBack"
    />
  </AuthLayout>
</template>
