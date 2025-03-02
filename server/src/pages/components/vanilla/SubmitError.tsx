const SubmitError = ({ error }: {
  error: string | null;
}) => {
  if (!error) {
    return null
  }

  return (
    <p
      className='break-words mt-4 bg-criticalIndicatorColor text-white rounded-md py-2 px-4 w-(--text-width) self-center box-border'
    >
      {error}
    </p>
  )
}

export default SubmitError
