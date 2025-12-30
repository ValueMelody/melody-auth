<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PrimaryButton from './PrimaryButton.vue'

export interface RecoveryCodeContainerProps {
  recoveryCode?: string | null
  copyTitle?: string
  downloadTitle?: string
  title?: string
  desc?: string
}

const props = withDefaults(defineProps<RecoveryCodeContainerProps>(), {
  recoveryCode: null,
  copyTitle: undefined,
  downloadTitle: undefined,
  title: undefined,
  desc: undefined,
})

const { t } = useI18n()

const getCopyTitle = () => props.copyTitle ?? t('common.copy')
const getDownloadTitle = () => props.downloadTitle ?? t('common.download')
const getTitle = () => props.title ?? t('recoveryCode.title')
const getDesc = () => props.desc ?? t('recoveryCode.description')

const handleCopyRecoveryCode = async () => {
  if (props.recoveryCode) {
    await navigator.clipboard.writeText(props.recoveryCode)
  }
}

const handleDownloadRecoveryCode = () => {
  if (!props.recoveryCode) return

  const content = `${getTitle()}: ${props.recoveryCode}\n\n${getDesc()}`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'recovery-code-melody-auth.txt'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
</script>

<template>
  <template v-if="recoveryCode">
    <p class="w-[var(--text-width)] text-center border border-[lightGray] p-4 rounded-md">
      {{ recoveryCode }}
    </p>
    <section class="flex gap-4">
      <PrimaryButton
        type="button"
        class="w-full"
        :title="getCopyTitle()"
        @click="handleCopyRecoveryCode"
      />
      <PrimaryButton
        type="button"
        class="w-full"
        :title="getDownloadTitle()"
        @click="handleDownloadRecoveryCode"
      />
    </section>
  </template>
</template>
