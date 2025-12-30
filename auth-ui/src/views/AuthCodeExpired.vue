<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import Banner from '@/components/ui/Banner.vue'

const { t } = useI18n()
const authStore = useAuthStore()

const redirectUri = computed(() => authStore.authorizeParams?.redirectUri || '')

const handleRedirect = () => {
  if (redirectUri.value) {
    window.location.href = redirectUri.value
  }
}

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <Banner type="error" :text="t('authCodeExpired.msg')" />

    <SecondaryButton
      v-if="redirectUri"
      :title="t('authCodeExpired.redirect')"
      @click="handleRedirect"
    />
  </AuthLayout>
</template>
