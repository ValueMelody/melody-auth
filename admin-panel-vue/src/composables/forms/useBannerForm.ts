import { reactive, computed, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppBanner, PostAppBannerReq } from '@/api/types'

export interface BannerFormState extends PostAppBannerReq {
  type: string
  text: string
  locales: { locale: string; value: string }[]
  appIds: number[]
  isActive: boolean
}

export function useBannerForm(banner?: Ref<AppBanner | undefined>) {
  const { t } = useI18n()

  const form = reactive<BannerFormState>({
    type: 'INFO',
    text: '',
    locales: [],
    appIds: [],
    isActive: true,
  })

  const errors = computed(() => ({
    type: form.type.trim() ? undefined : t('common.fieldIsRequired'),
  }))

  const isValid = computed(() => !Object.values(errors.value).some(Boolean))

  watch(
    () => banner?.value,
    (newBanner) => {
      if (newBanner) {
        form.type = newBanner.type
        form.text = newBanner.text || ''
        form.locales = newBanner.locales
          ? newBanner.locales.map((l) => ({ locale: l.locale, value: l.value }))
          : []
        form.appIds = newBanner.appIds ? [...newBanner.appIds] : []
        form.isActive = newBanner.isActive
      }
    },
    { immediate: true }
  )

  const reset = () => {
    form.type = 'INFO'
    form.text = ''
    form.locales = []
    form.appIds = []
    form.isActive = true
  }

  return { form, errors, isValid, reset }
}
