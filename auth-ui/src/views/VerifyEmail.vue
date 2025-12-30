<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { IdentityRoute } from '@/api/types'
import { apiRequest } from '@/api/auth'
import { useSubmitError } from '@/composables/useSubmitError'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import CodeInput from '@/components/ui/CodeInput.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'
import SuccessMessage from '@/components/ui/SuccessMessage.vue'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const { getSubmitError } = useSubmitError()

const mfaCode = ref<string[]>(['', '', '', '', '', ''])
const isSubmitting = ref(false)
const isSuccess = ref(false)

const codeValue = computed(() => mfaCode.value.join(''))
const isCodeComplete = computed(() => codeValue.value.length === 6)
const submitError = computed(() => authStore.submitError)

watch(mfaCode, () => {
  authStore.clearSubmitError()
}, { deep: true })

const handleSubmit = async (e?: Event) => {
  e?.preventDefault()

  if (!isCodeComplete.value) return

  isSubmitting.value = true
  authStore.clearSubmitError()

  try {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id')

    if (!id) {
      throw new Error('Missing verification ID')
    }

    await apiRequest(IdentityRoute.VerifyEmail, {
      method: 'POST',
      body: JSON.stringify({
        id,
        code: codeValue.value,
        locale: locale.value,
      }),
    })

    isSuccess.value = true
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
    <ViewTitle :title="t('verifyEmail.title')" />

    <SuccessMessage v-if="isSuccess" :message="t('verifyEmail.success')" />

    <template v-if="!isSuccess">
      <p class="text-sm text-center">{{ t('verifyEmail.desc') }}</p>

      <form class="w-full" @submit="handleSubmit">
        <section class="flex flex-col gap-2">
          <CodeInput v-model="mfaCode" />

          <SubmitError :error="submitError" />

          <PrimaryButton
            type="submit"
            class="mt-4"
            :title="t('verifyEmail.verify')"
            :is-loading="isSubmitting"
            :disabled="!isCodeComplete"
          />
        </section>
      </form>
    </template>
  </AuthLayout>
</template>
