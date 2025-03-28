import { Alert } from 'components/ui/alert'
import useSignalValue from 'app/useSignalValue'
import { errorSignal } from 'signals'

const SubmitError = () => {
  const error = useSignalValue(errorSignal)

  if (!error) return null

  return (
    <Alert
      variant='destructive'
      className='mt-6'
    >
      {error}
    </Alert>
  )
}

export default SubmitError
