const SubmitButton = ({ title }: {
  title: string;
}) => {
  return (
    <button
      id='submit-button'
      class='button mt-4'
      type='submit'
    >
      {title}
    </button>
  )
}

export default SubmitButton
