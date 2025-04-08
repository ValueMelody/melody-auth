import Spinner from './Spinner'

export interface PrimaryButtonProps {
  title: string;
  className?: string;
  type: 'submit' | 'button';
  onClick?: (e: Event) => void;
  isLoading?: boolean;
}

const PrimaryButton = ({
  title, className, type, onClick, isLoading,
}: PrimaryButtonProps) => {
  return (
    <button
      className={`flex items-center justify-center cursor-pointer p-2 bg-primaryButtonColor text-primaryButtonLabelColor border border-primaryButtonBorderColor rounded-lg font-medium text-base ${className ?? ''}`}
      type={type}
      disabled={isLoading}
      onClick={onClick}
    >
      {title}
      {isLoading && (
        <span className='ml-2'>
          <Spinner />
        </span>
      )}
    </button>
  )
}

export default PrimaryButton
