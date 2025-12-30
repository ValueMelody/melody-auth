<script setup lang="ts">
import { ref } from 'vue'
import FieldLabel from './FieldLabel.vue'
import FieldError from './FieldError.vue'
import FieldInput from './FieldInput.vue'

export interface PasswordFieldProps {
  label: string
  required?: boolean
  name: string
  autoComplete?: string
  modelValue?: string
  disabled?: boolean
  error?: string
}

withDefaults(defineProps<PasswordFieldProps>(), {
  required: false,
  autoComplete: undefined,
  modelValue: '',
  disabled: false,
  error: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleUpdate = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <section :id="`${name}-row`" class="flex flex-col gap-2">
    <FieldLabel :label="label" :required="required" :field-name="name" />
    <div class="flex items-center">
      <FieldInput
        :type="showPassword ? 'text' : 'password'"
        class="pr-[26px]"
        :name="name"
        :auto-complete="autoComplete"
        :model-value="modelValue"
        :disabled="disabled"
        @update:model-value="handleUpdate"
      />
      <!-- Eye icon (password visible) -->
      <button
        v-if="showPassword"
        type="button"
        class="relative ml-[-25px] cursor-pointer"
        aria-label="Hide password"
        @click="togglePassword"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-[18px] h-[18px]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>
      <!-- Eye slash icon (password hidden) -->
      <button
        v-else
        type="button"
        class="relative ml-[-25px] cursor-pointer"
        aria-label="Show password"
        @click="togglePassword"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-[18px] h-[18px]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.99 9.99 0 012.114-3.521M6.16 6.16a9.966 9.966 0 014.84-1.66c4.478 0 8.268 2.943 9.542 7a9.99 9.99 0 01-3.13 4.4M3 3l18 18"
          />
        </svg>
      </button>
    </div>
    <FieldError :error="error" />
  </section>
</template>
