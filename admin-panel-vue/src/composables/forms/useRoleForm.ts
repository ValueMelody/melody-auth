import { ref, computed } from 'vue'
import type { Role, PostRoleReq, PutRoleReq } from '@/api/types'

export function useRoleForm(initial?: Role) {
  const name = ref(initial?.name || '')
  const note = ref(initial?.note || '')

  const isValid = computed(() => name.value.trim() !== '')

  function toCreatePayload(): PostRoleReq {
    return { name: name.value, note: note.value || undefined }
  }

  function toUpdatePayload(): PutRoleReq {
    return { name: name.value, note: note.value || undefined }
  }

  return { name, note, isValid, toCreatePayload, toUpdatePayload }
}
