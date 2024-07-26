import { Alert } from 'flowbite-react'
import useSignalValue from 'app/useSignalValue'
import { errorSignal } from 'signals'

const SubmitError = () => {
  const error = useSignalValue(errorSignal)

  if (!error) return null

  return (
    <Alert
      color='failure'
      className='mt-6'>
      {error}
    </Alert>
  )
}

export default SubmitError
