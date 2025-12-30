import { ref, computed } from 'vue'
import type { Org, PostOrgReq, PutOrgReq } from '@/api/types'

export function useOrgForm(initial?: Org) {
  const name = ref(initial?.name || '')
  const slug = ref(initial?.slug || '')
  const allowPublicRegistration = ref(initial?.allowPublicRegistration ?? false)
  const onlyUseForBrandingOverride = ref(initial?.onlyUseForBrandingOverride ?? false)
  const companyLogoUrl = ref(initial?.companyLogoUrl || '')
  const companyEmailLogoUrl = ref(initial?.companyEmailLogoUrl || '')
  const fontFamily = ref(initial?.fontFamily || '')
  const fontUrl = ref(initial?.fontUrl || '')
  const layoutColor = ref(initial?.layoutColor || '')
  const labelColor = ref(initial?.labelColor || '')
  const primaryButtonColor = ref(initial?.primaryButtonColor || '')
  const primaryButtonLabelColor = ref(initial?.primaryButtonLabelColor || '')
  const primaryButtonBorderColor = ref(initial?.primaryButtonBorderColor || '')
  const secondaryButtonColor = ref(initial?.secondaryButtonColor || '')
  const secondaryButtonLabelColor = ref(initial?.secondaryButtonLabelColor || '')
  const secondaryButtonBorderColor = ref(initial?.secondaryButtonBorderColor || '')
  const criticalIndicatorColor = ref(initial?.criticalIndicatorColor || '')
  const termsLink = ref(initial?.termsLink || '')
  const privacyPolicyLink = ref(initial?.privacyPolicyLink || '')
  const customDomain = ref(initial?.customDomain || '')

  const isValid = computed(() => {
    return name.value.trim() !== '' && slug.value.trim() !== ''
  })

  function toCreatePayload(): PostOrgReq {
    return {
      name: name.value,
      slug: slug.value,
      allowPublicRegistration: allowPublicRegistration.value,
      onlyUseForBrandingOverride: onlyUseForBrandingOverride.value
    }
  }

  function toUpdatePayload(): PutOrgReq {
    return {
      name: name.value,
      slug: slug.value,
      allowPublicRegistration: allowPublicRegistration.value,
      onlyUseForBrandingOverride: onlyUseForBrandingOverride.value,
      companyLogoUrl: companyLogoUrl.value,
      companyEmailLogoUrl: companyEmailLogoUrl.value,
      fontFamily: fontFamily.value,
      fontUrl: fontUrl.value,
      layoutColor: layoutColor.value,
      labelColor: labelColor.value,
      primaryButtonColor: primaryButtonColor.value,
      primaryButtonLabelColor: primaryButtonLabelColor.value,
      primaryButtonBorderColor: primaryButtonBorderColor.value,
      secondaryButtonColor: secondaryButtonColor.value,
      secondaryButtonLabelColor: secondaryButtonLabelColor.value,
      secondaryButtonBorderColor: secondaryButtonBorderColor.value,
      criticalIndicatorColor: criticalIndicatorColor.value,
      termsLink: termsLink.value,
      privacyPolicyLink: privacyPolicyLink.value,
      customDomain: customDomain.value || null
    }
  }

  return {
    name,
    slug,
    allowPublicRegistration,
    onlyUseForBrandingOverride,
    companyLogoUrl,
    companyEmailLogoUrl,
    fontFamily,
    fontUrl,
    layoutColor,
    labelColor,
    primaryButtonColor,
    primaryButtonLabelColor,
    primaryButtonBorderColor,
    secondaryButtonColor,
    secondaryButtonLabelColor,
    secondaryButtonBorderColor,
    criticalIndicatorColor,
    termsLink,
    privacyPolicyLink,
    customDomain,
    isValid,
    toCreatePayload,
    toUpdatePayload
  }
}
