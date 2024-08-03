import { Select } from 'flowbite-react'
import { typeTool } from 'tools'

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
      <option value={typeTool.ClientType.SPA}>SPA</option>
      <option value={typeTool.ClientType.S2S}>S2S</option>
    </Select>
  )
}

export default ClientTypeSelector
