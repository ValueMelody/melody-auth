const RequiredProperty = ({ title }: {
  title: string;
}) => {
  return (
    <div className='flex items-center gap-1'>
      {title}
      <span className='text-red-500 text-xl'>*</span>
    </div>
  )
}

export default RequiredProperty
