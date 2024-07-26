import {
  useEffect, useState,
} from 'react'

const useSignalValue = (signal) => {
  const [value, setValue] = useState(signal.value)

  useEffect(
    () => {
      const unsubscribe = signal.subscribe((newValue) => {
        setValue(newValue)
      })

      return () => {
        unsubscribe()
      }
    },
    [signal],
  )

  return value
}

export default useSignalValue
