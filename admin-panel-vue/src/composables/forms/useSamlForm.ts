import { ref, computed } from 'vue'
import type { SamlIdp, PostSamlIdpReq, PutSamlIdpReq } from '@/api/types'

export function useSamlForm(initial?: SamlIdp) {
  const name = ref(initial?.name || '')
  const isActive = ref(initial?.isActive ?? true)
  const userIdAttribute = ref(initial?.userIdAttribute || '')
  const emailAttribute = ref(initial?.emailAttribute || '')
  const firstNameAttribute = ref(initial?.firstNameAttribute || '')
  const lastNameAttribute = ref(initial?.lastNameAttribute || '')
  const metadata = ref(initial?.metadata || '')

  const isValid = computed(() => {
    return name.value.trim() !== '' && 
           userIdAttribute.value.trim() !== '' && 
           metadata.value.trim() !== ''
  })

  function toCreatePayload(): PostSamlIdpReq {
    return {
      name: name.value,
      userIdAttribute: userIdAttribute.value,
      emailAttribute: emailAttribute.value || null,
      firstNameAttribute: firstNameAttribute.value || null,
      lastNameAttribute: lastNameAttribute.value || null,
      metadata: metadata.value
    }
  }

  function toUpdatePayload(): PutSamlIdpReq {
    return {
      isActive: isActive.value,
      userIdAttribute: userIdAttribute.value,
      emailAttribute: emailAttribute.value || undefined,
      firstNameAttribute: firstNameAttribute.value || undefined,
      lastNameAttribute: lastNameAttribute.value || undefined,
      metadata: metadata.value
    }
  }

  return {
    name,
    isActive,
    userIdAttribute,
    emailAttribute,
    firstNameAttribute,
    lastNameAttribute,
    metadata,
    isValid,
    toCreatePayload,
    toUpdatePayload
  }
}
