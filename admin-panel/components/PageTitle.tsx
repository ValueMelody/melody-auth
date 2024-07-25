import classNames from 'classnames'

const PageTitle = ({
  title,
  className,
}: {
  title: string;
  className?: string;
}) => {
  return (
    <h1
      className={classNames(
        'font-semibold text-lg',
        className,
      )}>{title}
    </h1>
  )
}

export default PageTitle
