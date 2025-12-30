<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FieldLabel from './FieldLabel.vue'
import FieldError from './FieldError.vue'

export interface CodeInputProps {
  label?: string
  required?: boolean
  modelValue: string[]
  error?: string
}

const props = withDefaults(defineProps<CodeInputProps>(), {
  label: undefined,
  required: false,
  error: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const length = 6
const inputRefs = ref<(HTMLInputElement | null)[]>([])

const setInputRef = (el: HTMLInputElement | null, index: number) => {
  inputRefs.value[index] = el
}

const focusInput = (index: number) => {
  if (index >= 0 && index < length && inputRefs.value[index]) {
    inputRefs.value[index]?.focus()
  }
}

const updateCodeAtIndex = (index: number, value: string) => {
  const newCode = [...props.modelValue]
  newCode[index] = value
  emit('update:modelValue', newCode)
}

const handleInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')

  if (!value) {
    updateCodeAtIndex(index, '')
    return
  }

  if (value.length === 1) {
    updateCodeAtIndex(index, value)
    if (index < length - 1) {
      focusInput(index + 1)
    }
  } else {
    // Multiple digits entered (e.g., from paste or autocomplete)
    const digits = value.split('')
    const newCode = [...props.modelValue]

    let currentIndex = index
    for (let i = 0; i < digits.length && currentIndex < length; i++) {
      newCode[currentIndex] = digits[i]
      currentIndex++
    }

    emit('update:modelValue', newCode)

    const nextIndex = Math.min(index + digits.length, length - 1)
    focusInput(nextIndex)
  }
}

const handleKeyDown = (event: KeyboardEvent, index: number) => {
  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
  ]

  if (!allowedKeys.includes(event.key) && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
    return
  }

  const target = event.currentTarget as HTMLInputElement

  switch (event.key) {
    case 'Backspace':
      if (target.value === '' && index > 0) {
        focusInput(index - 1)
      }
      break
    case 'ArrowLeft':
      if (index > 0) {
        event.preventDefault()
        focusInput(index - 1)
      }
      break
    case 'ArrowRight':
      if (index < length - 1) {
        event.preventDefault()
        focusInput(index + 1)
      }
      break
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')
  const digits = pastedData?.replace(/[^0-9]/g, '').split('') ?? []

  const newCode = [...props.modelValue]

  for (let i = 0; i < digits.length && i < length; i++) {
    newCode[i] = digits[i]
  }

  emit('update:modelValue', newCode)

  const nextEmptyIndex = newCode.findIndex((digit) => digit === '')
  const indexToFocus = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
  focusInput(indexToFocus)
}

onMounted(() => {
  // Auto-focus first input on mount
  focusInput(0)
})
</script>

<template>
  <section class="flex flex-col gap-2">
    <FieldLabel v-if="label" field-name="code" :label="label" :required="required" />
    <section class="flex gap-2">
      <input
        v-for="(_, index) in length"
        :key="index"
        :ref="(el) => setInputRef(el as HTMLInputElement, index)"
        :value="modelValue[index] || ''"
        type="text"
        maxlength="1"
        inputmode="numeric"
        pattern="[0-9]*"
        :aria-label="`Code input ${index + 1}`"
        class="bg-white border border-[lightGray] text-center rounded-lg w-[42px] h-[42px] code-input"
        @input="handleInput($event, index)"
        @keydown="handleKeyDown($event, index)"
        @paste="handlePaste"
      />
    </section>
    <FieldError v-if="error" :error="error" />
  </section>
</template>
