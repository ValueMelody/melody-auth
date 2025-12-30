import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthorizeParams, FollowUpParams, InitialProps, AppBanner, View } from '@/api/types'

export const useAuthStore = defineStore('auth', () => {
  const authorizeParams = ref<AuthorizeParams | null>(null)
  const followUpParams = ref<FollowUpParams | null>(null)
  const initialProps = ref<InitialProps | null>(null)
  const currentView = ref<View | null>(null)
  const appBanners = ref<AppBanner[]>([])
  const isLoading = ref(false)
  const submitError = ref<string | null>(null)

  const hasAuthorizeParams = computed(() => authorizeParams.value !== null)
  const hasFollowUpParams = computed(() => followUpParams.value !== null)

  function setAuthorizeParams(params: AuthorizeParams) {
    authorizeParams.value = params
  }

  function setFollowUpParams(params: FollowUpParams) {
    followUpParams.value = params
  }

  function setInitialProps(props: InitialProps) {
    initialProps.value = props
  }

  function setCurrentView(view: View) {
    currentView.value = view
  }

  function setAppBanners(banners: AppBanner[]) {
    appBanners.value = banners
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setSubmitError(error: string | null) {
    submitError.value = error
  }

  function clearSubmitError() {
    submitError.value = null
  }

  function parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search)

    const clientId = urlParams.get('client_id')
    const redirectUri = urlParams.get('redirect_uri')
    const responseType = urlParams.get('response_type')
    const state = urlParams.get('state')
    const code = urlParams.get('code')
    const step = urlParams.get('step')
    const org = urlParams.get('org')
    const scope = urlParams.get('scope')
    const policy = urlParams.get('policy')
    const codeChallenge = urlParams.get('code_challenge')
    const codeChallengeMethod = urlParams.get('code_challenge_method')

    if (code) {
      setFollowUpParams({
        code,
        org: org ?? undefined,
      })
      if (step) {
        setCurrentView(step as View)
      }
    } else if (clientId && redirectUri && responseType && state) {
      setAuthorizeParams({
        clientId,
        redirectUri,
        responseType,
        state,
        org: org ?? undefined,
        scope: scope ?? undefined,
        policy: policy ?? undefined,
        codeChallenge: codeChallenge ?? undefined,
        codeChallengeMethod: codeChallengeMethod ?? undefined,
      })
    }
  }

  return {
    authorizeParams,
    followUpParams,
    initialProps,
    currentView,
    appBanners,
    isLoading,
    submitError,
    hasAuthorizeParams,
    hasFollowUpParams,
    setAuthorizeParams,
    setFollowUpParams,
    setInitialProps,
    setCurrentView,
    setAppBanners,
    setLoading,
    setSubmitError,
    clearSubmitError,
    parseUrlParams,
  }
})
