export interface FieldErrorProps {
  error?: string;
}

const FieldError = ({ error }: FieldErrorProps) => {
  if (!error) {
    return null
  }

  return (
    <p
      className='text-criticalIndicatorColor text-sm w-(--text-width)'
    >
      {error}
    </p>
  )
}

export default FieldError
