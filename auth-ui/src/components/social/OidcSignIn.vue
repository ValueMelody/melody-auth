<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import type { OidcProvider } from '@/api/types'

interface OidcConfig {
  name: string
  config: {
    clientId: string
    authorizeEndpoint: string
  }
}

interface Props {
  providers: OidcProvider[]
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const authStore = useAuthStore()

const params = computed(() => authStore.authorizeParams)

const codeChallenge = ref('')
const oidcCodeVerifier = ref('')
const oidcConfigs = ref<OidcConfig[]>([])

const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const socialSignInState = computed(() => {
  if (!params.value) return {}
  return {
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
  }
})

const getOidcAuthUrl = (config: OidcConfig) => {
  const stateWithVerifier = JSON.stringify({
    ...socialSignInState.value,
    codeVerifier: oidcCodeVerifier.value,
  })
  const redirectUri = encodeURIComponent(
    `${window.location.origin}/identity/v1/authorize-oidc/${config.name}`
  )
  return `${config.config.authorizeEndpoint}?client_id=${config.config.clientId}&state=${encodeURIComponent(stateWithVerifier)}&scope=openid&redirect_uri=${redirectUri}&response_type=code&code_challenge=${codeChallenge.value}&code_challenge_method=S256`
}

const fetchOidcConfigs = async () => {
  if (!props.providers || props.providers.length === 0) return

  try {
    const response = await fetch('/identity/v1/authorize-oidc-configs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providers: props.providers.map((p) => p.id),
      }),
    })

    if (response.ok) {
      const data = await response.json()
      oidcConfigs.value = data.configs || []
    }
  } catch (error) {
    console.error('Failed to fetch OIDC configs:', error)
  }
}

onMounted(async () => {
  if (!props.providers || props.providers.length === 0) return

  oidcCodeVerifier.value = generateCodeVerifier()
  codeChallenge.value = await generateCodeChallenge(oidcCodeVerifier.value)

  await fetchOidcConfigs()
})
</script>

<template>
  <template v-if="providers && providers.length > 0">
    <div
      v-for="config in oidcConfigs"
      :key="config.name"
      class="flex flex-row justify-center"
    >
      <a
        :id="`oidc-${config.name}`"
        class="cursor-pointer w-[240px] h-[40px] text-center p-2 bg-[var(--color-primaryButtonColor)] text-[var(--color-primaryButtonLabelColor)] border border-[var(--color-primaryButtonBorderColor)] rounded-lg font-medium text-base"
        :href="getOidcAuthUrl(config)"
      >
        {{ t('signIn.oidcSignIn') }}{{ config.name }}
      </a>
    </div>
  </template>
</template>
