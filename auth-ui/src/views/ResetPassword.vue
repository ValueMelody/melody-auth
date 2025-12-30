<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View } from '@/api/types'
import { useResetPasswordForm } from '@/composables/useResetPasswordForm'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import EmailField from '@/components/ui/EmailField.vue'
import PasswordField from '@/components/ui/PasswordField.vue'
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
  step,
  email,
  mfaCode,
  password,
  confirmPassword,
  emailErrors,
  passwordErrors,
  isSubmitting,
  isResending,
  codeResent,
  isSuccess,
  isCodeComplete,
  sendCode,
  resendCode,
  verifyCode,
  handleSubmit,
  goToSignIn,
} = useResetPasswordForm(onSwitchView)

const submitError = computed(() => authStore.submitError)

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('resetPassword.title')" />

    <SuccessMessage v-if="isSuccess" :message="t('resetPassword.success')" />

    <template v-if="isSuccess">
      <SecondaryButton
        :title="t('resetPassword.signIn')"
        @click="goToSignIn"
      />
    </template>

    <template v-else>
      <!-- Step 1: Email -->
      <template v-if="step === 'email'">
        <p class="text-sm text-center">{{ t('resetPassword.desc') }}</p>

        <form class="w-full" @submit="sendCode">
          <section class="flex flex-col gap-2">
            <EmailField
              v-model="email"
              :label="t('resetPassword.email')"
              name="email"
              required
              auto-complete="email"
              :error="emailErrors.email"
            />

            <SubmitError :error="submitError" />

            <PrimaryButton
              type="submit"
              class="mt-4"
              :title="t('resetPassword.send')"
              :is-loading="isSubmitting"
            />
          </section>
        </form>
      </template>

      <!-- Step 2: Code -->
      <template v-else-if="step === 'code'">
        <p class="text-sm text-center">{{ t('resetPassword.code') }}</p>

        <section class="flex flex-col gap-2 w-full">
          <CodeInput v-model="mfaCode" />

          <SuccessMessage v-if="codeResent" :message="t('resetPassword.resent')" />

          <SubmitError :error="submitError" />

          <PrimaryButton
            type="button"
            class="mt-4"
            :title="t('resetPassword.reset')"
            :disabled="!isCodeComplete"
            @click="verifyCode"
          />

          <button
            type="button"
            class="text-sm text-center underline cursor-pointer mt-2"
            :disabled="isResending"
            @click="resendCode"
          >
            {{ t('resetPassword.resend') }}
          </button>
        </section>
      </template>

      <!-- Step 3: New Password -->
      <template v-else-if="step === 'password'">
        <form class="w-full" @submit="handleSubmit">
          <section class="flex flex-col gap-2">
            <PasswordField
              v-model="password"
              :label="t('resetPassword.password')"
              name="password"
              required
              auto-complete="new-password"
              :error="passwordErrors.password"
            />

            <PasswordField
              v-model="confirmPassword"
              :label="t('resetPassword.confirmPassword')"
              name="confirmPassword"
              required
              auto-complete="new-password"
              :error="passwordErrors.confirmPassword"
            />

            <SubmitError :error="submitError" />

            <PrimaryButton
              type="submit"
              class="mt-4"
              :title="t('resetPassword.reset')"
              :is-loading="isSubmitting"
            />
          </section>
        </form>
      </template>

      <SecondaryButton
        :title="t('resetPassword.backSignIn')"
        @click="goToSignIn"
      />
    </template>
  </AuthLayout>
</template>
