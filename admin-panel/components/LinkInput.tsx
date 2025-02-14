import {
  TextInput, TextInputProps,
} from 'flowbite-react'
import { ChangeEvent } from 'react'

interface LinkInputProps extends Omit<TextInputProps, 'type' | 'onChange'> {
  onChange: (value: string) => void;
}

const LinkInput = ({
  onChange, value, ...props
}: LinkInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <TextInput
      type='url'
      value={value || ''}
      onChange={handleChange}
      placeholder='https://'
      {...props}
    />
  )
}

export default LinkInput
