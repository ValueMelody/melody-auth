<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

interface Props {
  googleClientId: string
}

const props = defineProps<Props>()
const { locale } = useI18n()
const authStore = useAuthStore()

const params = computed(() => authStore.authorizeParams)

interface GoogleCredentialResponse {
  credential: string
  select_by: string
  client_id: string
}

const handleGoogleSignIn = async (response: GoogleCredentialResponse) => {
  try {
    if (!params.value) return

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/identity/v1/authorize-google'

    const fields = {
      credential: response.credential,
      client_id: params.value.clientId,
      redirect_uri: params.value.redirectUri,
      response_type: params.value.responseType,
      state: params.value.state,
      code_challenge: params.value.codeChallenge ?? '',
      code_challenge_method: params.value.codeChallengeMethod ?? '',
      scope: params.value.scope ?? '',
      org: params.value.org ?? '',
      policy: params.value.policy ?? '',
      locale: locale.value,
    }

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  } catch {
    authStore.setSubmitError('Authentication failed')
  }
}

onMounted(() => {
  if (!props.googleClientId) return

  ;(window as any).handleGoogleSignIn = handleGoogleSignIn

  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  document.head.appendChild(script)
})

onUnmounted(() => {
  ;(window as any).handleGoogleSignIn = undefined
})
</script>

<template>
  <div v-if="googleClientId" class="flex flex-row justify-center">
    <div
      id="g_id_onload"
      :data-client_id="googleClientId"
      data-auto_prompt="false"
      data-callback="handleGoogleSignIn"
    />
    <div
      class="g_id_signin"
      data-type="standard"
      data-size="large"
      data-width="260"
      data-theme="outline"
      data-text="sign_in_with"
      :data-locale="locale"
      data-shape="rectangular"
      data-logo_alignment="left"
    />
  </div>
</template>
