<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

interface Props {
  facebookClientId: string
}

const props = defineProps<Props>()
const { locale } = useI18n()
const authStore = useAuthStore()

const params = computed(() => authStore.authorizeParams)

const FACEBOOK_SCOPE = 'public_profile'

const fbLocale = computed(() => {
  switch (locale.value) {
    case 'fr':
      return 'fr_FR'
    case 'pt':
      return 'pt_BR'
    case 'en':
    default:
      return 'en_US'
  }
})

interface FacebookAuthResponse {
  authResponse?: {
    accessToken: string
    userID: string
  }
  status: string
}

const handleFacebookSignIn = async (response: FacebookAuthResponse) => {
  if (response.status !== 'connected' || !response.authResponse) {
    authStore.setSubmitError('Authentication failed')
    return
  }

  try {
    if (!params.value) return

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/identity/v1/authorize-facebook'

    const fields = {
      access_token: response.authResponse.accessToken,
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

const checkLoginState = () => {
  const FB = (window as any).FB
  if (FB) {
    FB.getLoginStatus((response: FacebookAuthResponse) => {
      handleFacebookSignIn(response)
    })
  }
}

onMounted(() => {
  if (!props.facebookClientId) return

  ;(window as any).handleFacebookSignIn = handleFacebookSignIn
  ;(window as any).checkLoginState = checkLoginState

  ;(window as any).fbAsyncInit = function () {
    const FB = (window as any).FB
    FB.init({
      appId: props.facebookClientId,
      cookie: true,
      xfbml: true,
      version: 'v20.0',
    })
    FB.AppEvents.logPageView()
  }

  const script = document.createElement('script')
  script.id = 'facebook-jssdk'
  script.src = `https://connect.facebook.net/${fbLocale.value}/sdk.js`
  script.async = true
  script.defer = true

  const firstScript = document.getElementsByTagName('script')[0]
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript)
  } else {
    document.head.appendChild(script)
  }
})

onUnmounted(() => {
  ;(window as any).handleFacebookSignIn = undefined
  ;(window as any).checkLoginState = undefined
  ;(window as any).fbAsyncInit = undefined
})
</script>

<template>
  <div v-if="facebookClientId" id="facebook-login-btn" class="flex flex-row justify-center">
    <fb:login-button
      :scope="FACEBOOK_SCOPE"
      data-size="Large"
      data-width="260"
      data-use-continue-as="false"
      onlogin="checkLoginState();"
    />
  </div>
</template>
