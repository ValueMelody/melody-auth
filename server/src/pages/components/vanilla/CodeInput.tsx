import {
  KeyboardEvent, ClipboardEvent, useRef,
} from 'hono/jsx'
import FieldLabel from './FieldLabel'
import FieldError from './FieldError'

export interface CodeInputProps {
  label?: string;
  required: boolean;
  code: string[];
  setCode: (code: string[]) => void;
  error?: string;
}

const CodeInput = ({
  label,
  required,
  code,
  setCode,
  error,
}: CodeInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const length = 6

  const focusInput = (index: number) => {
    if (index >= 0 && index < length && inputRefs.current && inputRefs.current[index]) {
      inputRefs.current[index]?.focus()
    }
  }

  const handleChange = (
    e: Event, index: number,
  ) => {
    const value = e.target && 'value' in e.target
      ? (e.target as HTMLInputElement).value.replace(
        /[^0-9]/g,
        '',
      )
      : ''

    if (!value) {
      updateCodeAtIndex(
        index,
        '',
      )
      return
    }

    if (value.length === 1) {
      // Single digit entered
      updateCodeAtIndex(
        index,
        value,
      )
      if (index < length - 1) {
        focusInput(index + 1)
      }
    } else {
      const digits = value.split('')
      const newCode = [...code]

      let currentIndex = index
      for (let i = 0; i < digits.length && currentIndex < length; i++) {
        newCode[currentIndex] = digits[i]
        currentIndex++
      }

      setCode(newCode)

      const nextIndex = Math.min(
        index + digits.length,
        length - 1,
      )
      focusInput(nextIndex)
    }
  }

  const updateCodeAtIndex = (
    index: number, value: string,
  ) => {
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
  }

  const handleKeyDown = (
    e: KeyboardEvent, index: number,
  ) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    ]

    if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      return
    }

    switch (e.key) {
    case 'Backspace':
      if (e.currentTarget && 'value' in e.currentTarget && e.currentTarget.value === '' && index > 0) {
        focusInput(index - 1)
      }
      break
    case 'ArrowLeft':
      if (index > 0) {
        e.preventDefault()
        focusInput(index - 1)
      }
      break
    case 'ArrowRight':
      if (index < length - 1) {
        e.preventDefault()
        focusInput(index + 1)
      }
      break
    default:
      break
    }
  }

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData?.getData('text')
    const digits = pastedData?.replace(
      /[^0-9]/g,
      '',
    ).split('') ?? []

    // Create a new code array with the pasted digits
    const newCode = [...code]

    // Fill as many inputs as we have digits
    for (let i = 0; i < digits.length && i < length; i++) {
      newCode[i] = digits[i]
    }

    setCode(newCode)

    const nextEmptyIndex = newCode.findIndex((digit) => digit === '')
    const indexToFocus = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
    focusInput(indexToFocus)
  }

  const inputClass = 'bg-white border border-lightGray text-center rounded-lg w-[42px] h-[42px]'

  return (
    <section className='flex flex-col gap-2'>
      {label && (
        <FieldLabel
          fieldName='code'
          label={label}
          required={required}
        />
      )}
      <section className='flex gap-2'>
        {Array.from(
          { length },
          (
            _, index,
          ) => (
            <input
              key={index}
              ref={(el: HTMLInputElement | null) => {
                if (inputRefs.current) {
                  inputRefs.current[index] = el
                }
              }}
              value={code[index] || ''}
              onChange={(e) => handleChange(
                e,
                index,
              )}
              onKeyDown={(e) => handleKeyDown(
                e,
                index,
              )}
              onPaste={handlePaste}
              className={`${inputClass} code-input`}
              type='text'
              maxLength={1}
              aria-label={`Code input ${index + 1}`}
              inputMode='numeric'
              pattern='[0-9]*'
            />
          ),
        )}
      </section>
      {error && (
        <FieldError
          error={error}
        />
      )}
    </section>
  )
}

export default CodeInput
