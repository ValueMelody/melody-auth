import {
  describe, it, expect,
} from 'vitest'
import {
  ErrorType, handleError,
} from './frontend'

describe(
  'handleError',
  () => {
    it(
      'should return Unauthorized if error message includes "Unauthorized"',
      () => {
        const error = new Error('Unauthorized access detected')
        const result = handleError(error)
        expect(result).toBe(ErrorType.Unauthorized)
      },
    )

    it(
      'should return the provided fallback when error does not include "Unauthorized"',
      () => {
        const error = new Error('Some other error occurred')
        const fallback = 'Custom fallback error'
        const result = handleError(
          error,
          fallback,
        )
        expect(result).toBe(fallback)
      },
    )

    it(
      'should return Unknown if no fallback is provided and error does not include "Unauthorized"',
      () => {
        const error = new Error('Non-unauthorized error')
        const result = handleError(error)
        expect(result).toBe(ErrorType.Unknown)
      },
    )

    it(
      'should handle error as a string',
      () => {
        const error = 'Error: Unauthorized'
        const result = handleError(error)
        expect(result).toBe(ErrorType.Unauthorized)
      },
    )
  },
)
