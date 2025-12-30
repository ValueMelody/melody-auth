import { ref, computed } from 'vue'
import type { AppDetail, PostAppReq, PutAppReq } from '@/api/types'

export function useAppForm(initial?: AppDetail) {
  const name = ref(initial?.name || '')
  const type = ref<'spa' | 's2s'>(initial?.type || 'spa')
  const scopes = ref<string[]>(initial?.scopes || [])
  const redirectUris = ref<string[]>(initial?.redirectUris || [''])
  const isActive = ref(initial?.isActive ?? true)
  const useSystemMfaConfig = ref(initial?.useSystemMfaConfig ?? true)
  const requireEmailMfa = ref(initial?.requireEmailMfa ?? false)
  const requireOtpMfa = ref(initial?.requireOtpMfa ?? false)
  const requireSmsMfa = ref(initial?.requireSmsMfa ?? false)
  const allowEmailMfaAsBackup = ref(initial?.allowEmailMfaAsBackup ?? false)

  const isValid = computed(() => {
    return name.value.trim() !== '' && 
           redirectUris.value.filter(u => u.trim()).length > 0
  })

  function toCreatePayload(): PostAppReq {
    return {
      name: name.value,
      type: type.value,
      scopes: scopes.value,
      redirectUris: redirectUris.value.filter(u => u.trim())
    }
  }

  function toUpdatePayload(): PutAppReq {
    return {
      name: name.value,
      isActive: isActive.value,
      scopes: scopes.value,
      redirectUris: redirectUris.value.filter(u => u.trim()),
      useSystemMfaConfig: useSystemMfaConfig.value,
      requireEmailMfa: requireEmailMfa.value,
      requireOtpMfa: requireOtpMfa.value,
      requireSmsMfa: requireSmsMfa.value,
      allowEmailMfaAsBackup: allowEmailMfaAsBackup.value
    }
  }

  function addRedirectUri() {
    redirectUris.value.push('')
  }

  function removeRedirectUri(index: number) {
    redirectUris.value.splice(index, 1)
  }

  return {
    name,
    type,
    scopes,
    redirectUris,
    isActive,
    useSystemMfaConfig,
    requireEmailMfa,
    requireOtpMfa,
    requireSmsMfa,
    allowEmailMfaAsBackup,
    isValid,
    toCreatePayload,
    toUpdatePayload,
    addRedirectUri,
    removeRedirectUri
  }
}
