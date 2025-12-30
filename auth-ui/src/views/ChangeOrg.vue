<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View, IdentityRoute, type Locale } from '@/api/types'
import { apiRequest, parseAuthorizeFollowUpValues, handleAuthorizeStep } from '@/api/auth'
import { useSubmitError } from '@/composables/useSubmitError'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'
import SuccessMessage from '@/components/ui/SuccessMessage.vue'
import Spinner from '@/components/ui/Spinner.vue'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { getSubmitError } = useSubmitError()

interface Org {
  id: number
  name: string
  slug: string
}

const orgs = ref<Org[]>([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const isSuccess = ref(false)

const submitError = computed(() => authStore.submitError)

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

const fetchOrgs = async () => {
  isLoading.value = true

  try {
    if (!authStore.followUpParams) {
      throw new Error('No follow-up params available')
    }

    const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)

    const response = await apiRequest<{ orgs: Org[] }>(IdentityRoute.ChangeOrg, {
      method: 'GET',
      headers: {
        'x-code': baseValues.code || '',
        'x-locale': locale.value,
        'x-org': baseValues.org || '',
      },
    })

    orgs.value = response.orgs || []
  } catch (error) {
    const errorMessage = getSubmitError(error as Error)
    authStore.setSubmitError(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const selectOrg = async (orgSlug: string) => {
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
    }>(IdentityRoute.ChangeOrg, {
      method: 'POST',
      body: JSON.stringify({
        ...baseValues,
        org: orgSlug,
      }),
    })

    isSuccess.value = true
    handleAuthorizeStep(response, locale.value as Locale, onSwitchView)
  } catch (error) {
    const errorMessage = getSubmitError(error as Error)
    authStore.setSubmitError(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const handleRedirectBack = () => {
  if (!authStore.followUpParams) return

  const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)
  const redirectUri = authStore.authorizeParams?.redirectUri || ''

  if (redirectUri) {
    const queryString = `?state=${authStore.authorizeParams?.state || ''}&code=${baseValues.code}&locale=${locale.value}&org=${baseValues.org || ''}`
    window.location.href = `${redirectUri}${queryString}`
  }
}

onMounted(() => {
  authStore.parseUrlParams()
  fetchOrgs()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('switchOrg.title')" />

    <div v-if="isLoading" class="flex justify-center py-8">
      <Spinner />
    </div>

    <template v-else>
      <SuccessMessage v-if="isSuccess" :message="t('switchOrg.success')" />

      <section class="flex flex-col gap-2 w-full">
        <SecondaryButton
          v-for="org in orgs"
          :key="org.id"
          :title="org.name"
          :disabled="isSubmitting"
          @click="selectOrg(org.slug)"
        />
      </section>

      <SubmitError :error="submitError" />

      <SecondaryButton
        :title="t('switchOrg.redirect')"
        @click="handleRedirectBack"
      />
    </template>
  </AuthLayout>
</template>
