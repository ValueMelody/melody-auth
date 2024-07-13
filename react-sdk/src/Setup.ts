import { useEffect } from 'react'
import { useOauth } from './useOauth'

const Setup = () => {
  const { setup } = useOauth()

  useEffect(
    () => {
      setup()
    },
    [setup],
  )

  return null
}

export default Setup
