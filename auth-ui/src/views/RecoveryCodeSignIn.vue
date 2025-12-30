<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View } from '@/api/types'
import { useRecoveryCodeSignInForm } from '@/composables/useRecoveryCodeForm'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import EmailField from '@/components/ui/EmailField.vue'
import FieldInput from '@/components/ui/FieldInput.vue'
import FieldLabel from '@/components/ui/FieldLabel.vue'
import FieldError from '@/components/ui/FieldError.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

const {
  email,
  recoveryCode,
  errors,
  isSubmitting,
  handleSubmit,
} = useRecoveryCodeSignInForm(onSwitchView)

const submitError = computed(() => authStore.submitError)

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('recoveryCodeSignIn.title')" />

    <form autocomplete="on" class="w-full" @submit="handleSubmit">
      <section class="flex flex-col gap-2">
        <EmailField
          v-model="email"
          :label="t('recoveryCodeSignIn.email')"
          name="email"
          required
          auto-complete="email"
          :error="errors.email"
        />

        <section class="flex flex-col gap-2">
          <FieldLabel :label="t('recoveryCodeSignIn.recoveryCode')" field-name="recoveryCode" required />
          <FieldInput
            v-model="recoveryCode"
            type="text"
            name="recoveryCode"
          />
          <FieldError :error="errors.recoveryCode" />
        </section>

        <SubmitError :error="submitError" />

        <PrimaryButton
          type="submit"
          class="mt-4"
          :title="t('recoveryCodeSignIn.confirm')"
          :is-loading="isSubmitting"
        />
      </section>
    </form>

    <SecondaryButton
      :title="t('recoveryCodeSignIn.signIn')"
      @click="onSwitchView(View.SignIn)"
    />
  </AuthLayout>
</template>
