export interface ViewTitleProps {
  title: string;
}

const ViewTitle = ({ title }: ViewTitleProps) => {
  return <h1 className='w-(--text-width) text-center text-lg font-bold'>{title}</h1>
}

export default ViewTitle
