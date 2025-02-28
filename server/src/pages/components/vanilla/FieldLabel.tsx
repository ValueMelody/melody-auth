export interface FieldLabelProps { label: string; required: boolean; fieldName: string }

const FieldLabel = ({
  label, required, fieldName,
}: FieldLabelProps) => {
  return (
    <label
      className='font-medium w-(--text-width)'
      for={`form-${fieldName}`}
    >
      {label}
      {required && <span className='text-criticalIndicatorColor ml-2'>*</span>}
    </label>
  )
}

export default FieldLabel
