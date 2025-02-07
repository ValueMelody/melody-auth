const SubmitButton = ({
  title, className,
}: {
  title: string;
  className?: string;
}) => {
  return (
    <button
      id='submit-button'
      class={`button mt-4 ${className}`}
      type='submit'
    >
      {title}
    </button>
  )
}

export default SubmitButton
