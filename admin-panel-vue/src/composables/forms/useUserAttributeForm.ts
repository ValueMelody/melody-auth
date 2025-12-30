import { ref, computed } from 'vue'
import type { UserAttribute, PostUserAttributeReq, PutUserAttributeReq } from '@/api/types'

interface LocaleValue { locale: string; value: string }

export function useUserAttributeForm(initial?: UserAttribute) {
  const name = ref(initial?.name || '')
  const locales = ref<LocaleValue[]>(initial?.locales || [])
  const includeInSignUpForm = ref(initial?.includeInSignUpForm ?? false)
  const requiredInSignUpForm = ref(initial?.requiredInSignUpForm ?? false)
  const includeInIdTokenBody = ref(initial?.includeInIdTokenBody ?? false)
  const includeInUserInfo = ref(initial?.includeInUserInfo ?? false)
  const unique = ref(initial?.unique ?? false)

  const isValid = computed(() => name.value.trim() !== '')

  function toCreatePayload(): PostUserAttributeReq {
    return {
      name: name.value,
      locales: locales.value.filter(l => l.value),
      includeInSignUpForm: includeInSignUpForm.value,
      requiredInSignUpForm: requiredInSignUpForm.value,
      includeInIdTokenBody: includeInIdTokenBody.value,
      includeInUserInfo: includeInUserInfo.value,
      unique: unique.value
    }
  }

  function toUpdatePayload(): PutUserAttributeReq {
    return {
      name: name.value,
      locales: locales.value.filter(l => l.value),
      includeInSignUpForm: includeInSignUpForm.value,
      requiredInSignUpForm: requiredInSignUpForm.value,
      includeInIdTokenBody: includeInIdTokenBody.value,
      includeInUserInfo: includeInUserInfo.value,
      unique: unique.value
    }
  }

  return {
    name,
    locales,
    includeInSignUpForm,
    requiredInSignUpForm,
    includeInIdTokenBody,
    includeInUserInfo,
    unique,
    isValid,
    toCreatePayload,
    toUpdatePayload
  }
}
