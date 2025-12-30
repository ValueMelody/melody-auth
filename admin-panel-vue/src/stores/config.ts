import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SystemConfig {
  [key: string]: string | boolean | string[]
}

export const useConfigStore = defineStore('config', () => {
  const configs = ref<SystemConfig | null>(null)
  const isLoading = ref(false)

  async function fetchConfig() {
    isLoading.value = true
    try {
      const response = await fetch('/api/info')
      if (response.ok) {
        configs.value = await response.json()
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    configs,
    isLoading,
    fetchConfig
  }
})
