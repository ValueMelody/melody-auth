import { Select } from 'flowbite-react'
import { ClientType } from 'shared'

export const ClientTypeSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}>
      <option disabled></option>
      <option value={ClientType.SPA}>SPA</option>
      <option value={ClientType.S2S}>S2S</option>
    </Select>
  )
}

export default ClientTypeSelector
