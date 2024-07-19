const FieldError = ({ id }: {
  id: string;
}) => {
  return (
    <p
      id={id}
      class='text-red hidden text-sm'>
    </p>
  )
}

export default FieldError
