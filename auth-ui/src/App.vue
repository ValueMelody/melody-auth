<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import { useBrandingStore } from '@/stores/branding'
import { apiRequest } from '@/api/auth'
import { IdentityRoute } from '@/api/types'
import type { InitialProps } from '@/api/types'

const authStore = useAuthStore()
const localeStore = useLocaleStore()
const brandingStore = useBrandingStore()
const { locale } = useI18n()
const isInitializing = ref(true)

const fetchInitialProps = async () => {
  try {
    const url = IdentityRoute.AuthorizeView + window.location.search
    const response = await apiRequest<InitialProps>(url)
    authStore.setInitialProps(response)
    if (response.branding) {
      brandingStore.setBranding(response.branding)
    }
    if (response.logoUrl) {
      brandingStore.setLogoUrl(response.logoUrl)
    }
  } catch (error) {
    console.error('Failed to fetch initial props:', error)
  } finally {
    isInitializing.value = false
  }
}

onMounted(() => {
  authStore.parseUrlParams()
  brandingStore.applyBranding()
  fetchInitialProps()
})

watch(
  () => localeStore.locale,
  (newLocale) => {
    locale.value = newLocale
  },
  { immediate: true }
)
</script>

<template>
  <RouterView />
</template>
