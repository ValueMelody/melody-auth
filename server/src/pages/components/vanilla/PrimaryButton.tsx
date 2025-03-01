export interface PrimaryButtonProps {
  title: string;
  className?: string;
  type: 'submit' | 'button';
  onClick?: (e: Event) => void;
}

const PrimaryButton = ({
  title, className, type, onClick,
}: PrimaryButtonProps) => {
  return (
    <button
      className={`cursor-pointer p-2 bg-primaryButtonColor text-primaryButtonLabelColor border border-primaryButtonBorderColor rounded-lg font-medium text-base ${className ?? ''}`}
      type={type}
      onClick={onClick}
    >
      {title}
    </button>
  )
}

export default PrimaryButton
