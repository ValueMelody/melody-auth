<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { View, IdentityRoute, type Locale } from '@/api/types'
import { apiRequest, parseAuthorizeFollowUpValues } from '@/api/auth'
import { usePasskey } from '@/composables/usePasskey'
import { useSubmitError } from '@/composables/useSubmitError'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import ViewTitle from '@/components/ui/ViewTitle.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import SubmitError from '@/components/ui/SubmitError.vue'
import SuccessMessage from '@/components/ui/SuccessMessage.vue'
import Spinner from '@/components/ui/Spinner.vue'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { getSubmitError } = useSubmitError()

interface PasskeyInfo {
  id: string
  counter: number
}

const passkeys = ref<PasskeyInfo[]>([])
const isLoading = ref(true)
const isRemoving = ref(false)
const removeSuccess = ref(false)
const enrollSuccess = ref(false)

const onSwitchView = (view: View) => {
  authStore.setCurrentView(view)
  router.push({ name: view })
}

const { isEnrolling, enrollPasskey } = usePasskey(onSwitchView)

const submitError = computed(() => authStore.submitError)

const fetchPasskeys = async () => {
  isLoading.value = true

  try {
    if (!authStore.followUpParams) {
      throw new Error('No follow-up params available')
    }

    const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)

    const response = await apiRequest<{ passkeys: PasskeyInfo[] }>(IdentityRoute.ManagePasskey, {
      method: 'GET',
      headers: {
        'x-code': baseValues.code || '',
        'x-locale': locale.value,
        'x-org': baseValues.org || '',
      },
    })

    passkeys.value = response.passkeys || []
  } catch (error) {
    const errorMessage = getSubmitError(error as Error)
    authStore.setSubmitError(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const removePasskey = async (passkeyId: string) => {
  isRemoving.value = true
  authStore.clearSubmitError()
  removeSuccess.value = false

  try {
    if (!authStore.followUpParams) {
      throw new Error('No follow-up params available')
    }

    const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)

    await apiRequest(IdentityRoute.ManagePasskey, {
      method: 'DELETE',
      body: JSON.stringify({
        ...baseValues,
        passkeyId,
      }),
    })

    removeSuccess.value = true
    await fetchPasskeys()
  } catch (error) {
    const errorMessage = getSubmitError(error as Error)
    authStore.setSubmitError(errorMessage)
  } finally {
    isRemoving.value = false
  }
}

const handleEnroll = async () => {
  enrollSuccess.value = false
  await enrollPasskey()
  enrollSuccess.value = true
  await fetchPasskeys()
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
  fetchPasskeys()
})
</script>

<template>
  <AuthLayout>
    <ViewTitle :title="t('managePasskey.title')" />

    <div v-if="isLoading" class="flex justify-center py-8">
      <Spinner />
    </div>

    <template v-else>
      <section v-if="passkeys.length > 0" class="w-full">
        <div
          v-for="passkey in passkeys"
          :key="passkey.id"
          class="flex justify-between items-center p-3 border rounded-md mb-2"
        >
          <div>
            <p class="font-medium">{{ t('managePasskey.active') }}</p>
            <p class="text-sm">{{ t('managePasskey.loginCount') }}: {{ passkey.counter }}</p>
          </div>
          <button
            type="button"
            class="text-red-500 text-sm underline"
            :disabled="isRemoving"
            @click="removePasskey(passkey.id)"
          >
            {{ t('managePasskey.remove') }}
          </button>
        </div>
      </section>

      <p v-else class="text-sm text-center">{{ t('managePasskey.noPasskey') }}</p>

      <SuccessMessage v-if="removeSuccess" :message="t('managePasskey.removeSuccess')" />
      <SuccessMessage v-if="enrollSuccess" :message="t('managePasskey.enrollSuccess')" />

      <SubmitError :error="submitError" />

      <PrimaryButton
        :title="t('managePasskey.enroll')"
        :is-loading="isEnrolling"
        @click="handleEnroll"
      />

      <SecondaryButton
        :title="t('managePasskey.redirect')"
        @click="handleRedirectBack"
      />
    </template>
  </AuthLayout>
</template>
