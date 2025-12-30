<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View, IdentityRoute, type Locale } from '@/api/types'
import { apiRequest, parseAuthorizeFollowUpValues, handleAuthorizeStep } from '@/api/auth'
import { useSubmitError } from '@/composables/useSubmitError'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import CodeInput from '@/components/ui/CodeInput.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'
import Spinner from '@/components/ui/Spinner.vue'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { getSubmitError } = useSubmitError()

const qrCodeUrl = ref('')
const secretKey = ref('')
const mfaCode = ref<string[]>(['', '', '', '', '', ''])
const showManualKey = ref(false)
const isLoading = ref(true)
const isSubmitting = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const codeValue = computed(() => mfaCode.value.join(''))
const isCodeComplete = computed(() => codeValue.value.length === 6)
const submitError = computed(() => authStore.submitError)

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

const fetchOtpSetup = async () => {
  isLoading.value = true

  try {
    if (!authStore.followUpParams) {
      throw new Error('No follow-up params available')
    }

    const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)

    const response = await apiRequest<{
      otpUri: string
      secretKey: string
    }>(IdentityRoute.OtpMfaSetup, {
      method: 'GET',
      headers: {
        'x-code': baseValues.code || '',
        'x-locale': locale.value,
        'x-org': baseValues.org || '',
      },
    })

    qrCodeUrl.value = response.otpUri
    secretKey.value = response.secretKey

    await nextTick()
    drawQRCode()
  } catch (error) {
    const errorMessage = getSubmitError(error as Error)
    authStore.setSubmitError(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const drawQRCode = async () => {
  if (!canvasRef.value || !qrCodeUrl.value) return

  try {
    const QRCode = await import('qrcode')
    await QRCode.default.toCanvas(canvasRef.value, qrCodeUrl.value, {
      width: 200,
      margin: 2,
    })
  } catch (error) {
    console.error('Failed to generate QR code:', error)
  }
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
    }>(IdentityRoute.ProcessOtpMfa, {
      method: 'POST',
      body: JSON.stringify({
        ...baseValues,
        mfaCode: codeValue.value,
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
  fetchOtpSetup()
})
</script>

<template>
  <AuthLayout>
    <div v-if="isLoading" class="flex justify-center py-8">
      <Spinner />
    </div>

    <template v-else>
      <p class="text-sm text-center">{{ t('otpMfa.setup') }}</p>

      <div class="flex justify-center my-4">
        <canvas ref="canvasRef" />
      </div>

      <button
        type="button"
        class="text-sm text-center underline cursor-pointer"
        @click="showManualKey = !showManualKey"
      >
        {{ t('otpMfa.manual') }}
      </button>

      <div v-if="showManualKey" class="mt-2 p-3 bg-gray-100 rounded-md text-center">
        <p class="text-sm mb-2">{{ t('otpMfa.yourKey') }}</p>
        <code class="text-sm font-mono break-all">{{ secretKey }}</code>
      </div>

      <form class="w-full mt-4" @submit="handleSubmit">
        <section class="flex flex-col gap-2">
          <p class="text-sm text-center">{{ t('otpMfa.code') }}</p>

          <CodeInput v-model="mfaCode" />

          <SubmitError :error="submitError" />

          <PrimaryButton
            type="submit"
            class="mt-4"
            :title="t('otpMfa.verify')"
            :is-loading="isSubmitting"
            :disabled="!isCodeComplete"
          />
        </section>
      </form>
    </template>
  </AuthLayout>
</template>
