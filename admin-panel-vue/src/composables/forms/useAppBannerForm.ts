import { ref, computed } from 'vue'
import type { AppBanner, PostAppBannerReq, PutAppBannerReq } from '@/api/types'

interface LocaleValue { locale: string; value: string }

export function useAppBannerForm(initial?: AppBanner) {
  const type = ref<string>(initial?.type || 'info')
  const text = ref(initial?.text || '')
  const isActive = ref(initial?.isActive ?? true)
  const appIds = ref<number[]>(initial?.appIds || [])
  const locales = ref<LocaleValue[]>(
    initial?.locales?.map(l => ({ locale: l.locale, value: l.value })) || []
  )

  const isValid = computed(() => type.value.trim() !== '')

  function toCreatePayload(): PostAppBannerReq {
    return {
      type: type.value,
      text: text.value || undefined,
      locales: locales.value.filter(l => l.value)
    }
  }

  function toUpdatePayload(): PutAppBannerReq {
    return {
      type: type.value,
      text: text.value || undefined,
      isActive: isActive.value,
      appIds: appIds.value,
      locales: locales.value.filter(l => l.value)
    }
  }

  return {
    type,
    text,
    isActive,
    appIds,
    locales,
    isValid,
    toCreatePayload,
    toUpdatePayload
  }
}
