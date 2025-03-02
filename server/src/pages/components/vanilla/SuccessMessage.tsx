export interface SuccessMessageProps {
  message: string;
}

const SuccessMessage = ({ message }: SuccessMessageProps) => {
  return (
    <p className='text-green text-semibold text-lg'>
      {message}
    </p>
  )
}

export default SuccessMessage
