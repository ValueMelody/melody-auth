const FieldError = ({ error }: {
  error?: string;
}) => {
  return (
    <p
      className='text-red-600 mt-2'
      data-testid='fieldError'>{error}
    </p>
  )
}

export default FieldError
