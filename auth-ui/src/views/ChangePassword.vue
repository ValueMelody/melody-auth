<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View } from '@/api/types'
import { useChangePasswordForm } from '@/composables/useChangePasswordForm'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import PasswordField from '@/components/ui/PasswordField.vue'
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
  password,
  confirmPassword,
  errors,
  isSubmitting,
  isSuccess,
  handleSubmit,
  handleRedirectBack,
} = useChangePasswordForm(onSwitchView)

const submitError = computed(() => authStore.submitError)

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('changePassword.title')" />

    <form autocomplete="on" class="w-full" @submit="handleSubmit">
      <section class="flex flex-col gap-2">
        <PasswordField
          v-model="password"
          :label="t('changePassword.newPassword')"
          name="password"
          required
          auto-complete="new-password"
          :error="errors.password"
        />

        <PasswordField
          v-model="confirmPassword"
          :label="t('changePassword.confirmNewPassword')"
          name="confirmPassword"
          required
          auto-complete="new-password"
          :error="errors.confirmPassword"
        />

        <SuccessMessage v-if="isSuccess" :message="t('changePassword.success')" />

        <SubmitError :error="submitError" />

        <PrimaryButton
          type="submit"
          class="mt-4"
          :title="t('changePassword.confirm')"
          :is-loading="isSubmitting"
        />
      </section>
    </form>

    <SecondaryButton
      :title="t('changePassword.redirect')"
      @click="handleRedirectBack"
    />
  </AuthLayout>
</template>
