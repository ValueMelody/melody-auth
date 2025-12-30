import { ref, computed } from 'vue'
import type { UserDetail, PutUserReq } from '@/api/types'

export function useUserForm(initial?: UserDetail) {
  const firstName = ref(initial?.firstName || '')
  const lastName = ref(initial?.lastName || '')
  const isActive = ref(initial?.isActive ?? true)
  const locale = ref(initial?.locale || 'en')
  const roles = ref<string[]>(initial?.roles || [])
  const attributes = ref<Record<string, string | null>>(initial?.attributes || {})

  const isValid = computed(() => true)

  function toUpdatePayload(): PutUserReq {
    return {
      firstName: firstName.value || undefined,
      lastName: lastName.value || undefined,
      isActive: isActive.value,
      locale: locale.value,
      roles: roles.value,
      attributes: attributes.value
    }
  }

  return {
    firstName,
    lastName,
    isActive,
    locale,
    roles,
    attributes,
    isValid,
    toUpdatePayload
  }
}
