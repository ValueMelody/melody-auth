<script setup lang="ts">
import FieldLabel from './FieldLabel.vue'
import FieldError from './FieldError.vue'
import FieldInput from './FieldInput.vue'

export interface EmailFieldProps {
  label: string
  required?: boolean
  type?: 'email' | 'text' | 'password'
  name: string
  autoComplete?: string
  modelValue?: string
  disabled?: boolean
  error?: string
  locked?: boolean
}

withDefaults(defineProps<EmailFieldProps>(), {
  required: false,
  type: 'email',
  autoComplete: undefined,
  modelValue: '',
  disabled: false,
  error: undefined,
  locked: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  unlock: []
}>()

const handleUpdate = (value: string) => {
  emit('update:modelValue', value)
}

const handleUnlock = () => {
  emit('unlock')
}
</script>

<template>
  <section class="flex flex-col gap-2">
    <FieldLabel :label="label" :required="required" :field-name="name" />
    <div class="flex items-center">
      <FieldInput
        class="pr-[26px]"
        :type="type"
        :name="name"
        :auto-complete="autoComplete"
        :model-value="modelValue"
        :disabled="disabled || locked"
        @update:model-value="handleUpdate"
      />
      <!-- Edit icon button (unlock) -->
      <button
        v-if="locked"
        type="button"
        class="relative ml-[-25px] cursor-pointer"
        aria-label="Edit email"
        @click="handleUnlock"
      >
        <svg
          class="w-[18px] h-[18px]"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
          />
        </svg>
      </button>
    </div>
    <FieldError :error="error" />
  </section>
</template>
