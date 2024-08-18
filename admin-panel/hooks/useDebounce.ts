import {
  useEffect, useState,
} from 'react'

const useDebounce = (val: string) => {
  const [debounceValue, setDebounceValue] = useState(val)
  useEffect(
    () => {
      const handler = setTimeout(
        () => {
          setDebounceValue(val)
        },
        800,
      )

      return () => {
        clearTimeout(handler)
      }
    },
    [val],
  )
  return debounceValue
}

export default useDebounce
