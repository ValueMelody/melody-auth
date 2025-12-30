<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View } from '@/api/types'
import { useConsentForm } from '@/composables/useConsentForm'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'
import Spinner from '@/components/ui/Spinner.vue'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

const {
  consentInfo,
  isLoading,
  isAccepting,
  handleAccept,
  handleDecline,
} = useConsentForm(onSwitchView)

const submitError = computed(() => authStore.submitError)

const getScopeText = (scope: { name: string; locales: { locale: string; value: string }[] }) => {
  const localized = scope.locales.find((l) => l.locale === locale.value)
  return localized?.value || scope.name
}

const filteredScopes = computed(() => {
  if (!consentInfo.value?.scopes) return []
  return consentInfo.value.scopes.filter(
    (scope) => scope.name !== 'openid' && scope.name !== 'offline_access'
  )
})

onMounted(() => {
  authStore.parseUrlParams()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('consent.title')" />

    <div v-if="isLoading" class="flex justify-center py-8">
      <Spinner />
    </div>

    <template v-else-if="consentInfo">
      <p class="w-full text-center">
        {{ consentInfo.appName }} {{ t('consent.requestAccess') }}
      </p>

      <section class="flex pl-2 pr-2 w-full">
        <section class="p-4 border rounded-md w-full">
          <ul>
            <li
              v-for="scope in filteredScopes"
              :key="scope.id"
              class="w-full p-2"
            >
              {{ getScopeText(scope) }}
            </li>
          </ul>
        </section>
      </section>

      <SubmitError :error="submitError" />

      <section class="mt-4 flex gap-8 w-full justify-center">
        <SecondaryButton
          :title="t('consent.decline')"
          @click="handleDecline"
        />
        <SecondaryButton
          :title="t('consent.accept')"
          :is-loading="isAccepting"
          @click="handleAccept"
        />
      </section>
    </template>
  </AuthLayout>
</template>
