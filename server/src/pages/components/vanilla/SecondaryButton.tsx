import Spinner from './Spinner'

export interface SecondaryButtonProps {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const SecondaryButton = ({
  onClick, title, disabled, isLoading,
}: SecondaryButtonProps) => {
  return (
    <button
      type='button'
      className='max-w-(--text-width) flex items-center justify-center cursor-pointer text-base font-medium rounded-lg text-center border border-secondaryButtonBorderColor text-secondaryButtonLabelColor bg-secondaryButtonColor'
      onClick={onClick}
      disabled={disabled || isLoading}
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

export default SecondaryButton
