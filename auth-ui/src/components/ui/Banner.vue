<script setup lang="ts">
import { computed } from 'vue'

export type BannerType = 'info' | 'warning' | 'success' | 'error'

export interface BannerProps {
  type: BannerType
  text: string
}

const props = defineProps<BannerProps>()

const alertClasses = computed(() => {
  switch (props.type) {
    case 'info':
      return 'text-blue-500'
    case 'warning':
      return 'text-yellow-500'
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    default:
      return ''
  }
})
</script>

<template>
  <div
    role="alert"
    :class="[
      'flex gap-2 items-start w-[var(--text-width)] rounded-lg border px-4 py-3 text-sm',
      alertClasses,
    ]"
  >
    <div class="min-w-6 min-h-6">
      <!-- Info Icon -->
      <svg
        v-if="type === 'info'"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>

      <!-- Warning Icon -->
      <svg
        v-else-if="type === 'warning'"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
        />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>

      <!-- Success Icon -->
      <svg
        v-else-if="type === 'success'"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>

      <!-- Error Icon -->
      <svg
        v-else-if="type === 'error'"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    </div>
    <div class="flex-1">
      {{ text }}
    </div>
  </div>
</template>
