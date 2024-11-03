const SubmitError = ({
  show = false,
  message,
}: {
  show?: boolean;
  message?: string;
}) => {
  return (
    <div
      id='submit-error'
      class={`alert mt-2 ${show ? '' : 'hidden'}`}
    >
      {message ?? ''}
    </div>
  )
}

export default SubmitError
