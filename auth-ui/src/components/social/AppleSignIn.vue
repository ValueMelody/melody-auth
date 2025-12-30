<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { locale } = useI18n()
const authStore = useAuthStore()

const params = computed(() => authStore.authorizeParams)
const initialProps = computed(() => authStore.initialProps)

const APPLE_SCOPE = 'name email'
const scriptLoaded = ref(false)

const socialSignInState = () => {
  if (!params.value) return ''
  return JSON.stringify({
    clientId: params.value.clientId,
    redirectUri: params.value.redirectUri,
    responseType: params.value.responseType,
    state: params.value.state,
    codeChallenge: params.value.codeChallenge ?? '',
    codeChallengeMethod: params.value.codeChallengeMethod ?? '',
    scope: params.value.scope ?? '',
    org: params.value.org ?? '',
    policy: params.value.policy ?? '',
    locale: locale.value,
  })
}

const initAppleAuth = () => {
  if (initialProps.value?.appleClientId && scriptLoaded.value && 'AppleID' in window) {
    const AppleID = (window as any).AppleID
    AppleID.auth.init({
      clientId: initialProps.value.appleClientId,
      scope: APPLE_SCOPE,
      redirectURI: `${window.location.origin}/identity/v1/authorize-apple`,
      state: socialSignInState(),
      usePopup: false,
    })
  }
}

watch([() => initialProps.value?.appleClientId, scriptLoaded], () => {
  initAppleAuth()
})

onMounted(() => {
  if (!initialProps.value?.appleClientId) return

  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
  script.async = true
  script.onload = () => {
    scriptLoaded.value = true
  }
  document.head.appendChild(script)
})
</script>

<template>
  <div v-if="initialProps?.appleClientId" id="apple-login-btn" class="w-[260px] h-[40px] mx-auto">
    <div
      id="appleid-signin"
      data-color="black"
      data-border="true"
      data-type="sign in"
    />
  </div>
</template>
