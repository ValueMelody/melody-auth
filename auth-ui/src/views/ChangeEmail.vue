<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View } from '@/api/types'
import { useChangeEmailForm } from '@/composables/useChangeEmailForm'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import EmailField from '@/components/ui/EmailField.vue'
import CodeInput from '@/components/ui/CodeInput.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'
import SuccessMessage from '@/components/ui/SuccessMessage.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

const {
  email,
  mfaCode,
  errors,
  isSubmitting,
  isResending,
  codeSent,
  codeResent,
  isSuccess,
  isCodeComplete,
  sendCode,
  resendCode,
  handleSubmit,
  handleRedirectBack,
} = useChangeEmailForm(onSwitchView)

const submitError = computed(() => authStore.submitError)

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('changeEmail.title')" />

    <SuccessMessage v-if="isSuccess" :message="t('changeEmail.success')" />

    <template v-if="!isSuccess">
      <form class="w-full" @submit="handleSubmit">
        <section class="flex flex-col gap-2">
          <EmailField
            v-model="email"
            :label="t('changeEmail.email')"
            name="email"
            required
            auto-complete="email"
            :error="errors.email"
            :disabled="codeSent"
          />

          <template v-if="!codeSent">
            <PrimaryButton
              type="button"
              class="mt-4"
              :title="t('changeEmail.sendCode')"
              :is-loading="isSubmitting"
              @click="sendCode"
            />
          </template>

          <template v-else>
            <p class="text-sm text-center mt-2">{{ t('changeEmail.code') }}</p>

            <CodeInput v-model="mfaCode" />

            <SuccessMessage v-if="codeResent" :message="t('changeEmail.resent')" />

            <SubmitError :error="submitError" />

            <PrimaryButton
              type="submit"
              class="mt-4"
              :title="t('changeEmail.confirm')"
              :is-loading="isSubmitting"
              :disabled="!isCodeComplete"
            />

            <button
              type="button"
              class="text-sm text-center underline cursor-pointer mt-2"
              :disabled="isResending"
              @click="resendCode"
            >
              {{ t('changeEmail.resend') }}
            </button>
          </template>
        </section>
      </form>
    </template>

    <SecondaryButton
      :title="t('changeEmail.redirect')"
      @click="handleRedirectBack"
    />
  </AuthLayout>
</template>
