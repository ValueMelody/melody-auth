import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BrandingConfig } from '@/api/types'

const DEFAULT_BRANDING: BrandingConfig = {
  layoutColor: '#ffffff',
  labelColor: '#1f2937',
  primaryButtonColor: '#3b82f6',
  primaryButtonLabelColor: '#ffffff',
  primaryButtonBorderColor: '#3b82f6',
  secondaryButtonColor: '#ffffff',
  secondaryButtonLabelColor: '#1f2937',
  secondaryButtonBorderColor: '#d1d5db',
  criticalIndicatorColor: '#ef4444',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  logoUrl: '',
}

export const useBrandingStore = defineStore('branding', () => {
  const config = ref<BrandingConfig>({ ...DEFAULT_BRANDING })
  const isLoaded = ref(false)

  function applyBranding() {
    const root = document.documentElement
    root.style.setProperty('--color-layoutColor', config.value.layoutColor)
    root.style.setProperty('--color-labelColor', config.value.labelColor)
    root.style.setProperty('--color-primaryButtonColor', config.value.primaryButtonColor)
    root.style.setProperty('--color-primaryButtonLabelColor', config.value.primaryButtonLabelColor)
    root.style.setProperty('--color-primaryButtonBorderColor', config.value.primaryButtonBorderColor)
    root.style.setProperty('--color-secondaryButtonColor', config.value.secondaryButtonColor)
    root.style.setProperty('--color-secondaryButtonLabelColor', config.value.secondaryButtonLabelColor)
    root.style.setProperty('--color-secondaryButtonBorderColor', config.value.secondaryButtonBorderColor)
    root.style.setProperty('--color-criticalIndicatorColor', config.value.criticalIndicatorColor)
    root.style.setProperty('--font-default', config.value.fontFamily)
    document.body.style.backgroundColor = config.value.layoutColor
    document.body.style.color = config.value.labelColor
  }

  function setBranding(branding: Partial<BrandingConfig>) {
    config.value = {
      ...DEFAULT_BRANDING,
      ...branding,
    }
    applyBranding()
    isLoaded.value = true
  }

  function setLogoUrl(logoUrl: string) {
    config.value.logoUrl = logoUrl
  }

  return {
    config,
    isLoaded,
    setBranding,
    setLogoUrl,
    applyBranding,
  }
})
