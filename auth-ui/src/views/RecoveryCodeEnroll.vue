<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View } from '@/api/types'
import { useRecoveryCodeEnrollForm } from '@/composables/useRecoveryCodeForm'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import RecoveryCodeContainer from '@/components/ui/RecoveryCodeContainer.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'
import Spinner from '@/components/ui/Spinner.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

const {
  recoveryCode,
  isLoading,
  isSubmitting,
  fetchRecoveryCode,
  handleContinue,
} = useRecoveryCodeEnrollForm(onSwitchView)

const submitError = computed(() => authStore.submitError)

onMounted(() => {
  authStore.parseUrlParams()
  fetchRecoveryCode()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('recoveryCodeEnroll.title')" />

    <p class="text-sm text-center">{{ t('recoveryCodeEnroll.desc') }}</p>

    <div v-if="isLoading" class="flex justify-center py-8">
      <Spinner />
    </div>

    <template v-else>
      <RecoveryCodeContainer v-if="recoveryCode" :recovery-code="recoveryCode" />

      <SubmitError :error="submitError" />

      <PrimaryButton
        type="button"
        class="mt-4"
        :title="t('recoveryCodeEnroll.continue')"
        :is-loading="isSubmitting"
        @click="handleContinue"
      />
    </template>
  </AuthLayout>
</template>
