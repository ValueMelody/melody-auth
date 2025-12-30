import { ref, computed } from 'vue'
import type { ScopeDetail, PostScopeReq, PutScopeReq } from '@/api/types'

interface LocaleValue { locale: string; value: string }

export function useScopeForm(initial?: ScopeDetail) {
  const name = ref(initial?.name || '')
  const type = ref<'spa' | 's2s'>(initial?.type || 'spa')
  const note = ref(initial?.note || '')
  const locales = ref<LocaleValue[]>(
    initial?.locales?.map(l => ({ locale: l.locale, value: l.value })) || []
  )

  const isValid = computed(() => name.value.trim() !== '')

  function toCreatePayload(): PostScopeReq {
    return {
      name: name.value,
      type: type.value,
      note: note.value || undefined,
      locales: locales.value.filter(l => l.value)
    }
  }

  function toUpdatePayload(): PutScopeReq {
    return {
      name: name.value,
      note: note.value || undefined,
      locales: locales.value.filter(l => l.value)
    }
  }

  return { name, type, note, locales, isValid, toCreatePayload, toUpdatePayload }
}
