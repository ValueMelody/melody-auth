<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View } from '@/api/types'
import { usePasskey } from '@/composables/usePasskey'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import CheckboxInput from '@/components/ui/CheckboxInput.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const rememberSkip = ref(false)

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

const {
  isEnrolling,
  enrollPasskey,
  declinePasskey,
} = usePasskey(onSwitchView)

const submitError = computed(() => authStore.submitError)

const handleSkip = () => {
  declinePasskey()
}

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('passkeyEnroll.title')" />

    <section class="flex flex-col gap-4 w-full">
      <PrimaryButton
        :title="t('passkeyEnroll.enroll')"
        :is-loading="isEnrolling"
        @click="enrollPasskey"
      />

      <CheckboxInput
        v-model="rememberSkip"
        :label="t('passkeyEnroll.rememberSkip')"
      />

      <SecondaryButton
        :title="t('passkeyEnroll.skip')"
        @click="handleSkip"
      />
    </section>

    <SubmitError :error="submitError" />
  </AuthLayout>
</template>
