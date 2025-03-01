export interface SecondaryButtonProps {
  onClick: () => void;
  title: string;
  disabled?: boolean;
}

const SecondaryButton = ({
  onClick, title, disabled,
}: SecondaryButtonProps) => {
  return (
    <button
      type='button'
      className='cursor-pointer text-base font-medium rounded-lg text-center border border-secondaryButtonBorderColor text-secondaryButtonLabelColor bg-secondaryButtonColor'
      onClick={onClick}
      disabled={disabled}
    >
      {title}
    </button>
  )
}

export default SecondaryButton
