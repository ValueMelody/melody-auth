export interface SecondaryButtonProps {
  onClick: () => void;
  title: string;
}

const SecondaryButton = ({
  onClick, title,
}: SecondaryButtonProps) => {
  return (
    <button
      type='button'
      className='cursor-pointer text-base font-medium rounded-lg text-center border border-secondaryButtonBorderColor text-secondaryButtonLabelColor bg-secondaryButtonColor'
      onClick={onClick}
    >
      {title}
    </button>
  )
}

export default SecondaryButton
