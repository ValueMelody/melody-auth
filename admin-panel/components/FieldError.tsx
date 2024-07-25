const FieldError = ({ error }: {
  error?: string;
}) => {
  return (
    <p className='text-red-600 mt-2'>{error}</p>
  )
}

export default FieldError
