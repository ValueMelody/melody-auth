export interface SuccessMessageProps {
  message: string;
}

const SuccessMessage = ({ message }: SuccessMessageProps) => {
  return (
    <p className='w-(--text-width) text-green text-semibold text-lg text-center'>
      {message}
    </p>
  )
}

export default SuccessMessage
