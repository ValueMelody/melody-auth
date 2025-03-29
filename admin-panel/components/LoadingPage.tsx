import { Spinner } from 'components/ui/spinner'

const LoadingPage = () => {
  return (
    <section className='flex flex-col justify-center items-center w-full h-screen'>
      <Spinner data-testid='spinner' />
    </section>
  )
}

export default LoadingPage
